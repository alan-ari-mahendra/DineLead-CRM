import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ScrapingData } from "@/lib/generated/prisma";

export async function GET(req: Request, res: Response) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { code: 401, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const keyword = searchParams.get("keyword") || "";
  const rating = searchParams.get("rating");
  const filters: any = {};

  if (keyword) {
    filters.OR = [{ name: { contains: keyword, mode: "insensitive" } }];
  }

  if (rating && rating !== "all") {
    filters.rating = {
      gte: Number(rating),
    };
  }

  const total = await prisma.lead.count({
    where: filters,
  });

  const leadData = await prisma.lead.findMany({
    where: filters,
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      source: true,
      rating: true,
      reviewCount: true,
      leadActivity: {
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          type: true,
          activity: true,
          description: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      leadNotes: {
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          notes: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      leadStatus: {
        select: {
          id: true,
          name: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
          website: true,
          industry: true,
        },
      },
    },
  });

  return NextResponse.json({
    code: 200,
    message: "Lead data fetched successfully",
    data: leadData,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    },
  });
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
    restaurants.map(async (restaurant: ScrapingData) => {
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
