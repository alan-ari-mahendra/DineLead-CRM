"use client";
import { Building2, Users, Phone, CheckCircle, TrendingUp, TrendingDown, Loader2, RefreshCw } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { Button } from "@/components/ui/button";

export function StatsCards() {
  const { dashboardData, isLoading, error, refreshData } = useDashboard();

  const stats = [
    {
      key: "totalRestaurants",
      title: "Total Restaurants",
      icon: Building2,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accentColor: "bg-blue-500",
    },
    {
      key: "prospects",
      title: "Prospects",
      icon: Users,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      accentColor: "bg-violet-500",
    },
    {
      key: "contacted",
      title: "Contacted",
      icon: Phone,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      accentColor: "bg-amber-500",
    },
    {
      key: "closed",
      title: "Closed Deals",
      icon: CheckCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accentColor: "bg-emerald-500",
    },
  ];

  if (error) {
    return (
      <div className="bento-card p-6 border border-red-100 bg-red-50">
        <div className="text-center">
          <p className="text-red-600 text-sm mb-3">Failed to load dashboard statistics</p>
          <Button onClick={refreshData} variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Statistics Overview</h2>
        <Button
          onClick={refreshData}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="flex items-center gap-1.5 border-gray-200 h-8"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          <span className="text-xs">Refresh</span>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const statData = dashboardData?.stats[stat.key as keyof typeof dashboardData.stats];
          const trend = statData?.trend ? parseFloat(statData.trend.replace("%", "")) : 0;
          const isPositive = trend >= 0;

          return (
            <div key={stat.key} className="bento-card p-6">
              {/* Icon + Trend */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className={`h-[18px] w-[18px] ${stat.iconColor}`} />
                </div>
                {statData && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                      isPositive ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(trend)}%
                  </span>
                )}
              </div>

              {/* Value */}
              <div className="text-3xl font-bold text-gray-900 tabular-nums mb-1">
                {isLoading ? (
                  <div className="h-8 w-14 bg-gray-100 rounded-lg animate-pulse" />
                ) : (
                  statData?.value.toLocaleString() || "0"
                )}
              </div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                {stat.title}
              </p>
              <p className="text-[11px] text-gray-300">
                {isLoading ? "..." : statData?.description || ""}
              </p>

              {/* Bottom accent */}
              <div className={`mt-4 h-0.5 w-8 rounded-full ${stat.accentColor} opacity-60`} />
            </div>
          );
        })}
      </div>

      {/* Summary Cards */}
      {dashboardData && (
        <div className="grid gap-3 md:grid-cols-3 mt-3">
          {[
            {
              label: "Conversion Rate",
              value: `${dashboardData.summary.conversionRate}%`,
              sub: "of leads converted to closed",
              bg: "bg-emerald-50",
              textColor: "text-emerald-700",
              valueColor: "text-emerald-900",
            },
            {
              label: "Average Rating",
              value: String(dashboardData.summary.averageRating),
              sub: "stars across all restaurants",
              bg: "bg-amber-50",
              textColor: "text-amber-700",
              valueColor: "text-amber-900",
            },
            {
              label: "Total Leads",
              value: dashboardData.summary.totalLeads.toLocaleString(),
              sub: "restaurants in your database",
              bg: "bg-blue-50",
              textColor: "text-blue-700",
              valueColor: "text-blue-900",
            },
          ].map((item) => (
            <div key={item.label} className={`bento-card p-6 ${item.bg}`}>
              <p className={`text-xs font-semibold ${item.textColor} uppercase tracking-wide mb-2`}>
                {item.label}
              </p>
              <p className={`text-3xl font-bold ${item.valueColor} mb-1`}>{item.value}</p>
              <p className={`text-xs ${item.textColor} opacity-70`}>{item.sub}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
