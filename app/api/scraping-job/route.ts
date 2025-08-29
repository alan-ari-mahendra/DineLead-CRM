import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { code: 401, message: "Unauthorized" },
      { status: 401 }
    );
  }
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    prisma.scrapingJob.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.scrapingJob.count(),
  ]);

  const lastPage = Math.ceil(total / limit);

  return NextResponse.json({
    code: 200,
    message: "Scraping jobs fetched successfully",
    data: jobs,
    meta: {
      total,
      page,
      lastPage,
    },
  });
}
