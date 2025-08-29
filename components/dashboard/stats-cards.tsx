"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Phone, CheckCircle, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { Button } from "@/components/ui/button";

export function StatsCards() {
  const { dashboardData, isLoading, error, refreshData } = useDashboard();

  const stats = [
    {
      key: "totalRestaurants",
      title: "Total Restaurants",
      icon: Building2,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      key: "prospects",
      title: "Prospects",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      key: "contacted",
      title: "Contacted",
      icon: Phone,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
    },
    {
      key: "closed",
      title: "Closed",
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
  ];

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-700 mb-4">Failed to load dashboard statistics</p>
            <Button onClick={refreshData} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Statistics Overview</h2>
        <Button
          onClick={refreshData}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const statData = dashboardData?.stats[stat.key as keyof typeof dashboardData.stats];
          
          return (
            <Card
              key={index}
              className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {isLoading ? (
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                      ) : (
                        statData?.value.toLocaleString() || "0"
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {statData?.description || "Loading..."}
                    </p>
                    <div className="flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-600 font-medium">
                        {isLoading ? "..." : statData?.trend || "0%"}
                      </span>
                      <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Cards */}
      {dashboardData && (
        <div className="grid gap-6 md:grid-cols-3 mt-6">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-indigo-600 mb-1">Conversion Rate</p>
                <p className="text-3xl font-bold text-indigo-900">
                  {dashboardData.summary.conversionRate}%
                </p>
                <p className="text-xs text-indigo-600">
                  of leads converted to closed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-green-600 mb-1">Average Rating</p>
                <p className="text-3xl font-bold text-green-900">
                  {dashboardData.summary.averageRating}
                </p>
                <p className="text-xs text-green-600">
                  stars across all restaurants
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-purple-600 mb-1">Total Leads</p>
                <p className="text-3xl font-bold text-purple-900">
                  {dashboardData.summary.totalLeads.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600">
                  restaurants in your database
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
