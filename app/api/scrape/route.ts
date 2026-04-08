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

  const dbJob = await prisma.scrapingJob.findFirst({
    where: { jobId: parseInt(jobId), userId: session.user.id },
  });
  if (!dbJob) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

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
  const { location, radius, category } = await req.json();

  if (!location) {
    return NextResponse.json(
      { error: "location can't empty" },
      { status: 400 }
    );
  }

  try {
    const scrapeJob = await prisma.scrapingJob.create({
      data: {
        userId: session.user.id,
        keyword: category,
        location: location,
        status: "PENDING",
        jobId: 0,
      },
    });

    const job = await scrapeQueue.add(
      "search",
      {
        location,
        radius: radius || 1500,
        category: category,
        scrapeJobId: scrapeJob.id,
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
      }
    );

    await prisma.scrapingJob.update({
      where: { id: scrapeJob.id },
      data: { jobId: parseInt(job.id || "0") },
    });

    return NextResponse.json({ jobId: job.id, status: "queued" });
  } catch (error) {
    console.error("[/api/scrape] error:", error, (error as { meta?: unknown })?.meta);
    return NextResponse.json(
      { error: "Failed to enqueue scrape job" },
      { status: 500 }
    );
  }
}
