import ScrapeDataTableComponent from "@/components/scrape-job/details/scrapeDataTableComponent";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";

const getScrapingJobData = async (scrapingJobId: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  const scrapingJob = await prisma.scrapingJob.findUnique({
    where: { id: scrapingJobId },
  });

  if (!scrapingJob || scrapingJob.userId !== session.user.id) notFound();

  const limit = 15;
  const [data, total] = await Promise.all([
    prisma.scrapingData.findMany({
      where: { scrapingJobId },
      take: limit,
    }),
    prisma.scrapingData.count({ where: { scrapingJobId } }),
  ]);

  return {
    data,
    meta: {
      total,
      page: 1,
      lastPage: Math.ceil(total / limit),
    },
    isOnProgress: scrapingJob.status,
  };
};

export default async function ScrapingJobDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getScrapingJobData(slug);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Scraping Result
        </h1>
        <p className="text-gray-600">Clean Your Scraping Data</p>
      </div>

      <ScrapeDataTableComponent
        initialData={data.data}
        initialMeta={data.meta}
        jobId={slug}
        isOnProgress={data.isOnProgress}
      />
    </div>
  );
}
