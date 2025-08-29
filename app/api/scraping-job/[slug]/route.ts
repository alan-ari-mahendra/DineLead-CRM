import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Params {
  params: {
    slug: string;
  };
}

export async function GET(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { code: 401, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { slug } = params;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const keyword = searchParams.get("keyword") || "";
  const rating = searchParams.get("rating");
  const filters: any = {
    scrapingJobId: slug,
  };

  if (keyword) {
    filters.OR = [{ name: { contains: keyword, mode: "insensitive" } }];
  }

  if (rating && rating !== "all") {
    filters.rating = {
      gte: Number(rating),
    };
  }

  const total = await prisma.scrapingData.count({
    where: filters,
  });

  const scrapingJobData = await prisma.scrapingData.findMany({
    where: filters,
    skip,
    take: limit,
  });

  const scrapingJob = await prisma.scrapingJob.findUnique({
    where: {
      id: slug,
    },
  });

  return NextResponse.json({
    code: 200,
    message: "Scraping job data fetched successfully",
    data: scrapingJobData,
    isOnProgress: scrapingJob?.status,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    },
  });
}
