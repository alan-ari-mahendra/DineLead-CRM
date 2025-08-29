import { getCookies } from "@/app/action";
import ScrapeDataTableComponent from "@/components/scrape-job/details/scrapeDataTableComponent";
import axios from "axios";
import { notFound } from "next/navigation";

const getScrapingJobs = async (scrapingJobId: String) => {
  try {
    const cookieString = await getCookies();
    const response = await axios.get(
      `${process.env.NEXTAUTH_URL}/api/scraping-job/${scrapingJobId}?limit=15`,
      {
        headers: {
          Cookie: cookieString,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch scraping jobs:", error);
    notFound();
  }
};

export default async function ScrapingJobDetails({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const data = await getScrapingJobs(slug);

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
