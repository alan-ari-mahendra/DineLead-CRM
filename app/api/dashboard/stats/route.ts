import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current date and last month for trend calculation
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch statistics for the current user
    const [
      totalRestaurants,
      prospects,
      contacted,
      closed,
      lastMonthTotal,
      lastMonthProspects,
      lastMonthContacted,
      lastMonthClosed,
      recentLeads,
      recentActivities
    ] = await Promise.all([
      // Total restaurants (leads)
      prisma.lead.count({
        where: { userId: session.user.id }
      }),

      // Prospects (leads with status "Prospect")
      prisma.lead.count({
        where: {
          userId: session.user.id,
          leadStatus: { name: "Prospect" }
        }
      }),

      // Contacted (leads with status "Contacted")
      prisma.lead.count({
        where: {
          userId: session.user.id,
          leadStatus: { name: "Contacted" }
        }
      }),

      // Closed (leads with status "Closed")
      prisma.lead.count({
        where: {
          userId: session.user.id,
          leadStatus: { name: "Closed" }
        }
      }),

      // Last month totals for trend calculation
      prisma.lead.count({
        where: {
          userId: session.user.id,
          leadActivity: {
            some: {
              createdAt: { gte: lastMonth, lt: currentMonth }
            }
          }
        }
      }),

      // Last month prospects
      prisma.lead.count({
        where: {
          userId: session.user.id,
          leadStatus: { name: "Prospect" },
          leadActivity: {
            some: {
              createdAt: { gte: lastMonth, lt: currentMonth }
            }
          }
        }
      }),

      // Last month contacted
      prisma.lead.count({
        where: {
          userId: session.user.id,
          leadStatus: { name: "Contacted" },
          leadActivity: {
            some: {
              createdAt: { gte: lastMonth, lt: currentMonth }
            }
          }
        }
      }),

      // Last month closed
      prisma.lead.count({
        where: {
          userId: session.user.id,
          leadStatus: { name: "Closed" },
          leadActivity: {
            some: {
              createdAt: { gte: lastMonth, lt: currentMonth }
            }
          }
        }
      }),

      // Recent leads (last 5)
      prisma.lead.findMany({
        where: { userId: session.user.id },
        include: {
          leadStatus: true,
          company: true,
        },
        orderBy: { id: "desc" },
        take: 5
      }),

      // Recent activities (last 5)
      prisma.leadActivity.findMany({
        where: { userId: session.user.id },
        include: {
          lead: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    ]);

    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const change = ((current - previous) / previous) * 100;
      return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
    };

    const stats = {
      totalRestaurants: {
        value: totalRestaurants,
        trend: calculateTrend(totalRestaurants, lastMonthTotal),
        description: "All restaurants in database"
      },
      prospects: {
        value: prospects,
        trend: calculateTrend(prospects, lastMonthProspects),
        description: "New potential leads"
      },
      contacted: {
        value: contacted,
        trend: calculateTrend(contacted, lastMonthContacted),
        description: "Restaurants contacted"
      },
      closed: {
        value: closed,
        trend: calculateTrend(closed, lastMonthClosed),
        description: "Successful conversions"
      }
    };

    // Format recent data
    const recentLeadsFormatted = recentLeads.map(lead => ({
      id: lead.id,
      name: lead.name,
      status: lead.leadStatus.name,
      company: lead.company?.name || "N/A",
      rating: lead.rating,
      reviewCount: lead.reviewCount
    }));

    const recentActivitiesFormatted = recentActivities.map(activity => ({
      id: activity.id,
      type: activity.type,
      activity: activity.activity,
      description: activity.description,
      leadName: activity.lead.name,
      createdAt: activity.createdAt
    }));

    return NextResponse.json({
      stats,
      recentLeads: recentLeadsFormatted,
      recentActivities: recentActivitiesFormatted,
      summary: {
        totalLeads: totalRestaurants,
        conversionRate: totalRestaurants > 0 ? Math.round((closed / totalRestaurants) * 100) : 0,
        averageRating: recentLeads.length > 0 
          ? Math.round(recentLeads.reduce((sum, lead) => sum + lead.rating, 0) / recentLeads.length * 10) / 10
          : 0
      }
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
