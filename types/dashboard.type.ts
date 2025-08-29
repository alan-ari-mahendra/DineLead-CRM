export interface DashboardStats {
  totalRestaurants: StatItem;
  prospects: StatItem;
  contacted: StatItem;
  closed: StatItem;
}

export interface StatItem {
  value: number;
  trend: string;
  description: string;
}

export interface RecentLead {
  id: string;
  name: string;
  status: string;
  company: string;
  rating: number;
  reviewCount: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  activity: string;
  description: string;
  leadName: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalLeads: number;
  conversionRate: number;
  averageRating: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentLeads: RecentLead[];
  recentActivities: RecentActivity[];
  summary: DashboardSummary;
}
