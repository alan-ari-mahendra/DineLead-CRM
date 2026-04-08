import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const rating = searchParams.get("rating") || "all";
    const industry = searchParams.get("industry") || "all";

    // Build where clause for filtering
    const where: NonNullable<Parameters<typeof prisma.lead.findMany>[0]>["where"] = {
      userId: session.user.id,
    };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { company: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Status filter
    if (status !== "all") {
      where.leadStatus = {
        name: status.charAt(0).toUpperCase() + status.slice(1),
      };
    }

    // Rating filter
    if (rating !== "all") {
      const ratingValue = parseInt(rating);
      where.rating = {
        gte: ratingValue,
      };
    }

    // Industry filter
    if (industry !== "all") {
      where.company = {
        industry: {
          has: industry,
        },
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.lead.count({ where });

    // Fetch restaurants with filters and pagination
    const restaurants = await prisma.lead.findMany({
      where,
      include: {
        leadStatus: true,
        company: true,
        leadNotes: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        leadActivity: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { id: "desc" },
      skip,
      take: limit,
    });

    // Format data for frontend
    const formattedRestaurants = restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone,
      address: restaurant.address,
      source: restaurant.source,
      rating: restaurant.rating,
      reviewCount: restaurant.reviewCount,
      leadStatus: restaurant.leadStatus,
      company: restaurant.company,
      leadNotes: restaurant.leadNotes,
      leadActivity: restaurant.leadActivity,
    }));

    // Get available industries for filter options
    const industries = await prisma.company.findMany({
      where: { userId: session.user.id },
      select: { industry: true },
    });

    const allIndustries = industries
      .flatMap((company) => company.industry)
      .filter((industry, index, arr) => arr.indexOf(industry) === index)
      .sort();

    // Get available statuses for filter options
    const statuses = await prisma.leadStatus.findMany({
      select: { name: true },
    });

    const availableStatuses = statuses.map((status) => status.name);

    return NextResponse.json({
      data: formattedRestaurants,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      filters: {
        availableStatuses,
        availableIndustries: allIndustries,
        availableRatings: [2, 3, 4, 5],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}

interface ProspectInput {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  source?: string;
  industry?: string[];
  rating?: number;
  reviewCount?: number;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { code: 401, message: "Unauthorized" },
      { status: 401 }
    );
  }
  const userId = session.user.id;
  const { restaurants } = (await req.json()) as { restaurants: ProspectInput[] };

  if (!Array.isArray(restaurants) || restaurants.length === 0) {
    return NextResponse.json(
      { code: 400, message: "restaurants is required" },
      { status: 400 }
    );
  }

  const leadStatus = await prisma.leadStatus.findUnique({
    where: { name: "Prospect" },
  });

  if (!leadStatus) {
    return NextResponse.json(
      {
        code: 500,
        message:
          "LeadStatus 'Prospect' not found. Run `pnpm seed` to seed lead statuses.",
      },
      { status: 500 }
    );
  }

  let successCount = 0;
  const errors: Array<{ id: string; name: string; error: string }> = [];

  for (const restaurant of restaurants) {
    try {
      // Verify the scraping data exists
      const check = await prisma.scrapingData.findUnique({
        where: { id: restaurant.id },
        select: { hasBeenAdded: true },
      });

      if (!check) {
        errors.push({
          id: restaurant.id,
          name: restaurant.name,
          error: "ScrapingData not found",
        });
        continue;
      }

      if (check.hasBeenAdded) {
        // Already promoted — skip silently (still counts as "success" for UX)
        successCount++;
        continue;
      }

      await prisma.$transaction(async (tx) => {
        // Company.name is globally unique → look up first.
        // If it exists for ANOTHER user, we suffix the name to avoid hijacking.
        const existingCompany = await tx.company.findUnique({
          where: { name: restaurant.name },
        });

        let company;
        if (existingCompany) {
          if (existingCompany.userId === userId) {
            // Same user — just reuse, do not change ownership / scrapingDataId
            company = existingCompany;
          } else {
            // Different user — create with a unique suffix to avoid global-unique conflict
            company = await tx.company.create({
              data: {
                name: `${restaurant.name} (${userId.slice(0, 6)})`,
                website: restaurant.website || "-",
                industry: restaurant.industry ?? [],
                userId,
                scrapingDataId: restaurant.id,
              },
            });
          }
        } else {
          company = await tx.company.create({
            data: {
              name: restaurant.name,
              website: restaurant.website || "-",
              industry: restaurant.industry ?? [],
              userId,
              scrapingDataId: restaurant.id,
            },
          });
        }

        // Find existing lead by (companyId, name) — manual upsert pattern
        // (avoids requiring composite-key support in the generated Prisma client)
        const existingLead = await tx.lead.findFirst({
          where: { companyId: company.id, name: restaurant.name },
        });

        const lead = existingLead
          ? await tx.lead.update({
              where: { id: existingLead.id },
              data: {
                // Do NOT reset leadStatusId — preserves existing status
                phone: restaurant.phone || "-",
                email: restaurant.email || "-",
                address: restaurant.address || "-",
                source: restaurant.source || "-",
                scrapingDataId: restaurant.id,
                rating: restaurant.rating ?? 0,
                reviewCount: restaurant.reviewCount ?? 0,
              },
            })
          : await tx.lead.create({
              data: {
                name: restaurant.name,
                companyId: company.id,
                userId,
                phone: restaurant.phone || "-",
                email: restaurant.email || "-",
                address: restaurant.address || "-",
                source: restaurant.source || "-",
                leadStatusId: leadStatus.id,
                scrapingDataId: restaurant.id,
                rating: restaurant.rating ?? 0,
                reviewCount: restaurant.reviewCount ?? 0,
              },
            });

        await tx.leadActivity.create({
          data: {
            leadId: lead.id,
            type: "User",
            activity: "Restaurant added to database",
            description: "Promoted from scraping result",
            userId,
          },
        });

        await tx.leadNotes.create({
          data: {
            leadId: lead.id,
            notes: "Restaurant added to database",
            userId,
          },
        });

        await tx.scrapingData.update({
          where: { id: restaurant.id },
          data: { hasBeenAdded: true },
        });
      });

      successCount++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[Prospect] Failed for "${restaurant.name}" (${restaurant.id}):`,
        message
      );
      errors.push({
        id: restaurant.id,
        name: restaurant.name,
        error: message,
      });
    }
  }

  return NextResponse.json({
    code: errors.length > 0 && successCount === 0 ? 500 : 200,
    message:
      errors.length === 0
        ? `Successfully prospected ${successCount} restaurant(s)`
        : `Prospected ${successCount}/${restaurants.length}, ${errors.length} error(s)`,
    data: { successCount, errors },
  });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json(
      { code: 401, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    const { leadId, status } = await req.json();
    if (!leadId || !status)
      return NextResponse.json(
        { code: 400, message: "leadId and status are required" },
        { status: 400 }
      );

    const [leadStatus, oldLead] = await Promise.all([
      prisma.leadStatus.findUnique({ where: { name: status } }),
      prisma.lead.findUnique({
        where: { id: leadId },
        include: { leadStatus: true },
      }),
    ]);
    if (!leadStatus)
      return NextResponse.json(
        { code: 400, message: "Invalid status" },
        { status: 400 }
      );
    if (!oldLead)
      return NextResponse.json(
        { code: 404, message: "Lead not found" },
        { status: 404 }
      );

    if (oldLead.leadStatusId === leadStatus.id) {
      return NextResponse.json({
        code: 200,
        message: "Lead status unchanged",
        data: oldLead,
      });
    }

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { leadStatusId: leadStatus.id },
      include: { leadStatus: true },
    });

    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "status",
        activity: `Status updated to ${lead.leadStatus.name}`,
        description: "",
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "Lead status updated successfully",
      data: lead,
    });
  } catch (err) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
