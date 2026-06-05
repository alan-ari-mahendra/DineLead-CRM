"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  LayoutGrid,
  LayoutList,
  MapPin,
  Phone as PhoneIcon,
  Globe,
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
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

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

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "prospect":
        return { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" };
      case "contacted":
        return { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" };
      case "closed":
        return { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      default:
        return { dot: "bg-gray-400", badge: "bg-gray-50 text-gray-600 border-gray-200" };
    }
  };

  const hasActiveFilters = filters.search || filters.status !== "all" || filters.rating !== "all" || filters.industry !== "all";

  // Skeleton for grid view
  const GridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bento-card p-6 animate-pulse">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="h-5 bg-gray-100 rounded w-16" />
            <div className="h-4 bg-gray-100 rounded w-10" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="page-bg min-h-screen">
      {/* === Sticky Top Bar === */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="px-4 md:px-6 lg:px-8 py-4">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Restaurants</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {isLoading ? "Loading..." : `${metaPagination.total.toLocaleString()} leads in database`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-white">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`h-7 w-7 rounded-md flex items-center justify-center transition-all ${
                    viewMode === "grid"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`h-7 w-7 rounded-md flex items-center justify-center transition-all ${
                    viewMode === "table"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <LayoutList className="h-3.5 w-3.5" />
                </button>
              </div>

              {selectedRestaurants.length > 0 && (
                <Button
                  onClick={handleExportSelected}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-gray-200"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Export {selectedRestaurants.length}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchFilteredData(filters, metaPagination.page)}
                disabled={isLoading}
                className="h-8 border-gray-200"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <Input
                placeholder="Search restaurants..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8 h-8 text-sm border-gray-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400"
                disabled={isLoading}
              />
              {searchInput && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => { setSearchInput(""); handleFilterChange({ search: "" }); }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            <Select value={filters.status} onValueChange={(v) => handleFilterChange({ status: v })} disabled={isLoading}>
              <SelectTrigger className="w-[120px] h-8 text-xs border-gray-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {availableStatuses.map((s) => (
                  <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.rating} onValueChange={(v) => handleFilterChange({ rating: v })} disabled={isLoading}>
              <SelectTrigger className="w-[110px] h-8 text-xs border-gray-200">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[2, 3, 4, 5].map((r) => (
                  <SelectItem key={r} value={r.toString()}>{r}+ Stars</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.industry} onValueChange={(v) => handleFilterChange({ industry: v })} disabled={isLoading}>
              <SelectTrigger className="w-[130px] h-8 text-xs border-gray-200">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {availableIndustries.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* === Content === */}
      <div className="px-4 md:px-6 lg:px-8 py-6">

        {/* ---- GRID VIEW ---- */}
        {viewMode === "grid" && (
          <>
            {isLoading ? (
              <GridSkeleton />
            ) : restaurants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-gray-200" />
                </div>
                <p className="text-sm font-medium text-gray-400">No restaurants found</p>
                <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {restaurants.map((r) => {
                  const statusCfg = getStatusConfig(r.leadStatus.name);
                  const isSelected = selectedRestaurants.includes(r.id);
                  return (
                    <div
                      key={r.id}
                      className={`bento-card bento-card-lift cursor-pointer group relative ${
                        isSelected ? "ring-2 ring-emerald-500 ring-offset-1" : ""
                      }`}
                      onClick={() => { setSelectedRestaurant(r); setIsDetailModalOpen(true); }}
                    >
                      {/* Select checkbox — top-left */}
                      <div
                        className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectRestaurant(r.id, checked as boolean)}
                          className="border-gray-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                      </div>

                      {/* Action Menu — top-right */}
                      <div
                        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-500 hover:text-gray-800"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl border-gray-100 shadow-lg">
                            <DropdownMenuItem
                              onClick={() => { setSelectedRestaurant(r); setIsDetailModalOpen(true); }}
                              className="rounded-lg"
                            >
                              <Eye className="h-4 w-4 mr-2" /> View Detail
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(r.id, "contacted")}
                              className="rounded-lg"
                            >
                              <Edit className="h-4 w-4 mr-2" /> Mark Contacted
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(r.id, "closed")}
                              className="rounded-lg"
                            >
                              <Edit className="h-4 w-4 mr-2" /> Mark Closed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        {/* Avatar + Name */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0 text-white font-bold text-base shadow-sm">
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                              {r.name}
                            </p>
                            {r.company?.name && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{r.company.name}</p>
                            )}
                          </div>
                        </div>

                        {/* Info rows */}
                        <div className="space-y-2 mb-4">
                          {r.address && (
                            <div className="flex items-start gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-gray-300 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{r.address}</p>
                            </div>
                          )}
                          {r.phone && (
                            <div className="flex items-center gap-1.5">
                              <PhoneIcon className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                              <p className="text-xs text-gray-500 tabular-nums">{r.phone}</p>
                            </div>
                          )}
                          {r.company?.website && r.company.website !== "-" && (
                            <div className="flex items-center gap-1.5">
                              <Globe className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                              <p className="text-xs text-gray-400 truncate">{r.company.website}</p>
                            </div>
                          )}
                        </div>

                        {/* Footer: Rating + Status */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-semibold text-gray-800 tabular-nums">{r.rating}</span>
                            <span className="text-xs text-gray-300">({r.reviewCount})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.badge}`}>
                              {r.leadStatus.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ---- TABLE VIEW ---- */}
        {viewMode === "table" && (
          <div className="bento-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                  <TableHead className="w-10 pl-4">
                    <Checkbox
                      checked={selectedRestaurants.length === restaurants.length && restaurants.length > 0}
                      onCheckedChange={handleSelectAll}
                      disabled={isLoading}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Address</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rating</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-gray-50">
                      <TableCell className="pl-4">
                        <div className="w-4 h-4 rounded bg-gray-100 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse" />
                          <div>
                            <div className="h-3.5 bg-gray-100 rounded w-32 mb-1 animate-pulse" />
                            <div className="h-3 bg-gray-100 rounded w-20 animate-pulse" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="h-3 bg-gray-100 rounded w-40 animate-pulse" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
                      </TableCell>
                      <TableCell><div className="h-3 bg-gray-100 rounded w-12 animate-pulse" /></TableCell>
                      <TableCell><div className="h-5 bg-gray-100 rounded w-16 animate-pulse" /></TableCell>
                      <TableCell><div className="h-6 bg-gray-100 rounded w-6 animate-pulse" /></TableCell>
                    </TableRow>
                  ))
                ) : restaurants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <Building2 className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                      <p className="text-sm text-gray-400">No restaurants found</p>
                      <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  restaurants.map((r) => {
                    const statusCfg = getStatusConfig(r.leadStatus.name);
                    return (
                      <TableRow
                        key={r.id}
                        className={`group cursor-pointer border-gray-50 transition-colors ${
                          selectedRestaurants.includes(r.id)
                            ? "bg-emerald-50/50"
                            : "hover:bg-gray-50/50"
                        }`}
                        onClick={() => { setSelectedRestaurant(r); setIsDetailModalOpen(true); }}
                      >
                        <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedRestaurants.includes(r.id)}
                            onCheckedChange={(checked) => handleSelectRestaurant(r.id, checked as boolean)}
                            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                              {r.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                                {r.name}
                              </p>
                              {r.company?.name && (
                                <p className="text-xs text-gray-400 truncate">{r.company.name}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="text-sm text-gray-400 truncate max-w-[250px]">{r.address}</p>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <p className="text-sm text-gray-400 tabular-nums">{r.phone}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-medium text-gray-800 tabular-nums">{r.rating}</span>
                            <span className="text-xs text-gray-300">({r.reviewCount})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            <span className="text-xs font-medium text-gray-600">{r.leadStatus.name}</span>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-xl border-gray-100 shadow-lg">
                              <DropdownMenuItem
                                onClick={() => { setSelectedRestaurant(r); setIsDetailModalOpen(true); }}
                                className="rounded-lg"
                              >
                                <Eye className="h-4 w-4 mr-2" /> View Detail
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(r.id, "contacted")}
                                className="rounded-lg"
                              >
                                <Edit className="h-4 w-4 mr-2" /> Mark Contacted
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(r.id, "closed")}
                                className="rounded-lg"
                              >
                                <Edit className="h-4 w-4 mr-2" /> Mark Closed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* === Pagination === */}
        {metaPagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-5 px-1">
            <p className="text-xs text-gray-400">
              Page {metaPagination.page} of {metaPagination.totalPages} · {metaPagination.total} results
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(metaPagination.page - 1)}
                disabled={!metaPagination.hasPrevPage}
                className="h-7 w-7 p-0 border-gray-200 rounded-lg"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
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
                return (
                  <Button
                    key={page}
                    variant={page === metaPagination.page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`h-7 w-7 p-0 text-xs rounded-lg ${
                      page === metaPagination.page
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
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
                className="h-7 w-7 p-0 border-gray-200 rounded-lg"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
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
