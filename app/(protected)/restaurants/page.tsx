"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  X,
  Loader2,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Star,
  Building2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { RestaurantDetailModal } from "@/components/modals/restaurant-detail-modal";
import { Restaurant } from "@/types/restaurant.type";
import { MetaPagination } from "@/types/paginationMeta.type";
import axios from "axios";
import { toast } from "react-toastify";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [metaPagination, setMetaPagination] = useState<MetaPagination>({
    page: 1, limit: 15, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: "all", rating: "all", industry: "all" });
  const [searchInput, setSearchInput] = useState("");
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchFilteredData(filters, 1);
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch("/api/restaurant?page=1&limit=1");
      if (response.ok) {
        const data = await response.json();
        setAvailableStatuses(data.filters?.availableStatuses || []);
        setAvailableIndustries(data.filters?.availableIndustries || []);
      }
    } catch {}
  };

  const fetchFilteredData = async (newFilters: typeof filters, page: number = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(), limit: "15",
        ...(newFilters.search && { search: newFilters.search }),
        ...(newFilters.status !== "all" && { status: newFilters.status }),
        ...(newFilters.rating !== "all" && { rating: newFilters.rating }),
        ...(newFilters.industry !== "all" && { industry: newFilters.industry }),
      });
      const response = await fetch(`/api/restaurant?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setRestaurants(data.data);
      setMetaPagination(data.meta);
    } catch {} finally { setIsLoading(false); }
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    fetchFilteredData(updated, 1);
  };

  const handlePageChange = (page: number) => {
    fetchFilteredData(filters, page);
    setSelectedRestaurants([]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange({ search: searchInput });
  };

  const clearFilters = () => {
    setSearchInput("");
    handleFilterChange({ search: "", status: "all", rating: "all", industry: "all" });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedRestaurants(checked ? restaurants.map((r) => r.id) : []);
  };

  const handleSelectRestaurant = (id: string, checked: boolean) => {
    setSelectedRestaurants(checked ? [...selectedRestaurants, id] : selectedRestaurants.filter((rid) => rid !== id));
  };

  const handleStatusUpdate = async (restaurantId: string, newStatus: string) => {
    try {
      await axios.put(`/api/restaurant`, { leadId: restaurantId, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) });
      toast.success("Status updated successfully");
      handlePageChange(metaPagination.page);
    } catch { toast.error("Failed to update status"); }
  };

  const handleExportSelected = () => {
    const selectedData = restaurants.filter((r) => selectedRestaurants.includes(r.id));
    const csv = [
      ["Name", "Address", "Phone", "Email", "Source", "Rating", "Status"].join(","),
      ...selectedData.map((r) => [r.name, r.address, r.phone, r.email, r.source, r.rating, r.leadStatus.name].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "restaurants.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
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

  const hasActiveFilters = !!(filters.search || filters.status !== "all" || filters.rating !== "all" || filters.industry !== "all");

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-5 md:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Restaurants</h1>
          <p className="text-sm text-gray-400 mt-0.5">{metaPagination.total} total leads in pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedRestaurants.length > 0 && (
            <Button
              onClick={handleExportSelected}
              size="sm"
              className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm h-8 px-3 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export {selectedRestaurants.length} Selected
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchFilteredData(filters, metaPagination.page)}
            disabled={isLoading}
            className="shadow-sm border-gray-200 bg-white h-8 w-8 p-0"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* ── Filters Card ── */}
      <div className="bg-white p-5 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, address, phone or company..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 h-10 text-sm border-gray-200 bg-gray-50/30 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 focus:bg-white transition-all rounded-xl"
              disabled={isLoading}
            />
            {searchInput && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => { setSearchInput(""); handleFilterChange({ search: "" }); }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Select dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filters.status} onValueChange={(v) => handleFilterChange({ status: v })} disabled={isLoading}>
              <SelectTrigger className="w-[140px] h-10 text-sm border-gray-200 bg-white rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {availableStatuses.map((s) => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.rating} onValueChange={(v) => handleFilterChange({ rating: v })} disabled={isLoading}>
              <SelectTrigger className="w-[130px] h-10 text-sm border-gray-200 bg-white rounded-xl"><SelectValue placeholder="Rating" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[2, 3, 4, 5].map((r) => <SelectItem key={r} value={r.toString()}>{r}+ Stars</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.industry} onValueChange={(v) => handleFilterChange({ industry: v })} disabled={isLoading}>
              <SelectTrigger className="w-[160px] h-10 text-sm border-gray-200 bg-white rounded-xl"><SelectValue placeholder="Industry" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {availableIndustries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 h-10 px-3 rounded-xl"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider self-center mr-1">Active:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                Search: "{filters.search}"
              </span>
            )}
            {filters.status !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-100">
                Status: {filters.status}
              </span>
            )}
            {filters.rating !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100">
                Rating: {filters.rating}+ stars
              </span>
            )}
            {filters.industry !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-800 border border-sky-100">
                Industry: {filters.industry}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/60 hover:bg-gray-50/60 border-b border-gray-100">
              <TableHead className="w-12 pl-5">
                <Checkbox
                  checked={selectedRestaurants.length === restaurants.length && restaurants.length > 0}
                  onCheckedChange={handleSelectAll}
                  disabled={isLoading}
                  className="border-gray-300 data-[state=checked]:bg-emerald-700 data-[state=checked]:border-emerald-700 rounded"
                />
              </TableHead>
              <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-wider py-4">Name</TableHead>
              <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-wider py-4 hidden md:table-cell">Address</TableHead>
              <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-wider py-4 hidden lg:table-cell">Phone</TableHead>
              <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-wider py-4">Rating</TableHead>
              <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-wider py-4">Status</TableHead>
              <TableHead className="w-12 py-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="border-b border-gray-50">
                  <TableCell className="pl-5">
                    <div className="w-4 h-4 rounded bg-gray-100 animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 bg-gray-100 rounded w-32 animate-pulse" />
                        <div className="h-3 bg-gray-100 rounded w-20 animate-pulse" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-3">
                    <div className="h-3.5 bg-gray-100 rounded w-44 animate-pulse" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell py-3">
                    <div className="h-3.5 bg-gray-100 rounded w-28 animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-3.5 bg-gray-100 rounded w-12 animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-5 bg-gray-100 rounded-full w-16 animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-6 bg-gray-100 rounded-lg w-6 animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : restaurants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-20 bg-gray-50/10">
                  <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                  <p className="text-base font-semibold text-gray-600">No restaurants found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query</p>
                </TableCell>
              </TableRow>
            ) : (
              restaurants.map((r) => (
                <TableRow
                  key={r.id}
                  className={cn(
                    "group cursor-pointer border-b border-gray-50 transition-colors py-3.5",
                    selectedRestaurants.includes(r.id) ? "bg-emerald-50/20 hover:bg-emerald-50/30" : "hover:bg-gray-50/50"
                  )}
                  onClick={() => { setSelectedRestaurant(r); setIsDetailModalOpen(true); }}
                >
                  <TableCell className="pl-5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRestaurants.includes(r.id)}
                      onCheckedChange={(checked) => handleSelectRestaurant(r.id, checked as boolean)}
                      className="border-gray-300 data-[state=checked]:bg-emerald-700 data-[state=checked]:border-emerald-700 rounded"
                    />
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                          {r.name}
                        </p>
                        {r.company?.name && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{r.company.name}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-3.5">
                    <p className="text-sm text-gray-500 truncate max-w-[280px]">{r.address}</p>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell py-3.5">
                    <p className="text-sm text-gray-500 tabular-nums">{r.phone}</p>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">{r.rating}</span>
                      <span className="text-xs text-gray-400">({r.reviewCount})</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Badge className={cn("rounded-full text-[11px] font-medium px-2.5 py-0.5 shadow-none border", getStatusBadge(r.leadStatus.name))}>
                      {r.leadStatus.name}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()} className="py-3.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg border-gray-100">
                        <DropdownMenuItem onClick={() => { setSelectedRestaurant(r); setIsDetailModalOpen(true); }} className="rounded-lg">
                          <Eye className="h-4 w-4 mr-2" /> View Detail
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="border-gray-100" />
                        <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, "contacted")} className="rounded-lg">
                          <Edit className="h-4 w-4 mr-2" /> Mark Contacted
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, "closed")} className="rounded-lg">
                          <Edit className="h-4 w-4 mr-2" /> Mark Closed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* ── Pagination & Summary ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/20">
          <p className="text-xs text-gray-400 font-medium">
            Showing <span className="font-semibold text-gray-700">{restaurants.length}</span> of <span className="font-semibold text-gray-700">{metaPagination.total}</span> leads
          </p>
          {metaPagination.totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(metaPagination.page - 1)}
                disabled={!metaPagination.hasPrevPage}
                className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50 bg-white rounded-lg"
              >
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              </Button>
              {Array.from({ length: Math.min(metaPagination.totalPages, 5) }, (_, i) => {
                let page: number;
                if (metaPagination.totalPages <= 5) {
                  page = i + 1;
                } else if (metaPagination.page <= 3) {
                  page = i + 1;
                } else if (metaPagination.page >= metaPagination.totalPages - 2) {
                  page = metaPagination.totalPages - 4 + i;
                } else {
                  page = metaPagination.page - 2 + i;
                }
                const isCurrent = page === metaPagination.page;
                return (
                  <Button
                    key={page}
                    variant={isCurrent ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      "h-8 w-8 p-0 text-xs font-semibold rounded-lg transition-all",
                      isCurrent
                        ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(metaPagination.page + 1)}
                disabled={!metaPagination.hasNextPage}
                className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50 bg-white rounded-lg"
              >
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <RestaurantDetailModal
        initRestaurant={selectedRestaurant}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSave={() => { setIsDetailModalOpen(false); handlePageChange(metaPagination.page); }}
      />
    </div>
  );
}
