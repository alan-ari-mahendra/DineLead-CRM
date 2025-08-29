"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { ExportFilters } from "./export-filters";
import { toast } from "react-toastify";

interface ExportPreviewProps {
  filters: ExportFilters;
}

interface PreviewData {
  name: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  status: string;
  source: string;
  companyName: string;
  companyWebsite: string;
  companyIndustry: string[];
  latestNote: string;
  latestActivity: string;
  latestActivityType: string;
  latestActivityDescription: string;
  [key: string]: any; // Add index signature for dynamic field access
}

interface PreviewMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ExportPreview({ filters }: ExportPreviewProps) {
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const [meta, setMeta] = useState<PreviewMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPreviewData = async (page: number = 1) => {
    if (!filters.selectedFields.length) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: filters.status,
          rating: filters.rating,
          location: filters.location,
          dateFrom: filters.dateRange?.from?.toISOString(),
          dateTo: filters.dateRange?.to?.toISOString(),
          fields: filters.selectedFields,
          page,
          limit: 10,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch preview data");
      }

      const data = await response.json();
      setPreviewData(data.data);
      setMeta(data.meta);
      setCurrentPage(page);
    } catch (error) {
      console.error("Preview fetch error:", error);
      toast.error("Failed to fetch preview data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (filters.selectedFields.length > 0) {
      fetchPreviewData(1);
    }
  }, [filters]);

  const handlePageChange = (page: number) => {
    fetchPreviewData(page);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "prospect":
        return "bg-yellow-100 text-yellow-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      case "closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "-") return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatIndustry = (industry: string[]) => {
    if (!Array.isArray(industry) || industry.length === 0) return "-";
    return industry.join(", ");
  };

  if (!filters.selectedFields.length) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Export Preview</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select fields to export to see a preview of your data
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No fields selected for export</p>
            <p className="text-sm">
              Choose fields in the filters above to see a preview
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Export Preview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Preview of data that will be exported (showing {previewData.length} of{" "}
          {meta.total} records)
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {filters.selectedFields.map((field) => {
                      const fieldLabels: { [key: string]: string } = {
                        name: "Restaurant Name",
                        address: "Address",
                        phone: "Phone",
                        email: "Email",
                        rating: "Rating",
                        reviewCount: "Review Count",
                        status: "Status",
                        source: "Source",
                        companyName: "Company Name",
                        companyWebsite: "Company Website",
                        companyIndustry: "Company Industry",
                        latestNote: "Latest Note",
                        latestActivity: "Latest Activity",
                        latestActivityType: "Activity Type",
                        latestActivityDescription: "Activity Description",
                      };
                      return (
                        <TableHead key={field}>
                          {fieldLabels[field] || field}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={filters.selectedFields.length}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No data found for the selected filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    previewData.map((restaurant, index) => (
                      <TableRow key={index}>
                        {filters.selectedFields.map((field) => (
                          <TableCell key={field}>
                            {(() => {
                              switch (field) {
                                case "name":
                                  return (
                                    <span className="font-medium">
                                      {restaurant[field]}
                                    </span>
                                  );
                                case "rating":
                                  return (
                                    <div className="flex items-center">
                                      <span className="text-yellow-500 mr-1">
                                        ★
                                      </span>
                                      {restaurant[field]}
                                    </div>
                                  );
                                case "status":
                                  return (
                                    <Badge
                                      className={getStatusBadge(
                                        restaurant[field]
                                      )}
                                    >
                                      {restaurant[field]
                                        .charAt(0)
                                        .toUpperCase() +
                                        restaurant[field].slice(1)}
                                    </Badge>
                                  );
                                case "companyIndustry":
                                  return (
                                    <span className="text-muted-foreground">
                                      {formatIndustry(restaurant[field])}
                                    </span>
                                  );
                                case "latestNote":
                                case "latestActivity":
                                case "latestActivityDescription":
                                  return (
                                    <span
                                      className="text-muted-foreground max-w-xs truncate block"
                                      title={restaurant[field]}
                                    >
                                      {restaurant[field]}
                                    </span>
                                  );
                                case "reviewCount":
                                  return (
                                    <span className="text-muted-foreground">
                                      {restaurant[field]}
                                    </span>
                                  );
                                default:
                                  return (
                                    <span className="text-muted-foreground">
                                      {restaurant[field] || "-"}
                                    </span>
                                  );
                              }
                            })()}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {meta.totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= meta.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
