"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Edit, Download, Loader2, Star } from "lucide-react";
import { RestaurantDetailModal } from "@/components/modals/restaurant-detail-modal";
import { MetaPagination } from "@/types/paginationMeta.type";
import { Restaurant } from "@/types/restaurant.type";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

interface Props {
  restaurant: Restaurant[];
  metaPagination: MetaPagination;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export function RestaurantTable({
  restaurant,
  metaPagination,
  onPageChange,
  isLoading,
}: Props) {
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const router = useRouter();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRestaurants(restaurant.map((r) => r.id));
    } else {
      setSelectedRestaurants([]);
    }
  };

  const handleSelectRestaurant = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRestaurants([...selectedRestaurants, id]);
    } else {
      setSelectedRestaurants(selectedRestaurants.filter((rid) => rid !== id));
    }
  };

  const handleViewDetail = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (status?: string) => {
    const variants = {
      prospect: "bg-sky-50 text-sky-700 border border-sky-100",
      contacted: "bg-amber-50 text-amber-700 border border-amber-100",
      closed: "bg-emerald-50 text-emerald-800 border border-emerald-100",
    };
    return variants[status as keyof typeof variants] || variants.prospect;
  };

  const handleExportSelected = () => {
    const selectedData = restaurant.filter((r) =>
      selectedRestaurants.includes(r.id)
    );
    const csv = [
      ["Name", "Address", "Phone", "Email", "Source", "Rating", "Status"].join(
        ","
      ),
      ...selectedData.map((r) =>
        [
          r.name,
          r.address,
          r.phone,
          r.email,
          r.source,
          r.rating,
          r.leadStatus.name,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "restaurants.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleStatusUpdate = async (
    restaurantId: string,
    newStatus: string
  ) => {
    try {
      await axios.put(`/api/restaurant`, {
        leadId: restaurantId,
        status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
      });
      toast.success("Status updated successfully");
      onPageChange(metaPagination.page);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handlePageChange = (page: number) => {
    onPageChange(page);
    // Clear selections when changing pages
    setSelectedRestaurants([]);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60 hover:bg-gray-50/60">
                <TableHead className="w-12">
                  <Checkbox disabled />
                </TableHead>
                <TableHead>Restaurant Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Checkbox disabled />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-100 rounded-md w-3/4 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-100 rounded-md w-full animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-100 rounded-md w-1/2 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 bg-gray-100 rounded-full w-20 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-7 bg-gray-100 rounded-lg w-7 animate-pulse" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {selectedRestaurants.length > 0 && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl">
            <span className="text-sm font-medium text-emerald-800">
              {selectedRestaurants.length} restaurant(s) selected
            </span>
            <Button onClick={handleExportSelected} size="sm" variant="outline" className="border-emerald-200 text-emerald-800 hover:bg-emerald-100 h-7 text-xs">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export Selected
            </Button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60 hover:bg-gray-50/60 border-b border-gray-100">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedRestaurants.length === restaurant.length &&
                      restaurant.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Restaurant Name</TableHead>
                <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Address</TableHead>
                <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Phone</TableHead>
                <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Rating</TableHead>
                <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="w-12 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurant.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    No restaurants found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                restaurant.map((r) => (
                  <TableRow key={r.id} className="hover:bg-[#F8F9FA] border-b border-gray-50 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedRestaurants.includes(r.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRestaurant(r.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-gray-800 text-sm">{r.name}</TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {r.address}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {r.phone}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium text-gray-700">{r.rating}</span>
                        <span className="text-gray-300 text-xs ml-0.5">
                          ({r.reviewCount})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`rounded-full text-[11px] font-medium px-2.5 py-0.5 ${getStatusBadge(
                          r.leadStatus.name.toLowerCase()
                        )}`}
                      >
                        {r.leadStatus.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetail(r)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(r.id, "contacted")
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Mark as Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(r.id, "closed")}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Mark as Closed
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

        {/* Pagination */}
        {metaPagination && metaPagination.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(metaPagination.page - 1)}
                  className={
                    metaPagination.page <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from(
                { length: metaPagination.totalPages },
                (_, i) => i + 1
              ).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === metaPagination.page}
                    onClick={() => handlePageChange(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(metaPagination.page + 1)}
                  className={
                    metaPagination.page >= metaPagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Results Summary */}
        {metaPagination && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {restaurant.length} of {metaPagination.total} restaurants
            {metaPagination.totalPages > 1 && (
              <span>
                {" "}
                • Page {metaPagination.page} of {metaPagination.totalPages}
              </span>
            )}
          </div>
        )}
      </div>

      <RestaurantDetailModal
        initRestaurant={selectedRestaurant}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSave={() => {
          setIsDetailModalOpen(false);
          // Refresh the current page data
          onPageChange(metaPagination.page);
        }}
      />
    </>
  );
}
