"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  FileText,
  FileSpreadsheet,
  Database,
  Download,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { toast } from "react-toastify";

interface PreviewData {
  [key: string]: any;
}

interface PreviewMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const AVAILABLE_FIELDS = [
  { id: "name", label: "Restaurant Name" },
  { id: "address", label: "Address" },
  { id: "phone", label: "Phone" },
  { id: "email", label: "Email" },
  { id: "rating", label: "Rating" },
  { id: "reviewCount", label: "Review Count" },
  { id: "source", label: "Source" },
  { id: "status", label: "Status" },
  { id: "companyName", label: "Company Name" },
  { id: "companyWebsite", label: "Company Website" },
  { id: "companyIndustry", label: "Company Industry" },
];

const FIELD_LABELS: Record<string, string> = Object.fromEntries(AVAILABLE_FIELDS.map(f => [f.id, f.label]));

export default function ExportPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: addDays(new Date(), -30), to: new Date() });
  const [selectedFields, setSelectedFields] = useState(["name", "address", "phone", "email", "rating", "status", "source"]);
  const [status, setStatus] = useState("all");
  const [rating, setRating] = useState("all");
  const [location, setLocation] = useState("all");

  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const [meta, setMeta] = useState<PreviewMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoadingTotal, setIsLoadingTotal] = useState(false);
  const [showFieldSelector, setShowFieldSelector] = useState(false);

  const fetchTotalCount = useCallback(async () => {
    if (!selectedFields.length) return;
    setIsLoadingTotal(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rating, location, dateFrom: dateRange?.from?.toISOString(), dateTo: dateRange?.to?.toISOString(), fields: selectedFields, page: 1, limit: 1 }),
      });
      if (response.ok) { const data = await response.json(); setTotalRecords(data.meta.total); }
    } catch {} finally { setIsLoadingTotal(false); }
  }, [status, rating, location, dateRange, selectedFields]);

  useEffect(() => {
    const t = setTimeout(() => fetchTotalCount(), 500);
    return () => clearTimeout(t);
  }, [fetchTotalCount]);

  const fetchPreviewData = async (page: number = 1) => {
    if (!selectedFields.length) return;
    setIsLoadingPreview(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rating, location, dateFrom: dateRange?.from?.toISOString(), dateTo: dateRange?.to?.toISOString(), fields: selectedFields, page, limit: 10 }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setPreviewData(data.data);
      setMeta(data.meta);
      setCurrentPage(page);
    } catch { toast.error("Failed to fetch preview"); }
    finally { setIsLoadingPreview(false); }
  };

  useEffect(() => {
    if (selectedFields.length > 0) fetchPreviewData(1);
  }, [status, rating, location, dateRange, selectedFields]);

  const handleExport = async (format: "csv" | "excel" | "json") => {
    if (!selectedFields.length) { toast.error("Select at least one field"); return; }
    if (totalRecords === 0) { toast.error("No data to export"); return; }
    setIsExporting(true);
    setExportFormat(format);
    try {
      const params = new URLSearchParams({ format, fields: selectedFields.join(","), status, rating });
      if (dateRange?.from) params.append("dateFrom", dateRange.from.toISOString());
      if (dateRange?.to) params.append("dateTo", dateRange.to.toISOString());
      const response = await fetch(`/api/export?${params.toString()}`);
      if (!response.ok) { const err = await response.json().catch(() => null); toast.error(err?.error || "Export failed"); return; }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `restaurant-leads-${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch { toast.error("Export failed"); }
    finally { setIsExporting(false); setExportFormat(null); }
  };

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    setSelectedFields(checked ? [...selectedFields, fieldId] : selectedFields.filter((id) => id !== fieldId));
  };

  const getStatusDot = (s: string) => {
    switch (s.toLowerCase()) {
      case "prospect": return "bg-blue-500";
      case "contacted": return "bg-amber-500";
      case "closed": return "bg-emerald-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Export Data</h1>
              <p className="text-sm text-gray-600">
                Configure and export your restaurant data in various formats with
                advanced filtering options.
              </p>
            </div>
            </div>
            <div className="flex items-center gap-2">
              {(["csv", "excel", "json"] as const).map((format) => {
                const icons = { csv: FileText, excel: FileSpreadsheet, json: Database };
                const Icon = icons[format];
                return (
                  <Button
                    key={format}
                    onClick={() => handleExport(format)}
                    disabled={isExporting || totalRecords === 0}
                    size="sm"
                    className={format === "excel"
                      ? "h-8 text-xs bg-gray-900 hover:bg-gray-800 text-white"
                      : "h-8 text-xs"
                    }
                    variant={format === "excel" ? "default" : "outline"}
                  >
                    {isExporting && exportFormat === format ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : (
                      <Icon className="h-3.5 w-3.5 mr-1" />
                    )}
                    {format.toUpperCase()}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Inline Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[120px] h-8 text-xs border-gray-200"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger className="w-[110px] h-8 text-xs border-gray-200"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
              </SelectContent>
            </Select>

            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-[120px] h-8 text-xs border-gray-200"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="jakarta">Jakarta</SelectItem>
                <SelectItem value="bandung">Bandung</SelectItem>
                <SelectItem value="surabaya">Surabaya</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-8">
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>

            <button
              onClick={() => setShowFieldSelector(!showFieldSelector)}
              className="flex items-center gap-1 h-8 px-3 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              Fields ({selectedFields.length})
              {showFieldSelector ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          {/* Collapsible Field Selector */}
          {showFieldSelector && (
            <div className="mt-3 pt-3 border-t border-gray-50">
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {AVAILABLE_FIELDS.map((field) => (
                  <label key={field.id} className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={(checked) => handleFieldToggle(field.id, checked as boolean)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-xs text-gray-600">{field.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="px-4 md:px-6 lg:px-8 py-4">
        {isLoadingPreview ? (
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  {selectedFields.map((field) => (
                    <TableHead key={field} className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {FIELD_LABELS[field] || field}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {selectedFields.map((field) => (
                      <TableCell key={field}>
                        <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : !selectedFields.length ? (
          <div className="text-center py-20">
            <Download className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-500">Select fields to preview export data</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  {selectedFields.map((field) => (
                    <TableHead key={field} className="text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {FIELD_LABELS[field] || field}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedFields.length} className="text-center py-12">
                      <Download className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                      <p className="text-sm text-gray-500">No data found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  previewData.map((row, i) => (
                    <TableRow key={i} className="hover:bg-gray-50/50">
                      {selectedFields.map((field) => (
                        <TableCell key={field} className="text-sm whitespace-nowrap">
                          {field === "name" ? (
                            <span className="font-medium text-gray-900">{row[field]}</span>
                          ) : field === "rating" ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                              <span className="font-medium text-gray-900 tabular-nums">{row[field]}</span>
                            </div>
                          ) : field === "status" ? (
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(row[field] || "")}`} />
                              <span className="text-xs font-medium text-gray-600">{row[field]}</span>
                            </div>
                          ) : field === "companyIndustry" ? (
                            <span className="text-gray-500 text-xs">{Array.isArray(row[field]) ? row[field].join(", ") : "-"}</span>
                          ) : (
                            <span className="text-gray-500 truncate max-w-[200px] block" title={row[field]}>
                              {row[field] || "-"}
                            </span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-1">
            <p className="text-xs text-gray-400">
              Page {currentPage} of {meta.totalPages} · {meta.total} results
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => fetchPreviewData(currentPage - 1)} disabled={currentPage <= 1} className="h-7 w-7 p-0 border-gray-200">
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                let p: number;
                if (meta.totalPages <= 5) p = i + 1;
                else if (currentPage <= 3) p = i + 1;
                else if (currentPage >= meta.totalPages - 2) p = meta.totalPages - 4 + i;
                else p = currentPage - 2 + i;
                return (
                  <Button key={p} variant={p === currentPage ? "default" : "ghost"} size="sm" onClick={() => fetchPreviewData(p)}
                    className={`h-7 w-7 p-0 text-xs ${p === currentPage ? "bg-gray-900 text-white" : "text-gray-500"}`}>
                    {p}
                  </Button>
                );
              })}
              <Button variant="outline" size="sm" onClick={() => fetchPreviewData(currentPage + 1)} disabled={currentPage >= meta.totalPages} className="h-7 w-7 p-0 border-gray-200">
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
