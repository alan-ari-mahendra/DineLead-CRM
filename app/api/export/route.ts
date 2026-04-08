import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  convertToCSV,
  convertToExcel,
  convertToJSON,
  formatDataForExport,
  generateFilename,
  getContentType,
} from "@/lib/export-utils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { code: 401, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "csv";
  const status = searchParams.get("status") || "all";
  const rating = searchParams.get("rating") || "all";
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const fields = searchParams.get("fields")?.split(",") || [
    "name",
    "address",
    "phone",
    "email",
    "rating",
    "status",
    "source",
  ];

  try {
    // Build Prisma query with filters
    const where: Parameters<typeof prisma.lead.findMany>[0]["where"] = {
      userId: session.user.id,
    };

    if (status !== "all") {
      where.leadStatus = {
        name: status.charAt(0).toUpperCase() + status.slice(1),
      };
    }

    if (rating !== "all") {
      const ratingValue = parseFloat(rating);
      if (!Number.isNaN(ratingValue)) {
        where.rating = { gte: ratingValue };
      }
    }

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo
          ? { lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)) }
          : {}),
      };
    }

    // Fetch leads with related data
    const leads = await prisma.lead.findMany({
      where,
      include: {
        leadStatus: true,
        company: true,
        leadNotes: { orderBy: { createdAt: "desc" }, take: 1 },
        leadActivity: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    if (leads.length === 0) {
      return NextResponse.json(
        { error: "No data to export with the current filters" },
        { status: 404 }
      );
    }

    // Format data for export
    const formattedData = formatDataForExport(leads, fields);

    // Generate file based on format
    let fileBytes: Uint8Array;
    let filename: string;

    switch (format.toLowerCase()) {
      case "csv":
        fileBytes = new TextEncoder().encode(
          convertToCSV(formattedData, fields)
        );
        filename = generateFilename("csv");
        break;

      case "excel":
        fileBytes = await convertToExcel(formattedData, fields);
        filename = generateFilename("excel");
        break;

      case "json":
        fileBytes = new TextEncoder().encode(
          convertToJSON(formattedData, fields)
        );
        filename = generateFilename("json");
        break;

      default:
        return NextResponse.json(
          { error: "Unsupported format" },
          { status: 400 }
        );
    }

    return new NextResponse(fileBytes, {
      status: 200,
      headers: {
        "Content-Type": getContentType(format),
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBytes.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("[Export GET] Failed:", error);
    return NextResponse.json(
      {
        error: "Failed to export data",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Preview endpoint for filtered data
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { code: 401, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const {
      status,
      rating,
      dateFrom,
      dateTo,
      fields,
      page = 1,
      limit = 10,
    } = await req.json();

    // Build Prisma query with filters
    const where: Parameters<typeof prisma.lead.findMany>[0]["where"] = {
      userId: session.user.id,
    };

    if (status && status !== "all") {
      where.leadStatus = {
        name: status.charAt(0).toUpperCase() + status.slice(1),
      };
    }

    if (rating && rating !== "all") {
      const ratingValue = parseFloat(rating);
      if (!Number.isNaN(ratingValue)) {
        where.rating = { gte: ratingValue };
      }
    }

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo
          ? { lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)) }
          : {}),
      };
    }

    // Get total count for pagination
    const total = await prisma.lead.count({ where });

    // Fetch paginated leads
    const leads = await prisma.lead.findMany({
      where,
      include: {
        leadStatus: true,
        company: true,
        leadNotes: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        leadActivity: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format data for preview
    const formattedData = formatDataForExport(leads, fields);

    return NextResponse.json({
      data: formattedData,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch preview data" },
      { status: 500 }
    );
  }
}
