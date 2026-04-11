"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  Loader2,
  Plus,
  MapPin,
  Timer,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
} from "lucide-react";
import { ScrapingModal } from "@/components/modals/scraping-modal";
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
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, lastPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrapingModalOpen, setIsScrapingModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page") || 1);

  const fetchScrapingJobs = useCallback(async (pageNum: number = 1) => {
    try {
      const response = await fetch(`/api/scraping-job?page=${pageNum}&limit=10`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setJobs(data.data);
      setMeta(data.meta);
    } catch { toast.error("Failed to fetch scraping jobs"); }
    finally { setIsLoading(false); setIsRefreshing(false); }
  }, []);

  useEffect(() => { fetchScrapingJobs(page); }, [page, fetchScrapingJobs]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchScrapingJobs(page);
  }, [page, fetchScrapingJobs]);

  const handlePageChange = (newPage: number) => {
    router.push(`/scraping-jobs?page=${newPage}`);
  };

  useEffect(() => {
    const handleNewJob = () => handleRefresh();
    window.addEventListener("scraping-job-added", handleNewJob);
    return () => window.removeEventListener("scraping-job-added", handleNewJob);
  }, [handleRefresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing && !isLoading) fetchScrapingJobs(page);
    }, 30000);
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
    return new Date(date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "COMPLETED": return { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", label: "Completed" };
      case "RUNNING": return { icon: Play, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500 animate-pulse", label: "Running" };
      case "FAILED": return { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500", label: "Failed" };
      case "PENDING": return { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", label: "Pending" };
      default: return { icon: Clock, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", dot: "bg-gray-500", label: status };
    }
  };

  const runningJobs = jobs.filter(j => j.status === "RUNNING" || j.status === "PENDING");
  const completedJobs = jobs.filter(j => j.status === "COMPLETED" || j.status === "FAILED");

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Scraping Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {meta.total} total jobs · {runningJobs.length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsScrapingModalOpen(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Scrape
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing} className="shadow-sm">
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-lg font-medium text-gray-500">No scraping jobs yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Start by creating your first scraping job</p>
          <Button onClick={() => setIsScrapingModalOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-1.5" /> New Scrape
          </Button>
        </div>
      ) : (
        <>
          {/* Active Jobs */}
          {runningJobs.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Active</h2>
              <div className="space-y-3">
                {runningJobs.map((job) => {
                  const status = getStatusConfig(job.status);
                  return (
                    <Link key={job.id} href={`/scraping-jobs/${job.id}`} className="block group">
                      <div className={`bg-white rounded-xl border-2 ${status.border} p-5 hover:shadow-md transition-all`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg ${status.bg} flex items-center justify-center`}>
                            <status.icon className={`h-5 w-5 ${status.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {job.keyword}
                              </h3>
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                                <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3" /> {job.location}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" /> {formatDate(job.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Jobs */}
          {completedJobs.length > 0 && (
            <div>
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">History</h2>
              <div className="space-y-2">
                {completedJobs.map((job) => {
                  const status = getStatusConfig(job.status);
                  return (
                    <Link key={job.id} href={`/scraping-jobs/${job.id}`} className="block group">
                      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm hover:border-gray-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${status.bg} flex items-center justify-center flex-shrink-0`}>
                            <status.icon className={`h-4 w-4 ${status.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {job.keyword}
                            </h3>
                            <span className="text-xs text-gray-400">{job.location}</span>
                          </div>
                          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {formatDuration(job.createdAt, job.completedAt)}
                            </span>
                            <span>{formatDate(job.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            <span className="text-xs text-gray-500">{status.label}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {meta.lastPage > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-gray-400">
            Page {page} of {meta.lastPage} · {meta.total} jobs
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(meta.lastPage, 5) }, (_, i) => {
              let p: number;
              if (meta.lastPage <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= meta.lastPage - 2) p = meta.lastPage - 4 + i;
              else p = page - 2 + i;
              return (
                <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => handlePageChange(p)}
                  className={`h-8 w-8 p-0 text-xs ${p === page ? "bg-gray-900 text-white" : ""}`}>
                  {p}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page >= meta.lastPage} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ScrapingModal isOpen={isScrapingModalOpen} onClose={() => setIsScrapingModalOpen(false)} onJobAdded={handleRefresh} />
    </div>
  );
}

function ScrapingJobsLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scraping Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">Loading...</p>
        </div>
      </div>
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    </div>
  );
}

export default function ScrapingJobsPage() {
  return (
    <Suspense fallback={<ScrapingJobsLoading />}>
      <ScrapingJobsContent />
    </Suspense>
  );
}
