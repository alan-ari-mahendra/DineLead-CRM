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
  List,
  Phone,
  MapPin,
  Globe,
  ExternalLink,
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
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  useEffect(() => {
    const saved = localStorage.getItem("restaurants-view-mode");
    if (saved === "grid" || saved === "table") {
      setViewMode(saved);
    }
  }, []);

  const handleToggleViewMode = (mode: "table" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("restaurants-view-mode", mode);
  };

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

  const getStatusDot = (status: string) => {
    switch (status.toLowerCase()) {
      case "prospect": return "bg-blue-500";
      case "contacted": return "bg-amber-500";
      case "closed": return "bg-emerald-500";
      default: return "bg-gray-500";
    }
  };

  const hasActiveFilters = filters.search || filters.status !== "all" || filters.rating !== "all" || filters.industry !== "all";

  return (
    <div className="min-h-screen bg-muted">
      {/* Top Bar */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Restaurants</h1>
                <p className="text-sm text-gray-450 mt-0.5">{metaPagination.total} total leads</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedRestaurants.length > 0 && (
                <Button onClick={handleExportSelected} size="sm" variant="outline" className="h-8 text-xs">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Export {selectedRestaurants.length}
                </Button>
              )}

              {/* View Switcher */}
              <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50/50 mr-1 shrink-0">
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleToggleViewMode("table")}
                  className={`h-7 px-2.5 text-xs ${viewMode === "table" ? "bg-white shadow-sm text-emerald-800 font-semibold" : "text-gray-500 hover:text-gray-900"}`}
                >
                  <List className="h-3.5 w-3.5 mr-1" />
                  Table
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleToggleViewMode("grid")}
                  className={`h-7 px-2.5 text-xs ${viewMode === "grid" ? "bg-white shadow-sm text-emerald-800 font-semibold" : "text-gray-500 hover:text-gray-900"}`}
                >
                  <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                  Bento Grid
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchFilteredData(filters, metaPagination.page)}
                disabled={isLoading}
                className="h-8"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          {/* Search + Inline Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <Input
                placeholder="Search restaurants..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8 h-8 text-sm border-gray-200"
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
              <SelectTrigger className="w-[120px] h-8 text-xs border-gray-200"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {availableStatuses.map((s) => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.rating} onValueChange={(v) => handleFilterChange({ rating: v })} disabled={isLoading}>
              <SelectTrigger className="w-[110px] h-8 text-xs border-gray-200"><SelectValue placeholder="Rating" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[2, 3, 4, 5].map((r) => <SelectItem key={r} value={r.toString()}>{r}+ Stars</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.industry} onValueChange={(v) => handleFilterChange({ industry: v })} disabled={isLoading}>
              <SelectTrigger className="w-[130px] h-8 text-xs border-gray-200"><SelectValue placeholder="Industry" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {availableIndustries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 md:px-6 lg:px-8 py-4">
        {viewMode === "table" ? (
          <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="w-10 pl-4">
                    <Checkbox
                      checked={selectedRestaurants.length === restaurants.length && restaurants.length > 0}
                      onCheckedChange={handleSelectAll}
                      disabled={isLoading}
                    />
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Address</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-4"><div className="w-4 h-4 rounded bg-gray-100 animate-pulse" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                          <div><div className="h-3.5 bg-gray-100 rounded w-32 mb-1 animate-pulse" /><div className="h-3 bg-gray-100 rounded w-20 animate-pulse" /></div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell"><div className="h-3 bg-gray-100 rounded w-40 animate-pulse" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><div className="h-3 bg-gray-100 rounded w-24 animate-pulse" /></TableCell>
                      <TableCell><div className="h-3 bg-gray-100 rounded w-12 animate-pulse" /></TableCell>
                      <TableCell><div className="h-5 bg-gray-100 rounded w-16 animate-pulse" /></TableCell>
                      <TableCell><div className="h-6 bg-gray-100 rounded w-6 animate-pulse" /></TableCell>
                    </TableRow>
                  ))
                ) : restaurants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <Building2 className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                      <p className="text-sm text-gray-500">No restaurants found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  restaurants.map((r) => (
                    <TableRow
                      key={r.id}
                      className={`group cursor-pointer transition-colors ${
                        selectedRestaurants.includes(r.id) ? "bg-emerald-50/20" : "hover:bg-gray-50/50"
                      }`}
                      onClick={() => { setSelectedRestaurant(r); setIsDetailModalOpen(true); }}
                    >
                      <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRestaurants.includes(r.id)}
                          onCheckedChange={(checked) => handleSelectRestaurant(r.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-600">
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
                        <p className="text-sm text-gray-500 truncate max-w-[250px]">{r.address}</p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <p className="text-sm text-gray-500 tabular-nums">{r.phone}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-medium text-gray-900 tabular-nums">{r.rating}</span>
                          <span className="text-xs text-gray-400">({r.reviewCount})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(r.leadStatus.name)}`} />
                          <span className="text-xs font-medium text-gray-600">{r.leadStatus.name}</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => { setSelectedRestaurant(r); setIsDetailModalOpen(true); }}>
                              <Eye className="h-4 w-4 mr-2" /> View Detail
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, "contacted")}>
                              <Edit className="h-4 w-4 mr-2" /> Mark Contacted
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, "closed")}>
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
          </div>
        ) : (
          /* Bento Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 space-y-4 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-full bg-gray-100" />
                    <div className="h-5 bg-gray-100 rounded w-20" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded w-full" />
                    <div className="h-3.5 bg-gray-100 rounded w-5/6" />
                  </div>
                  <div className="h-8 bg-gray-100 rounded w-24 pt-4" />
                </div>
              ))
            ) : restaurants.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <Building2 className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                <p className="text-sm text-gray-500">No restaurants found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              restaurants.map((r, index) => {
                const isFeatured = r.rating >= 4.5 || index % 5 === 0;
                return (
                  <div
                    key={r.id}
                    className={`group cursor-pointer bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all flex flex-col justify-between p-6 md:p-8 ${
                      isFeatured ? "md:col-span-2" : "col-span-1"
                    } ${selectedRestaurants.includes(r.id) ? "ring-2 ring-emerald-600/30 bg-emerald-50/10" : ""}`}
                    onClick={() => { setSelectedRestaurant(r); setIsDetailModalOpen(true); }}
                  >
                    <div>
                      {/* Top Header Row of the Card */}
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedRestaurants.includes(r.id)}
                            onCheckedChange={(checked) => handleSelectRestaurant(r.id, checked as boolean)}
                          />
                          <div className="flex items-center gap-1.5 ml-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(r.leadStatus.name)}`} />
                            <span className="text-xs font-medium text-gray-500">{r.leadStatus.name}</span>
                          </div>
                        </div>

                        <div onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-75 hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => { setSelectedRestaurant(r); setIsDetailModalOpen(true); }}>
                                <Eye className="h-4 w-4 mr-2" /> View Detail
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, "contacted")}>
                                <Edit className="h-4 w-4 mr-2" /> Mark Contacted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, "closed")}>
                                <Edit className="h-4 w-4 mr-2" /> Mark Closed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Title & Company */}
                      <div className="mb-4">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {r.name}
                        </h3>
                        {r.company?.name && (
                          <p className="text-xs text-gray-400 font-medium truncate mt-0.5">{r.company.name}</p>
                        )}
                      </div>

                      {/* Card Content Columns */}
                      <div className={`grid gap-4 ${isFeatured ? "grid-cols-2" : "grid-cols-1"} text-sm text-gray-500`}>
                        <div className="space-y-2.5">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                            <span className="line-clamp-2 text-xs">{r.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                            <span className="tabular-nums text-xs">{r.phone || "-"}</span>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
                            <span className="font-semibold text-gray-900 text-xs tabular-nums">{r.rating}</span>
                            <span className="text-[11px] text-gray-400">({r.reviewCount} reviews)</span>
                          </div>
                          {isFeatured && r.company?.website && r.company.website !== "-" && (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                              <a
                                href={r.company.website.startsWith("http") ? r.company.website : `https://${r.company.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-600 hover:underline truncate flex items-center gap-1"
                              >
                                {r.company.website}
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-gray-55">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 h-8 animate-all"
                        onClick={(e) => { e.stopPropagation(); setSelectedRestaurant(r); setIsDetailModalOpen(true); }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View Lead
                      </Button>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {r.leadStatus.name.toLowerCase() !== "contacted" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] font-medium border-gray-200 hover:bg-gray-50 bg-white"
                            onClick={() => handleStatusUpdate(r.id, "contacted")}
                          >
                            Contacted
                          </Button>
                        )}
                        {r.leadStatus.name.toLowerCase() !== "closed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
                            onClick={() => handleStatusUpdate(r.id, "closed")}
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {metaPagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-1">
            <p className="text-xs text-gray-400">
              Page {metaPagination.page} of {metaPagination.totalPages} · {metaPagination.total} results
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(metaPagination.page - 1)}
                disabled={!metaPagination.hasPrevPage}
                className="h-7 w-7 p-0 border-gray-200 bg-white"
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
                    variant={page === metaPagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`h-7 w-7 p-0 text-xs ${page === metaPagination.page ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-gray-500 bg-white"}`}
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
                className="h-7 w-7 p-0 border-gray-200 bg-white"
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
