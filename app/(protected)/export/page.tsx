"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ExportFilters,
  type ExportFilters as ExportFiltersType,
} from "@/components/export/export-filters";
import { ExportActions } from "@/components/export/export-actions";
import { ExportPreview } from "@/components/export/export-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ExportPage() {
  const [filters, setFilters] = useState<ExportFiltersType>({
    dateRange: undefined,
    selectedFields: [
      "name",
      "address",
      "phone",
      "email",
      "rating",
      "status",
      "source",
    ],
    status: "all",
    rating: "all",
    location: "all",
  });
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoadingTotal, setIsLoadingTotal] = useState(false);

  // Memoize fetchTotalCount function to prevent infinite re-renders
  const fetchTotalCount = useCallback(async () => {
    if (!filters.selectedFields.length) return;

    setIsLoadingTotal(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: filters.status,
          rating: filters.rating,
          location: filters.location,
          dateFrom: filters.dateRange?.from?.toISOString(),
          dateTo: filters.dateRange?.to?.toISOString(),
          fields: filters.selectedFields,
          page: 1,
          limit: 1, // Just get count
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTotalRecords(data.meta.total);
      }
    } catch (error) {
      console.error("Failed to fetch total count:", error);
    } finally {
      setIsLoadingTotal(false);
    }
  }, [
    filters.status,
    filters.rating,
    filters.location,
    filters.dateRange,
    filters.selectedFields,
  ]);

  // Fetch total count when filters change
  useEffect(() => {
    // Debounce the API call to prevent excessive requests
    const timeoutId = setTimeout(() => {
      fetchTotalCount();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchTotalCount]);

  const handleFiltersChange = useCallback((newFilters: ExportFiltersType) => {
    setFilters(newFilters);
  }, []);

  const handlePreviewRequest = useCallback(() => {
    // This will trigger the preview component to refresh
    // The preview component handles its own data fetching
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Data</h1>
        <p className="text-gray-600">
          Configure and export your restaurant data in various formats with
          advanced filtering options.
        </p>
      </div>

      {/* Summary Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Export Summary</span>
            {isLoadingTotal && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {isLoadingTotal ? "..." : totalRecords.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filters.selectedFields.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Fields Selected
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filters.status === "all"
                  ? "All"
                  : filters.status.charAt(0).toUpperCase() +
                    filters.status.slice(1)}
              </div>
              <div className="text-sm text-muted-foreground">Status Filter</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ExportFilters
        onFiltersChange={handleFiltersChange}
        onPreviewRequest={handlePreviewRequest}
      />

      <ExportActions filters={filters} totalRecords={totalRecords} />

      <ExportPreview filters={filters} />
    </div>
  );
}
