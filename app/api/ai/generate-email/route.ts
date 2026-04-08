import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { leadId, tone = "professional", language = "id" } = await req.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "leadId is required" },
        { status: 400 }
      );
    }

    // Fetch lead with ownership check
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId: session.user.id },
      include: { company: true, leadStatus: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const industries = lead.company?.industry?.join(", ") || "Restaurant";
    const langInstruction =
      language === "id"
        ? "Tulis email dalam Bahasa Indonesia yang sopan dan profesional."
        : "Write the email in English with a polite, professional tone.";

    const toneMap: Record<string, string> = {
      professional: "professional and formal",
      friendly: "warm and friendly",
      casual: "casual and conversational",
    };

    const prompt = `You are an expert B2B sales copywriter for a restaurant CRM platform called DineLead.
Generate a personalized cold outreach email to a restaurant lead.

Restaurant data:
- Name: ${lead.name}
- Address: ${lead.address || "N/A"}
- Phone: ${lead.phone || "N/A"}
- Website: ${lead.company?.website || "N/A"}
- Categories: ${industries}
- Rating: ${lead.rating}/5 (${lead.reviewCount} reviews)
- Current status: ${lead.leadStatus?.name || "Prospect"}

Tone: ${toneMap[tone] || toneMap.professional}
${langInstruction}

The goal: introduce a partnership opportunity, mention something specific about the restaurant (like its rating or location), and end with a clear call-to-action for a short call or meeting.

Return ONLY a valid JSON object in this exact format (no markdown, no explanation):
{"subject": "...", "body": "..."}

The body should use \\n for line breaks. Keep the email under 150 words.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful B2B sales assistant. Always respond with valid JSON only, no markdown code blocks.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content || "{}";

    let parsed: { subject: string; body: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid format. Please try again." },
        { status: 500 }
      );
    }

    if (!parsed.subject || !parsed.body) {
      return NextResponse.json(
        { error: "AI response missing required fields" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subject: parsed.subject,
      body: parsed.body,
      meta: {
        model: "llama-3.3-70b-versatile",
        tone,
        language,
      },
    });
  } catch (error) {
    console.error("[AI Email] Failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate email: ${message}` },
      { status: 500 }
    );
  }
}
