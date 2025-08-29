"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Building2, Activity } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { formatDistanceToNow } from "date-fns";

export function RecentActivity() {
  const { dashboardData, isLoading } = useDashboard();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "prospect":
        return "bg-yellow-100 text-yellow-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      case "closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "call":
        return "📞";
      case "email":
        return "📧";
      case "meeting":
        return "🤝";
      case "follow_up":
        return "🔄";
      default:
        return "📝";
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span>Recent Leads</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span>Recent Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Leads */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span>Recent Leads</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData?.recentLeads && dashboardData.recentLeads.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {lead.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {lead.company} • {lead.reviewCount} reviews
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusBadge(lead.status)}>
                        {lead.status}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        {lead.rating}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>No recent leads found</p>
              <p className="text-sm">Start scraping to see your leads here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <span>Recent Activities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.activity}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {activity.leadName}
                      </p>
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>No recent activities found</p>
              <p className="text-sm">Activities will appear here as you work with leads</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
