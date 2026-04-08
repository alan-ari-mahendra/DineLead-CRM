import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { code: 401, message: "Unauthorized" },
      { status: 401 }
    );
  }
  const { restaurantId, activities, description, type } = await req.json();

  const lead = await prisma.lead.findUnique({ where: { id: restaurantId } });
  if (!lead || lead.userId !== session.user.id) {
    return NextResponse.json({ code: 403, message: "Forbidden" }, { status: 403 });
  }

  const activity = await prisma.leadActivity.create({
    data: {
      userId: session.user.id,
      leadId: restaurantId,
      activity: activities,
      type: type,
      description: description,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({
    code: 200,
    message: "Success to make activity",
    data: activity,
  });
}
