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
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "contacted":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "closed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
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
    { key: "totalRestaurants" as const, label: "Total Restaurants", icon: Building2, bg: "bg-blue-600" },
    { key: "prospects" as const, label: "Prospects", icon: Target, bg: "bg-violet-600" },
    { key: "contacted" as const, label: "Contacted", icon: Phone, bg: "bg-orange-500" },
    { key: "closed" as const, label: "Closed Deals", icon: CheckCircle, bg: "bg-emerald-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your restaurant pipeline at a glance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsScrapingModalOpen(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Scrape Data
          </Button>
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="py-4">
            <p className="text-red-700 text-sm text-center">
              Failed to load data.{" "}
              <button onClick={refreshData} className="underline font-medium">Retry</button>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Row - Dashboard 2 Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => {
          const data = dashboardData?.stats[stat.key];
          const trend = trendValue(data?.trend);
          return (
            <div
              key={stat.key}
              className="group relative p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-1.5 h-1.5 rounded-full ${stat.bg}`} />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-gray-900 tabular-nums">
                  {isLoading ? (
                    <div className="h-8 w-14 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    data?.value.toLocaleString() || "0"
                  )}
                </span>
                {data && (
                  <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                    trend.isPositive
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-red-700 bg-red-50"
                  }`}>
                    {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {trend.value}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid - Dashboard 1 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Summary + Quick Actions - spans 1 col */}
        <div className="space-y-4">
          {/* Conversion Rate */}
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                <BarChart3 className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {isLoading ? (
                    <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    `${dashboardData?.summary.conversionRate || 0}%`
                  )}
                </span>
                <span className="text-sm text-gray-500 mb-1">closed</span>
              </div>
              {dashboardData && (
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(dashboardData.summary.conversionRate, 100)}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Avg Rating */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <Star className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {isLoading ? (
                    <div className="h-10 w-12 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    dashboardData?.summary.averageRating || "0"
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
            </CardContent>
          </Card>

          {/* Total Leads */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500">Total Leads</p>
                <Utensils className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {isLoading ? (
                  <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
                ) : (
                  dashboardData?.summary.totalLeads.toLocaleString() || "0"
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">restaurants in database</p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-gray-500 mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Restaurants", icon: Database, onClick: () => router.push("/restaurants") },
                  { label: "Export", icon: FileText, onClick: () => router.push("/export") },
                  { label: "Scrape", icon: Zap, onClick: () => setIsScrapingModalOpen(true) },
                  { label: "Settings", icon: Settings, onClick: () => router.push("/settings") },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-colors text-left"
                  >
                    <action.icon className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads - spans 1 col */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500">Recent Leads</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 hover:text-blue-700 h-auto p-0"
                onClick={() => router.push("/restaurants")}
              >
                View all
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-1.5" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardData?.recentLeads && dashboardData.recentLeads.length > 0 ? (
              <div className="space-y-1">
                {dashboardData.recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {lead.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {lead.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 truncate">{lead.company}</span>
                        <span className="text-gray-300">·</span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400 mr-0.5" />
                          {lead.rating}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No leads yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities - spans 1 col */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500">Activity Feed</CardTitle>
              <Activity className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-1.5" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-3 bottom-3 w-px bg-gray-100" />
                <div className="space-y-1">
                  {dashboardData.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors relative"
                    >
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-sm flex-shrink-0 relative z-10">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.activity}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400">{activity.leadName}</span>
                          <span className="text-gray-200">·</span>
                          <span className="text-[10px] text-gray-400 flex items-center">
                            <Clock className="h-2.5 w-2.5 mr-0.5" />
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activity yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ScrapingModal isOpen={isScrapingModalOpen} onClose={() => setIsScrapingModalOpen(false)} />
    </div>
  );
}
