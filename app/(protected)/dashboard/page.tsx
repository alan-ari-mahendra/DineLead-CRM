import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your restaurant data.
        </p>
      </div>

      {/* Statistics Overview */}
      <StatsCards />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity & Leads */}
      <RecentActivity />
    </div>
  );
}
