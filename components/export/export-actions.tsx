"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Download, Database } from "lucide-react";
import type { ExportFilters } from "./export-filters";
import { toast } from "react-toastify";

interface ExportActionsProps {
  filters: ExportFilters;
  totalRecords: number;
}

export function ExportActions({ filters, totalRecords }: ExportActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<string | null>(null);

  const handleExport = async (format: "csv" | "excel" | "json") => {
    if (!filters.selectedFields.length) {
      toast.error("Please select at least one field to export");
      return;
    }

    if (totalRecords === 0) {
      toast.error("No data available for export");
      return;
    }

    setIsExporting(true);
    setExportFormat(format);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        format,
        fields: filters.selectedFields.join(","),
        status: filters.status,
        rating: filters.rating,
        location: filters.location,
      });

      // Add date range if available
      if (filters.dateRange?.from) {
        params.append("dateFrom", filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        params.append("dateTo", filters.dateRange.to.toISOString());
      }

      const downloadUrl = `/api/export?${params.toString()}`;

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `restaurant-leads-${
        new Date().toISOString().split("T")[0]
      }.${format === "excel" ? "xlsx" : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Data exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
        return <FileText className="h-5 w-5" />;
      case "excel":
        return <FileSpreadsheet className="h-5 w-5" />;
      case "json":
        return <Database className="h-5 w-5" />;
      default:
        return <Download className="h-5 w-5" />;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case "csv":
        return "Export as CSV";
      case "excel":
        return "Export as Excel";
      case "json":
        return "Export as JSON";
      default:
        return "Export";
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Export Actions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Download your filtered data in various formats. Available records:{" "}
          {totalRecords.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CSV Export */}
          <Button
            onClick={() => handleExport("csv")}
            disabled={isExporting || totalRecords === 0}
            className="h-16 flex flex-col items-center justify-center space-y-2"
            variant="outline"
          >
            {isExporting && exportFormat === "csv" ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            ) : (
              getFormatIcon("csv")
            )}
            <span className="text-sm">{getFormatLabel("csv")}</span>
          </Button>

          {/* Excel Export */}
          <Button
            onClick={() => handleExport("excel")}
            disabled={isExporting || totalRecords === 0}
            className="h-16 flex flex-col items-center justify-center space-y-2"
            variant="outline"
          >
            {isExporting && exportFormat === "excel" ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            ) : (
              getFormatIcon("excel")
            )}
            <span className="text-sm">{getFormatLabel("excel")}</span>
          </Button>

          {/* JSON Export */}
          <Button
            onClick={() => handleExport("json")}
            disabled={isExporting || totalRecords === 0}
            className="h-16 flex flex-col items-center justify-center space-y-2"
            variant="outline"
          >
            {isExporting && exportFormat === "json" ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            ) : (
              getFormatIcon("json")
            )}
            <span className="text-sm">{getFormatLabel("json")}</span>
          </Button>
        </div>

        {/* Export Info */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Export Info:</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Selected Fields: {filters.selectedFields.length}</li>
              <li>
                Status Filter:{" "}
                {filters.status === "all"
                  ? "All Statuses"
                  : filters.status.charAt(0).toUpperCase() +
                    filters.status.slice(1)}
              </li>
              <li>Total Records: {totalRecords.toLocaleString()}</li>
              {filters.dateRange?.from && (
                <li>
                  Date Range: {filters.dateRange.from.toLocaleDateString()} -{" "}
                  {filters.dateRange.to?.toLocaleDateString() || "Today"}
                </li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
