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
  const { userId, restaurantId, notes } = await req.json();

  const note = await prisma.leadNotes.create({
    data: {
      userId: userId,
      leadId: restaurantId,
      notes: notes,
    },
  });

  return NextResponse.json({
    code: 200,
    message: "Success to make notes",
    data: null,
  });
}
