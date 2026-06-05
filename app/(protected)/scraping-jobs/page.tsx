"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
      case "COMPLETED": 
        return { icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100", dot: "bg-emerald-500", label: "Completed" };
      case "RUNNING": 
        return { icon: Play, color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-100", dot: "bg-sky-500 animate-pulse", label: "Running" };
      case "FAILED": 
        return { icon: XCircle, color: "text-red-700", bg: "bg-red-50", border: "border-red-100", dot: "bg-red-500", label: "Failed" };
      case "PENDING": 
        return { icon: Clock, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100", dot: "bg-amber-500", label: "Pending" };
      default: 
        return { icon: Clock, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-100", dot: "bg-gray-500", label: status };
    }
  };

  const runningJobs = jobs.filter(j => j.status === "RUNNING" || j.status === "PENDING");
  const completedJobs = jobs.filter(j => j.status === "COMPLETED" || j.status === "FAILED");

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-5 md:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Scraping Jobs</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {meta.total} total scraping tasks · {runningJobs.length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsScrapingModalOpen(true)}
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm h-8 px-3 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Scrape
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="shadow-sm border-gray-200 bg-white h-8 w-8 p-0"
          >
            {isRefreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-6 bg-gray-100 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 py-20 px-4 text-center max-w-lg mx-auto w-full">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-gray-800">No scraping jobs yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">Start by creating your first scraping task</p>
          <Button
            onClick={() => setIsScrapingModalOpen(true)}
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm h-9 px-4 text-sm font-semibold rounded-xl"
          >
            <Plus className="h-4 w-4 mr-1.5" /> New Scrape Task
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Active Jobs */}
          {runningJobs.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">Active tasks</h2>
              <div className="space-y-3">
                {runningJobs.map((job) => {
                  const status = getStatusConfig(job.status);
                  return (
                    <Link key={job.id} href={`/scraping-jobs/${job.id}`} className="block group">
                      <div className={cn(
                        "bg-white rounded-2xl border p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all duration-200",
                        "hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] border-emerald-100 hover:border-emerald-200"
                      )}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${status.bg} flex items-center justify-center flex-shrink-0`}>
                            <status.icon className={`h-5 w-5 ${status.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                                {job.keyword}
                              </h3>
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shadow-none",
                                status.color, status.bg, status.border
                              )}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                {status.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <MapPin className="h-3.5 w-3.5" /> {job.location}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="h-3.5 w-3.5" /> {formatDate(job.createdAt)}
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
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">History</h2>
              <div className="space-y-2.5">
                {completedJobs.map((job) => {
                  const status = getStatusConfig(job.status);
                  return (
                    <Link key={job.id} href={`/scraping-jobs/${job.id}`} className="block group">
                      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl ${status.bg} flex items-center justify-center flex-shrink-0`}>
                              <status.icon className={`h-4.5 w-4.5 ${status.color}`} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                                {job.keyword}
                              </h3>
                              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {job.location}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Timer className="h-3.5 w-3.5" />
                              {formatDuration(job.createdAt, job.completedAt)}
                            </span>
                            <span>{formatDate(job.createdAt)}</span>
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shadow-none",
                              status.color, status.bg, status.border
                            )}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {meta.lastPage > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-gray-400 font-medium">
            Showing Page <span className="font-semibold text-gray-700">{page}</span> of <span className="font-semibold text-gray-700">{meta.lastPage}</span> · {meta.total} tasks
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50 bg-white rounded-lg"
            >
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </Button>
            {Array.from({ length: Math.min(meta.lastPage, 5) }, (_, i) => {
              let p: number;
              if (meta.lastPage <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= meta.lastPage - 2) p = meta.lastPage - 4 + i;
              else p = page - 2 + i;
              const isCurrent = p === page;
              return (
                <Button
                  key={p}
                  variant={isCurrent ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(p)}
                  className={cn(
                    "h-8 w-8 p-0 text-xs font-semibold rounded-lg transition-all",
                    isCurrent
                      ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= meta.lastPage}
              className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50 bg-white rounded-lg"
            >
              <ChevronRight className="h-4 w-4 text-gray-500" />
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
