"use client";

import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  Play,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import OpenScrapingModalButton from "@/components/scrape-job/openScrapingModalButton";
import { useState, useEffect, useCallback } from "react";
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
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface ScrapingJob {
  id: string;
  keyword: string;
  location: string;
  status: string;
  createdAt: string;
  completedAt?: string | null;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
}

function ScrapingJobsContent() {
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page") || 1);

  // Fetch scraping jobs
  const fetchScrapingJobs = useCallback(async (pageNum: number = 1) => {
    try {
      const response = await fetch(
        `/api/scraping-job?page=${pageNum}&limit=10`
      );
      if (!response.ok) throw new Error("Failed to fetch scraping jobs");

      const data = await response.json();
      setJobs(data.data);
      setMeta(data.meta);
    } catch (error) {
      console.error("Failed to fetch scraping jobs:", error);
      toast.error("Failed to fetch scraping jobs");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchScrapingJobs(page);
  }, [page, fetchScrapingJobs]);

  // Refresh data (for new jobs)
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchScrapingJobs(page);
  }, [page, fetchScrapingJobs]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    router.push(`/scraping-jobs?page=${newPage}`);
  };

  // Listen for new scraping job events
  useEffect(() => {
    const handleNewJob = () => {
      // Refresh data when new job is added
      handleRefresh();
    };

    // Listen for custom event from scraping modal
    window.addEventListener("scraping-job-added", handleNewJob);

    return () => {
      window.removeEventListener("scraping-job-added", handleNewJob);
    };
  }, [handleRefresh]);

  // Auto-refresh every 30 seconds for real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Only auto-refresh if not currently refreshing and not on first load
      if (!isRefreshing && !isLoading) {
        fetchScrapingJobs(page);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [page, fetchScrapingJobs, isRefreshing, isLoading]);

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

  if (isLoading) {
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

        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <OpenScrapingModalButton />
        </div>
      </div>

      <div className="grid gap-4">
        {jobs.map((job: ScrapingJob) => (
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
                        <p className="text-sm font-medium text-gray-900 text-center">
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
                d="M9 17v-2h6v2m-7-8h8M5 7h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z"
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
                  onClick={() => handlePageChange(page - 1)}
                  className={
                    page <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* Render page numbers */}
              {Array.from({ length: meta.lastPage }, (_, i) => i + 1).map(
                (p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      onClick={() => handlePageChange(p)}
                      isActive={p === page}
                      className="cursor-pointer"
                    >
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
                  onClick={() => handlePageChange(page + 1)}
                  className={
                    page >= meta.lastPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
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

// Loading component for Suspense fallback
function ScrapingJobsLoading() {
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

      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function ScrapingJobsPage() {
  return (
    <Suspense fallback={<ScrapingJobsLoading />}>
      <ScrapingJobsContent />
    </Suspense>
  );
}
