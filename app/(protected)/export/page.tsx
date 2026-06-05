"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "prospect":
        return "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-50";
      case "contacted":
        return "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50";
      case "closed":
        return "bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-50";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-5 md:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Export Data</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Configure and export your restaurant data pipeline in various formats with advanced filters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["csv", "excel", "json"] as const).map((format) => {
            const icons = { csv: FileText, excel: FileSpreadsheet, json: Database };
            const Icon = icons[format];
            const isExcel = format === "excel";
            return (
              <Button
                key={format}
                onClick={() => handleExport(format)}
                disabled={isExporting || totalRecords === 0}
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs font-semibold shadow-sm transition-all rounded-lg",
                  isExcel
                    ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                    : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                )}
                variant={isExcel ? "default" : "outline"}
              >
                {isExporting && exportFormat === format ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5 mr-1.5" />
                )}
                {format.toUpperCase()}
              </Button>
            );
          })}
        </div>
      </div>

      {/* ── Filters & Configuration Card ── */}
      <div className="bg-white p-5 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px] h-10 text-sm border-gray-200 bg-white rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger className="w-[130px] h-10 text-sm border-gray-200 bg-white rounded-xl"><SelectValue placeholder="Rating" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
            </SelectContent>
          </Select>

          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[150px] h-10 text-sm border-gray-200 bg-white rounded-xl"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="jakarta">Jakarta</SelectItem>
              <SelectItem value="bandung">Bandung</SelectItem>
              <SelectItem value="surabaya">Surabaya</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-10">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>

          <Button
            onClick={() => setShowFieldSelector(!showFieldSelector)}
            variant="outline"
            className="flex items-center gap-1.5 h-10 px-4 text-sm border-gray-200 bg-white rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <span>Fields ({selectedFields.length})</span>
            {showFieldSelector ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {isLoadingTotal ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium ml-auto">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
              <span>Calculating...</span>
            </div>
          ) : (
            <div className="text-xs text-gray-400 font-semibold ml-auto uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              Matches: <span className="text-emerald-700 font-bold">{totalRecords}</span> leads
            </div>
          )}
        </div>

        {/* Collapsible Field Selector */}
        {showFieldSelector && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-x-5 gap-y-2.5">
              {AVAILABLE_FIELDS.map((field) => (
                <label key={field.id} className="flex items-center gap-2 cursor-pointer group select-none">
                  <Checkbox
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={(checked) => handleFieldToggle(field.id, checked as boolean)}
                    className="h-4 w-4 border-gray-300 data-[state=checked]:bg-emerald-700 data-[state=checked]:border-emerald-700 rounded"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{field.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Table Card (Data Preview) ── */}
      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        {isLoadingPreview ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60 hover:bg-gray-50/60 border-b border-gray-100">
                {selectedFields.map((field) => (
                  <TableHead key={field} className="font-semibold text-gray-500 text-xs uppercase tracking-wider py-4">
                    {FIELD_LABELS[field] || field}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-gray-50">
                  {selectedFields.map((field) => (
                    <TableCell key={field} className="py-4 px-4">
                      <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : !selectedFields.length ? (
          <div className="text-center py-20 bg-gray-50/10">
            <Download className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p className="text-base font-semibold text-gray-600">Select fields to preview export data</p>
            <p className="text-sm text-gray-400 mt-1">Check at least one column field above to show matching rows</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/60 hover:bg-gray-50/60 border-b border-gray-100">
                  {selectedFields.map((field) => (
                    <TableHead key={field} className="font-semibold text-gray-500 text-xs uppercase tracking-wider py-4 whitespace-nowrap">
                      {FIELD_LABELS[field] || field}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedFields.length} className="text-center py-20 bg-gray-50/10">
                      <Download className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                      <p className="text-base font-semibold text-gray-600">No matching leads found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or date range</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  previewData.map((row, i) => (
                    <TableRow key={i} className="hover:bg-gray-50/50 border-b border-gray-50 transition-colors">
                      {selectedFields.map((field) => (
                        <TableCell key={field} className="text-sm py-3.5 whitespace-nowrap">
                          {field === "name" ? (
                            <span className="font-semibold text-gray-900">{row[field]}</span>
                          ) : field === "rating" ? (
                            <div className="flex items-center gap-1.5">
                              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                              <span className="font-semibold text-gray-900 tabular-nums">{row[field]}</span>
                            </div>
                          ) : field === "status" ? (
                            <Badge className={cn("rounded-full text-[11px] font-medium px-2.5 py-0.5 shadow-none border", getStatusBadge(row[field]))}>
                              {row[field]}
                            </Badge>
                          ) : field === "companyIndustry" ? (
                            <span className="text-gray-500 text-xs">{Array.isArray(row[field]) ? row[field].join(", ") : "-"}</span>
                          ) : (
                            <span className="text-gray-500 truncate max-w-[220px] block" title={row[field]}>
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

            {/* ── Pagination & Summary ── */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/20">
              <p className="text-xs text-gray-400 font-medium">
                Showing Preview <span className="font-semibold text-gray-700">{previewData.length}</span> of <span className="font-semibold text-gray-700">{meta.total}</span> leads
              </p>
              {meta.totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchPreviewData(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50 bg-white rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-500" />
                  </Button>
                  {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                    let p: number;
                    if (meta.totalPages <= 5) p = i + 1;
                    else if (currentPage <= 3) p = i + 1;
                    else if (currentPage >= meta.totalPages - 2) p = meta.totalPages - 4 + i;
                    else p = currentPage - 2 + i;
                    const isCurrent = p === currentPage;
                    return (
                      <Button
                        key={p}
                        variant={isCurrent ? "default" : "ghost"}
                        size="sm"
                        onClick={() => fetchPreviewData(p)}
                        className={cn(
                          "h-8 w-8 p-0 text-xs font-semibold rounded-lg transition-all",
                          isCurrent
                            ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        {p}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchPreviewData(currentPage + 1)}
                    disabled={currentPage >= meta.totalPages}
                    className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50 bg-white rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
