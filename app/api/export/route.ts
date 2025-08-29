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
    const where: any = {
      userId: session.user.id,
    };

    if (status !== "all") {
      where.leadStatus = {
        name: status.charAt(0).toUpperCase() + status.slice(1),
      };
    }

    // Note: Date filtering is based on related data, not direct Lead fields
    // We'll filter by the latest activity or note date if needed
    if (dateFrom || dateTo) {
      // For now, we'll skip date filtering since Lead doesn't have createdAt
      // This can be implemented later using related data if needed
      console.log(
        "Date filtering requested but not implemented for Lead model"
      );
    }

    // Fetch leads with related data
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
      // Note: Lead model doesn't have createdAt, so we'll order by id instead
      orderBy: { id: "desc" },
    });

    // Format data for export
    const formattedData = formatDataForExport(leads, fields);

    // Generate file based on format
    let fileBuffer: Buffer;
    let filename: string;

    switch (format.toLowerCase()) {
      case "csv":
        fileBuffer = Buffer.from(convertToCSV(formattedData, fields));
        filename = generateFilename("csv");
        break;

      case "excel":
        fileBuffer = await convertToExcel(formattedData, fields);
        filename = generateFilename("excel");
        break;

      case "json":
        fileBuffer = Buffer.from(convertToJSON(formattedData, fields));
        filename = generateFilename("json");
        break;

      default:
        return NextResponse.json(
          { error: "Unsupported format" },
          { status: 400 }
        );
    }

    // Return file as response
    const response = new NextResponse(fileBuffer as any);
    response.headers.set("Content-Type", getContentType(format));
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    response.headers.set("Content-Length", fileBuffer.length.toString());

    return response;
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
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
      dateFrom,
      dateTo,
      fields,
      page = 1,
      limit = 10,
    } = await req.json();

    // Build Prisma query with filters
    const where: any = {
      userId: session.user.id,
    };

    if (status && status !== "all") {
      where.leadStatus = {
        name: status.charAt(0).toUpperCase() + status.slice(1),
      };
    }

    // Note: Date filtering is based on related data, not direct Lead fields
    if (dateFrom || dateTo) {
      // For now, we'll skip date filtering since Lead doesn't have createdAt
      console.log(
        "Date filtering requested but not implemented for Lead model"
      );
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
      // Note: Lead model doesn't have createdAt, so we'll order by id instead
      orderBy: { id: "desc" },
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
    console.error("Preview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preview data" },
      { status: 500 }
    );
  }
}
