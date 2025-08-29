import { Worker } from "bullmq";
import axios from "axios";
import { prisma } from "../lib/prisma";
import dotenv from "dotenv";

dotenv.config();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

async function fetchPlaceDetails(placeId: string) {
  const res = await axios.get(
    "https://maps.googleapis.com/maps/api/place/details/json",
    {
      params: {
        place_id: placeId,
        fields:
          "place_id,name,formatted_address,formatted_phone_number,website,opening_hours,rating,user_ratings_total,types,geometry,plus_code,url",
        key: GOOGLE_API_KEY,
      },
    }
  );

  return res.data.result;
}

async function fetchAllPlaces({ lat, lng, radius, category }: any) {
  let allResults: any[] = [];
  let nextPageToken: string | undefined;

  do {
    const res = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lng}`,
          radius: radius || 1500,
          keyword: category || "restaurant",
          key: GOOGLE_API_KEY,
          pagetoken: nextPageToken,
        },
      }
    );

    const data = res.data;
    if (data.results?.length) {
      for (const place of data.results) {
        const details = await fetchPlaceDetails(place.place_id);
        allResults.push({ ...place, details });
      }
    }

    nextPageToken = data.next_page_token;

    if (nextPageToken) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } while (nextPageToken);

  return allResults;
}

const worker = new Worker(
  "scrape",
  async (job) => {
    const { location, radius, category, scrapeJobId } = job.data;

    try {
      await prisma.scrapingJob.update({
        where: { id: scrapeJobId },
        data: { status: "RUNNING" },
      });
      const geoRes = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: { address: location, key: GOOGLE_API_KEY },
        }
      );

      const geoData = geoRes.data;
      if (!geoData.results?.length) {
        throw new Error(`Lokasi "${location}" tidak ditemukan`);
      }

      const { lat, lng } = geoData.results[0].geometry.location;
      const placesData = await fetchAllPlaces({ lat, lng, radius, category });

      console.log("Total found:", placesData.length);

      for (const p of placesData) {
        try {
          await prisma.scrapingData.create({
            data: {
              scrapingJobId: scrapeJobId,
              name: p.name,
              email: "-",
              address: p.vicinity,
              phone: p.details.formatted_phone_number || "-",
              website: p.details.website || "-",
              source: p.details.url || "-",
              industry: p.types,
              rating: p.rating,
              reviewCount: p.user_ratings_total,
            },
          });
        } catch (err) {
          console.error("Failed save place:", p.place_id, err);
        }
      }

      await prisma.scrapingJob.update({
        where: { id: scrapeJobId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      return placesData;
    } catch (err: any) {
      console.error("Scraping job failed:", err.message);

      if (job.data.scrapeJobId) {
        await prisma.scrapingJob.update({
          where: { id: job.data.scrapeJobId },
          data: {
            status: "FAILED",
            completedAt: new Date(),
          },
        });
      }

      throw err;
    }
  },
  { connection: { host: "localhost", port: 6379 } }
);

// event listener
worker.on("completed", (job, result) => {
  console.log(`Job ${job.id} selesai. Found ${result.length} places`);
});

worker.on("failed", async (job, err) => {
  console.error(`Job ${job?.id} gagal:`, err.message);
  if (job?.data?.scrapeJobId) {
    await prisma.scrapingJob.update({
      where: { id: job.data.scrapeJobId },
      data: { status: "FAILED", completedAt: new Date() },
    });
  }
});
