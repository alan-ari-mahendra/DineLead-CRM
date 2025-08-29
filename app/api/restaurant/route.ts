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
    const where: any = {
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
    console.error("Restaurant fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { code: 401, message: "Unauthorized" },
      { status: 401 }
    );
  }
  const { userId, restaurants } = await req.json();

  const leadStatus = await prisma.leadStatus.findUnique({
    where: { name: "Prospect" },
  });

  if (!leadStatus) {
    throw new Error("LeadStatus 'Prospect' tidak ditemukan");
  }

  await Promise.all(
    restaurants.map(async (restaurant: any) => {
      const check = await prisma.scrapingData.findUnique({
        where: { id: restaurant.id },
        select: { hasBeenAdded: true },
      });

      if (!check || check.hasBeenAdded) return;

      await prisma.$transaction(async (tx) => {
        const company = await tx.company.upsert({
          where: { name: restaurant.name },
          create: {
            name: restaurant.name,
            website: restaurant.website,
            industry: restaurant.industry,
            userId,
            scrapingDataId: restaurant.id,
          },
          update: {
            website: restaurant.website,
            industry: restaurant.industry,
            userId,
            scrapingDataId: restaurant.id,
          },
        });

        const lead = await tx.lead.upsert({
          where: { companyId: company.id, name: restaurant.name },
          create: {
            name: restaurant.name,
            companyId: company.id,
            userId,
            phone: restaurant.phone,
            email: restaurant.email,
            address: restaurant.address,
            source: restaurant.source,
            leadStatusId: leadStatus.id,
            scrapingDataId: restaurant.id,
            rating: restaurant.rating,
            reviewCount: restaurant.reviewCount,
          },
          update: {
            phone: restaurant.phone,
            email: restaurant.email,
            address: restaurant.address,
            source: restaurant.source,
            leadStatusId: leadStatus.id,
            scrapingDataId: restaurant.id,
            rating: restaurant.rating,
            reviewCount: restaurant.reviewCount,
          },
        });

        await tx.leadActivity.create({
          data: {
            leadId: lead.id,
            type: "User",
            activity: "Restaurant added to database",
            description: "Automatically scraped from Google Maps",
            userId: userId,
          },
        });
        await tx.leadNotes.create({
          data: {
            leadId: lead.id,
            notes: "Restaurant added to database",
            userId: userId,
          },
        });

        await tx.scrapingData.update({
          where: { id: restaurant.id },
          data: { hasBeenAdded: true },
        });
      });
    })
  );

  return NextResponse.json({
    code: 200,
    message: "Success to make it Prospect",
    data: null,
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
    console.error("Error updating lead status:", err);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
