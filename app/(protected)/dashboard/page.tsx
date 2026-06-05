"use client";

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
  ArrowRight,
  Target,
  BarChart3,
  Zap,
  Activity,
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
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "contacted":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "closed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
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

  // Stat tiles config
  const stats = [
    {
      key: "totalRestaurants" as const,
      label: "Total Restaurants",
      icon: Building2,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accentColor: "bg-blue-500",
    },
    {
      key: "prospects" as const,
      label: "Prospects",
      icon: Target,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      accentColor: "bg-violet-500",
    },
    {
      key: "contacted" as const,
      label: "Contacted",
      icon: Phone,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      accentColor: "bg-amber-500",
    },
    {
      key: "closed" as const,
      label: "Closed Deals",
      icon: CheckCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accentColor: "bg-emerald-500",
    },
  ];

  return (
    <div className="page-bg p-4 md:p-6 lg:p-8">
      {/* === Page Header === */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Your restaurant pipeline at a glance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsScrapingModalOpen(true)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Scrape Data
          </Button>
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-gray-200 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bento-card p-4 border border-red-100 bg-red-50 mb-6">
          <p className="text-red-700 text-sm text-center">
            Failed to load data.{" "}
            <button onClick={refreshData} className="underline font-medium">
              Retry
            </button>
          </p>
        </div>
      )}

      {/* === BENTO GRID === */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Stat Tiles — Row 1 */}
        {stats.map((stat) => {
          const data = dashboardData?.stats[stat.key];
          const trend = trendValue(data?.trend);
          return (
            <div
              key={stat.key}
              className="bento-card p-6 group"
            >
              {/* Icon + Label */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className={`h-4.5 w-4.5 ${stat.iconColor} h-[18px] w-[18px]`} />
                </div>
                {data && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                      trend.isPositive
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-red-600 bg-red-50"
                    }`}
                  >
                    {trend.isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {trend.value}%
                  </span>
                )}
              </div>

              {/* Value */}
              <div className="text-3xl font-bold text-gray-900 tabular-nums mb-1">
                {isLoading ? (
                  <div className="h-8 w-14 bg-gray-100 rounded-lg animate-pulse" />
                ) : (
                  data?.value.toLocaleString() || "0"
                )}
              </div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {stat.label}
              </p>

              {/* Bottom accent line */}
              <div className={`mt-4 h-0.5 w-8 rounded-full ${stat.accentColor} opacity-60`} />
            </div>
          );
        })}
      </div>

      {/* === Main Bento Grid — 3 columns === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Column 1: Metrics Stack */}
        <div className="space-y-3">

          {/* Conversion Rate Card */}
          <div className="bento-card p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Conversion Rate</p>
              </div>
              <BarChart3 className="h-4 w-4 text-gray-300" />
            </div>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-bold text-gray-900">
                {isLoading ? (
                  <div className="h-10 w-16 bg-gray-100 rounded-lg animate-pulse" />
                ) : (
                  `${dashboardData?.summary.conversionRate || 0}%`
                )}
              </span>
              <span className="text-sm text-gray-400 mb-1">closed</span>
            </div>
            {dashboardData && (
              <div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(dashboardData.summary.conversionRate, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  {dashboardData.summary.conversionRate}% leads converted to closed
                </p>
              </div>
            )}
          </div>

          {/* Average Rating Card */}
          <div className="bento-card p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Average Rating</p>
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-bold text-gray-900">
                {isLoading ? (
                  <div className="h-10 w-12 bg-gray-100 rounded-lg animate-pulse" />
                ) : (
                  dashboardData?.summary.averageRating || "—"
                )}
              </span>
              <div className="flex items-center gap-0.5 mb-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= Math.round(dashboardData?.summary.averageRating || 0)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-gray-400">Across all restaurants in database</p>
          </div>

          {/* Total Leads Card */}
          <div className="bento-card p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Leads</p>
              <Database className="h-4 w-4 text-gray-300" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {isLoading ? (
                <div className="h-10 w-16 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                dashboardData?.summary.totalLeads.toLocaleString() || "0"
              )}
            </div>
            <p className="text-[11px] text-gray-400">Restaurants in your database</p>
          </div>

          {/* Quick Actions Card */}
          <div className="bento-card p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Restaurants", icon: Database, onClick: () => router.push("/restaurants"), color: "text-blue-500" },
                { label: "Export", icon: FileText, onClick: () => router.push("/export"), color: "text-emerald-500" },
                { label: "Scrape", icon: Zap, onClick: () => setIsScrapingModalOpen(true), color: "text-amber-500" },
                { label: "Settings", icon: Settings, onClick: () => router.push("/settings"), color: "text-gray-400" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left group"
                >
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Recent Leads */}
        <div className="bento-card flex flex-col">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-800">Recent Leads</p>
              <p className="text-xs text-gray-400 mt-0.5">Latest restaurant prospects</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-auto px-2 py-1 rounded-lg gap-1"
              onClick={() => router.push("/restaurants")}
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex-1 px-3 py-3 overflow-auto">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-100 rounded w-3/4 mb-1.5" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardData?.recentLeads && dashboardData.recentLeads.length > 0 ? (
              <div className="space-y-1">
                {dashboardData.recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {lead.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate group-hover:text-emerald-700 transition-colors">
                        {lead.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-400 truncate">{lead.company}</span>
                        <span className="text-gray-200">·</span>
                        <div className="flex items-center text-xs text-gray-400">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400 mr-0.5" />
                          {lead.rating}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-5 border ${getStatusColor(lead.status)}`}
                    >
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                  <Building2 className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">No leads yet</p>
                <p className="text-xs text-gray-300 mt-1">Start scraping to collect restaurant leads</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Activity Feed */}
        <div className="bento-card flex flex-col">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-800">Activity Feed</p>
              <p className="text-xs text-gray-400 mt-0.5">Recent team interactions</p>
            </div>
            <Activity className="h-4 w-4 text-gray-300" />
          </div>
          <div className="flex-1 px-3 py-3 overflow-auto">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex items-start gap-3 p-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-100 rounded w-3/4 mb-1.5" />
                      <div className="h-2.5 bg-gray-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gray-100" />
                <div className="space-y-1">
                  {dashboardData.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors relative"
                    >
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-sm flex-shrink-0 relative z-10">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {activity.activity}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-gray-400">{activity.leadName}</span>
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
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                  <Activity className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">No activity yet</p>
                <p className="text-xs text-gray-300 mt-1">Activities will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ScrapingModal isOpen={isScrapingModalOpen} onClose={() => setIsScrapingModalOpen(false)} />
    </div>
  );
}
