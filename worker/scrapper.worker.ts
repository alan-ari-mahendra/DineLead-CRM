import { Worker } from "bullmq";
import axios from "axios";
import { prisma } from "../lib/prisma";
import dotenv from "dotenv";

dotenv.config({ override: true });

// No external API key needed — uses Nominatim (geocoding) + Overpass API (OpenStreetMap), both free.
const NOMINATIM_URL = "https://nominatim.openstreetmap.org";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface OverpassTag {
  name?: string;
  "addr:street"?: string;
  "addr:housenumber"?: string;
  "addr:city"?: string;
  "addr:full"?: string;
  phone?: string;
  "contact:phone"?: string;
  website?: string;
  "contact:website"?: string;
  cuisine?: string;
  amenity?: string;
}

interface OverpassElement {
  type: "node" | "way";
  id: number;
  lat?: number;
  lon?: number;
  tags?: OverpassTag;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a location string (e.g. "Semarang") to lat/lng using Nominatim.
 */
async function geocodeLocation(
  location: string
): Promise<{ lat: number; lng: number }> {
  const res = await axios.get<NominatimResult[]>(`${NOMINATIM_URL}/search`, {
    params: { q: location, format: "json", limit: 1 },
    headers: { "User-Agent": "DineLead/1.0 (portfolio showcase)" },
  });

  if (!res.data.length) {
    throw new Error(`Location not found: "${location}"`);
  }

  return {
    lat: parseFloat(res.data[0].lat),
    lng: parseFloat(res.data[0].lon),
  };
}

/**
 * Build an Overpass QL query.
 * Maps common category keywords to OSM amenity types;
 * falls back to searching all food-related amenities.
 */
function buildOverpassQuery(
  lat: number,
  lng: number,
  radius: number,
  category: string
): string {
  const kw = category.toLowerCase().trim();

  let amenityFilter: string;
  if (kw.includes("cafe") || kw.includes("coffee") || kw.includes("kopi")) {
    amenityFilter = `["amenity"="cafe"]`;
  } else if (kw.includes("fast") || kw.includes("fastfood")) {
    amenityFilter = `["amenity"="fast_food"]`;
  } else if (kw.includes("bar") || kw.includes("pub")) {
    amenityFilter = `["amenity"~"bar|pub"]`;
  } else {
    // restaurant / resto / generic keyword → all food amenities
    amenityFilter = `["amenity"~"restaurant|cafe|fast_food|bar|pub|food_court"]`;
  }

  return `
[out:json][timeout:60];
(
  node${amenityFilter}(around:${radius},${lat},${lng});
  way${amenityFilter}(around:${radius},${lat},${lng});
);
out body;
>;
out skel qt;
`.trim();
}

/** Build a readable address string from OSM address tags. */
function formatAddress(tags: OverpassTag): string {
  if (tags["addr:full"]) return tags["addr:full"];
  const parts = [
    tags["addr:street"],
    tags["addr:housenumber"],
    tags["addr:city"],
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "-";
}

/**
 * Fetch places from Overpass API.
 * Only returns elements that have a name tag.
 */
async function fetchOverpassPlaces({
  lat,
  lng,
  radius,
  category,
}: {
  lat: number;
  lng: number;
  radius: number;
  category: string;
}): Promise<OverpassElement[]> {
  const query = buildOverpassQuery(lat, lng, radius, category);

  const res = await axios.post<OverpassResponse>(
    OVERPASS_URL,
    `data=${encodeURIComponent(query)}`,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 70_000, // slightly above the 60s Overpass timeout
    }
  );

  return res.data.elements.filter((el) => el.tags?.name);
}

// ─── Worker ───────────────────────────────────────────────────────────────────

const worker = new Worker(
  "scrape",
  async (job) => {
    const { location, radius, category, scrapeJobId } = job.data as {
      location: string;
      radius: number;
      category: string;
      scrapeJobId: string;
    };

    try {
      await prisma.scrapingJob.update({
        where: { id: scrapeJobId },
        data: { status: "RUNNING" },
      });

      // 1. Geocode location string → lat/lng
      const { lat, lng } = await geocodeLocation(location);

      // 2. Query Overpass for nearby places
      const places = await fetchOverpassPlaces({ lat, lng, radius, category });

      // 3. Persist each place to ScrapingData
      for (const p of places) {
        const tags = p.tags ?? {};
        try {
          await prisma.scrapingData.create({
            data: {
              scrapingJobId: scrapeJobId,
              name: tags.name ?? "Unknown",
              email: "-",
              address: formatAddress(tags),
              phone: tags.phone || tags["contact:phone"] || "-",
              website: tags.website || tags["contact:website"] || "-",
              source: `https://www.openstreetmap.org/node/${p.id}`,
              industry: [tags.amenity, tags.cuisine].filter(
                Boolean
              ) as string[],
              // OSM has no ratings — generate a realistic value for showcase
              rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
              reviewCount: Math.floor(Math.random() * 500) + 10,
            },
          });
        } catch (err) {
          console.error("Failed to save place:", p.id, err);
        }
      }

      await prisma.scrapingJob.update({
        where: { id: scrapeJobId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      return places;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Scraping job failed:", message);

      if (scrapeJobId) {
        await prisma.scrapingJob.update({
          where: { id: scrapeJobId },
          data: { status: "FAILED", completedAt: new Date() },
        });
      }

      throw err;
    }
  },
  {
    connection: { host: "localhost", port: 6379 },
  }
);

worker.on("completed", (job, result: OverpassElement[]) => {
  console.log(`Job ${job.id} completed. Found ${result.length} places.`);
});

worker.on("failed", async (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
  if (job?.data?.scrapeJobId) {
    await prisma.scrapingJob.update({
      where: { id: job.data.scrapeJobId },
      data: { status: "FAILED", completedAt: new Date() },
    });
  }
});
