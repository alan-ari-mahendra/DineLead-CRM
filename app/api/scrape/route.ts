import { NextRequest, NextResponse } from "next/server";
import { Queue, Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const scrapeQueue = new Queue("scrape", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { code: 401, message: "Unauthorized" },
      { status: 401 }
    );
  }
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  if (!jobId)
    return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const job = await Job.fromId(scrapeQueue, jobId);
  return NextResponse.json({
    id: job?.id,
    status: await job?.getState(),
    result: job?.returnvalue,
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
  const { userId, location, radius, category } = await req.json();

  if (!location) {
    return NextResponse.json(
      { error: "location can't empty" },
      { status: 400 }
    );
  }

  const scrapeJob = await prisma.scrapingJob.create({
    data: {
      userId: userId,
      keyword: category,
      location: location,
      status: "PENDING",
      jobId: 0,
    },
  });

  const job = await scrapeQueue.add("search", {
    location,
    radius: radius || 1500,
    category: category,
    scrapeJobId: scrapeJob.id,
  });

  await prisma.scrapingJob.update({
    where: { id: scrapeJob.id },
    data: { jobId: parseInt(job.id || "0") },
  });

  return NextResponse.json({ jobId: job.id, status: "queued" });
}
