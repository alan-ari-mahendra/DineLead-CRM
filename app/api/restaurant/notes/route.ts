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
  const { restaurantId, notes } = await req.json();

  const lead = await prisma.lead.findUnique({ where: { id: restaurantId } });
  if (!lead || lead.userId !== session.user.id) {
    return NextResponse.json({ code: 403, message: "Forbidden" }, { status: 403 });
  }

  const note = await prisma.leadNotes.create({
    data: {
      userId: session.user.id,
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
