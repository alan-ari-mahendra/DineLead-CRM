import { Parser } from "json2csv";
import * as ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";

// Field mapping for better column headers - ONLY fields that exist in database
export const FIELD_LABELS: { [key: string]: string } = {
  name: "Restaurant Name",
  address: "Address",
  phone: "Phone",
  email: "Email",
  rating: "Rating",
  reviewCount: "Review Count",
  status: "Status",
  source: "Source",
  // Company fields
  companyName: "Company Name",
  companyWebsite: "Company Website",
  companyIndustry: "Company Industry",
  // Notes and Activity fields
  latestNote: "Latest Note",
  latestActivity: "Latest Activity",
  latestActivityType: "Activity Type",
  latestActivityDescription: "Activity Description",
};

// Convert data to CSV format
export function convertToCSV(data: any[], fields: string[]): string {
  const parser = new Parser({
    fields: fields.map((field) => ({
      label: FIELD_LABELS[field] || field,
      value: field,
    })),
  });
  return parser.parse(data);
}

// Convert data to Excel format - FIXED VERSION
export async function convertToExcel(
  data: any[],
  fields: string[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Restaurant Leads");

  // Add headers
  const headers = fields.map((field) => FIELD_LABELS[field] || field);
  worksheet.addRow(headers);

  // Add data rows
  data.forEach((row) => {
    const rowData = fields.map((field) => {
      const value = row[field];

      if (field === "companyIndustry" && Array.isArray(value)) {
        return value.join(", ");
      }
      if (field === "rating" && typeof value === "number") {
        return value.toFixed(1);
      }
      if (field === "reviewCount" && typeof value === "number") {
        return value.toString();
      }
      if (value === null || value === undefined) {
        return "";
      }
      return value.toString();
    });
    worksheet.addRow(rowData);
  });

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    if (column.values) {
      const maxLength = Math.max(
        ...column.values.map((cell: any) => (cell ? cell.toString().length : 0))
      );
      column.width = Math.min(maxLength + 2, 50);
    }
  });

  // Add borders
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// Convert data to JSON format
export function convertToJSON(data: any[], fields: string[]): string {
  const formattedData = data.map((row) => {
    const formatted: any = {};
    fields.forEach((field) => {
      if (field === "companyIndustry" && Array.isArray(row[field])) {
        formatted[FIELD_LABELS[field] || field] = row[field].join(", ");
      } else {
        formatted[FIELD_LABELS[field] || field] = row[field] || "";
      }
    });
    return formatted;
  });

  return JSON.stringify(formattedData, null, 2);
}

// Format data for export (common function) - ONLY use existing fields
export function formatDataForExport(leads: any[], fields: string[]) {
  return leads.map((lead) => {
    const formatted: any = {};

    fields.forEach((field) => {
      switch (field) {
        case "name":
          formatted[field] = lead.name;
          break;
        case "address":
          formatted[field] = lead.address;
          break;
        case "phone":
          formatted[field] = lead.phone;
          break;
        case "email":
          formatted[field] = lead.email;
          break;
        case "rating":
          formatted[field] = lead.rating;
          break;
        case "reviewCount":
          formatted[field] = lead.reviewCount;
          break;
        case "source":
          formatted[field] = lead.source;
          break;
        case "status":
          formatted[field] = lead.leadStatus?.name || "Unknown";
          break;
        case "companyName":
          formatted[field] = lead.company?.name || "-";
          break;
        case "companyWebsite":
          formatted[field] = lead.company?.website || "-";
          break;
        case "companyIndustry":
          formatted[field] = lead.company?.industry || [];
          break;
        case "latestNote":
          // Get the latest note
          const latestNote = lead.leadNotes?.[0];
          formatted[field] = latestNote?.notes || "-";
          break;
        case "latestActivity":
          // Get the latest activity
          const latestActivity = lead.leadActivity?.[0];
          formatted[field] = latestActivity?.activity || "-";
          break;
        case "latestActivityType":
          const latestActivityType = lead.leadActivity?.[0];
          formatted[field] = latestActivityType?.type || "-";
          break;
        case "latestActivityDescription":
          const latestActivityDesc = lead.leadActivity?.[0];
          formatted[field] = latestActivityDesc?.description || "-";
          break;
        default:
          formatted[field] = lead[field] || "";
      }
    });

    return formatted;
  });
}

// Generate filename with timestamp
export function generateFilename(
  format: string,
  prefix: string = "restaurant-leads"
): string {
  const timestamp = formatDate(new Date(), "yyyy-MM-dd-HH-mm-ss");
  const extension = format === "excel" ? "xlsx" : format;
  return `${prefix}-${timestamp}.${extension}`;
}

// Get content type for different formats
export function getContentType(format: string): string {
  switch (format.toLowerCase()) {
    case "csv":
      return "text/csv";
    case "excel":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}
