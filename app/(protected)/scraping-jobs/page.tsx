import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  Play,
  MoreHorizontal,
} from "lucide-react";
import OpenScrapingModalButton from "@/components/scrape-job/openScrapingModalButton";
import axios from "axios";
import { notFound } from "next/navigation";
import { getCookies } from "@/app/action";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const getScrapingJobs = async (page: number = 1, limit: number = 10) => {
  try {
    const cookieString = await getCookies();
    const response = await axios.get(
      `${process.env.NEXTAUTH_URL}/api/scraping-job?page=${page}&limit=${limit}`,
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

function formatDuration(start: string, end?: string | null) {
  if (!end) return "-";
  const diff = new Date(end).getTime() - new Date(start).getTime();
  if (diff <= 0) return "-";

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "RUNNING":
      return <Play className="h-4 w-4 text-blue-600" />;
    case "FAILED":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "PENDING":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "RUNNING":
      return "bg-blue-100 text-blue-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default async function ScrapingJobsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params?.page || 1);

  const { data: jobs, meta } = await getScrapingJobs(page, 10);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Scraping Jobs
          </h1>
          <p className="text-gray-600">
            Monitor and manage your data scraping operations.
          </p>
        </div>
        <OpenScrapingModalButton />
      </div>

      <div className="grid gap-4">
        {jobs.map((job: any) => (
          <Link
            key={job.id}
            href={`/scraping-jobs/${job.id}`}
            className="block"
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(job.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {job.keyword}
                      </h3>
                      <p className="text-sm text-gray-600">{job.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>

                    <div className="flex flex-col">
                      <div className="items-center flex-row flex gap-2">
                        <p className="text-xs text-gray-500 text-center">
                          Duration
                        </p>
                        <p className="text-sm font-medium text-gray-900 text-center">
                          {formatDuration(job.createdAt, job.completedAt)}
                        </p>
                      </div>

                      <div className="items-center flex-row flex gap-2">
                        <p className="text-xs text-gray-500 text-center">
                          Started
                        </p>
                        <p className="text-sm text-gray-900 text-center">
                          {formatDate(job.createdAt)}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuGroup>
                          <DropdownMenuItem asChild>
                            <Link href={`/scraping-jobs/${job.id}`}>Views</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {jobs.length < 1 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2h6v2m-7-8h8M5 7h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 
        2 0 01-2-2V9a2 2 0 012-2z"
              />
            </svg>
            <p className="text-lg font-medium">No Data To Display</p>
            <p className="text-sm text-gray-400">
              Try adjusting your filters or add new data.
            </p>
          </div>
        )}
      </div>

      {jobs.length > 0 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              {/* Previous */}
              <PaginationItem>
                <PaginationPrevious
                  href={`?page=${page - 1}`}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {/* Render page numbers */}
              {Array.from({ length: meta.lastPage }, (_, i) => i + 1).map(
                (p) => (
                  <PaginationItem key={p}>
                    <PaginationLink href={`?page=${p}`} isActive={p === page}>
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              {meta.lastPage > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  href={`?page=${page + 1}`}
                  className={
                    page >= meta.lastPage
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
