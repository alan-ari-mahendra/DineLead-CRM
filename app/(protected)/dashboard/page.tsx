"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Phone,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  Plus,
  Database,
  FileText,
  Settings,
  Star,
  Clock,
  Activity,
  ArrowRight,
  Utensils,
  Target,
  BarChart3,
  Zap,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { ScrapingModal } from "@/components/modals/scraping-modal";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { dashboardData, isLoading, error, refreshData } = useDashboard();
  const [isScrapingModalOpen, setIsScrapingModalOpen] = useState(false);
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "prospect":
        return "bg-sky-50 text-sky-700 border-sky-100";
      case "contacted":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "closed":
        return "bg-emerald-50 text-emerald-800 border-emerald-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "call": return "📞";
      case "email": return "📧";
      case "meeting": return "🤝";
      case "follow_up": return "🔄";
      default: return "📝";
    }
  };

  const trendValue = (trend: string | undefined) => {
    if (!trend) return { value: 0, isPositive: true };
    const num = parseFloat(trend.replace("%", ""));
    return { value: Math.abs(num), isPositive: num >= 0 };
  };

  const stats = [
    {
      key: "totalRestaurants" as const,
      label: "Total Restaurants",
      icon: Building2,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      accentBar: "bg-slate-400",
    },
    {
      key: "prospects" as const,
      label: "Prospects",
      icon: Target,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      accentBar: "bg-sky-400",
    },
    {
      key: "contacted" as const,
      label: "Contacted",
      icon: Phone,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      accentBar: "bg-amber-400",
    },
    {
      key: "closed" as const,
      label: "Closed Deals",
      icon: CheckCircle,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
      accentBar: "bg-emerald-500",
    },
  ];

  /* ── Shared card class ── */
  const bentoCard = "bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200";

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-5 md:p-6 lg:p-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your restaurant pipeline at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsScrapingModalOpen(true)}
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm h-8 px-3 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Scrape Data
          </Button>
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="shadow-sm border-gray-200 h-8 w-8 p-0"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5 text-sm text-red-700 flex items-center gap-2">
          <span>Failed to load data.</span>
          <button onClick={refreshData} className="underline font-semibold">Retry</button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          ROW 1 — Stats Bento (4 equal cards)
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map((stat) => {
          const data = dashboardData?.stats[stat.key];
          const trend = trendValue(data?.trend);
          return (
            <div key={stat.key} className={`${bentoCard} p-5`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className={`h-4.5 w-4.5 ${stat.iconColor}`} style={{ width: '18px', height: '18px' }} />
                </div>
                {data && (
                  <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                    trend.isPositive
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-red-600 bg-red-50"
                  }`}>
                    {trend.isPositive
                      ? <TrendingUp className="h-3 w-3" />
                      : <TrendingDown className="h-3 w-3" />}
                    {trend.value}%
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 tabular-nums mb-0.5">
                {isLoading ? (
                  <div className="h-7 w-14 bg-gray-100 rounded-lg animate-pulse" />
                ) : (
                  data?.value.toLocaleString() ?? "0"
                )}
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{stat.label}</p>
              {/* Accent bottom bar */}
              <div className={`mt-4 h-0.5 w-8 ${stat.accentBar} rounded-full`} />
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
          ROW 2 — Bento Main Grid (12-col)
          [Left 4] [Center 4] [Right 4]
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-12 gap-4">

        {/* ── LEFT COLUMN (col-span-4) ── */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">

          {/* Conversion Rate */}
          <div className={`${bentoCard} p-6`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Conversion Rate</p>
              <BarChart3 className="h-4 w-4 text-gray-300" />
            </div>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-4xl font-bold text-gray-900">
                {isLoading ? (
                  <div className="h-10 w-16 bg-gray-100 rounded-lg animate-pulse inline-block" />
                ) : (
                  `${dashboardData?.summary.conversionRate ?? 0}%`
                )}
              </span>
              <span className="text-sm text-gray-400 mb-0.5">closed</span>
            </div>
            {dashboardData && (
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(dashboardData.summary.conversionRate, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Average Rating + Total Leads — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`${bentoCard} p-5`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Avg Rating</p>
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? (
                  <div className="h-8 w-10 bg-gray-100 rounded-lg animate-pulse" />
                ) : (
                  dashboardData?.summary.averageRating ?? "—"
                )}
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= Math.round(dashboardData?.summary.averageRating ?? 0)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className={`${bentoCard} p-5`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Leads</p>
                <Utensils className="h-3.5 w-3.5 text-gray-300" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? (
                  <div className="h-8 w-12 bg-gray-100 rounded-lg animate-pulse" />
                ) : (
                  dashboardData?.summary.totalLeads.toLocaleString() ?? "0"
                )}
              </div>
              <p className="text-[11px] text-gray-400">in database</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`${bentoCard} p-5`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Quick Actions</p>
              <Zap className="h-3.5 w-3.5 text-gray-300" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Restaurants", icon: Database, onClick: () => router.push("/restaurants"), color: "text-slate-600" },
                { label: "Export", icon: FileText, onClick: () => router.push("/export"), color: "text-sky-600" },
                { label: "Scrape", icon: Zap, onClick: () => setIsScrapingModalOpen(true), color: "text-emerald-700" },
                { label: "Settings", icon: Settings, onClick: () => router.push("/settings"), color: "text-gray-500" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all text-left group"
                >
                  <action.icon className={`h-4 w-4 ${action.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs font-semibold text-gray-600">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CENTER COLUMN — Recent Leads (col-span-4) ── */}
        <div className="col-span-12 lg:col-span-4">
          <div className={`${bentoCard} p-6 h-full flex flex-col`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Recent Leads</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Latest restaurant prospects</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 h-7 px-2 rounded-lg"
                onClick={() => router.push("/restaurants")}
              >
                View all
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            <div className="flex-1 space-y-1">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-1.5" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="h-5 w-16 bg-gray-100 rounded-full" />
                  </div>
                ))
              ) : dashboardData?.recentLeads && dashboardData.recentLeads.length > 0 ? (
                dashboardData.recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white text-xs font-bold">
                        {lead.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-emerald-700 transition-colors">
                        {lead.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-gray-400 truncate">{lead.company}</span>
                        <span className="text-gray-200">·</span>
                        <div className="flex items-center text-[11px] text-gray-400">
                          <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400 mr-0.5" />
                          {lead.rating}
                        </div>
                      </div>
                    </div>
                    <Badge className={`text-[10px] px-2 py-0.5 h-5 border font-medium rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                  <Building2 className="h-10 w-10 mb-3" />
                  <p className="text-sm font-medium text-gray-400">No leads yet</p>
                  <p className="text-xs text-gray-300 mt-0.5">Start scraping to see prospects</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — Activity Feed (col-span-4) ── */}
        <div className="col-span-12 lg:col-span-4">
          <div className={`${bentoCard} p-6 h-full flex flex-col`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Activity Feed</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Recent team interactions</p>
              </div>
              <Activity className="h-4 w-4 text-gray-300" />
            </div>

            <div className="flex-1">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-start gap-3 p-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-1.5" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                    </div>
                  </div>
                ))
              ) : dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gray-100" />
                  <div className="space-y-0.5">
                    {dashboardData.recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors relative"
                      >
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-sm flex-shrink-0 relative z-10 shadow-sm">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {activity.activity}
                          </p>
                          <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400 font-medium">{activity.leadName}</span>
                            <span className="text-gray-200">·</span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                  <Activity className="h-10 w-10 mb-3" />
                  <p className="text-sm font-medium text-gray-400">No activity yet</p>
                  <p className="text-xs text-gray-300 mt-0.5">Activities appear as you work leads</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <ScrapingModal isOpen={isScrapingModalOpen} onClose={() => setIsScrapingModalOpen(false)} />
    </div>
  );
}
