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
import { MoreHorizontal, Eye, Edit, Download, Loader2 } from "lucide-react";
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
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
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

  const handleViewDetail = (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (status?: string) => {
    const variants = {
      prospect: "bg-blue-100 text-blue-800 border-blue-200",
      contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
      closed: "bg-green-100 text-green-800 border-green-200",
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
      await axios.put(`${process.env.NEXT_PUBLIC_URL}/api/restaurant`, {
        leadId: restaurantId,
        status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
      });
      toast.success("Status updated successfully");
      // Refresh the current page data
      onPageChange(metaPagination.page);
    } catch (error) {
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
        <div className="border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
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
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-gray-200 rounded w-8 animate-pulse" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {selectedRestaurants.length > 0 && (
          <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
            <span className="text-sm text-muted-foreground">
              {selectedRestaurants.length} restaurant(s) selected
            </span>
            <Button onClick={handleExportSelected} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
          </div>
        )}

        <div className="border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedRestaurants.length === restaurant.length &&
                      restaurant.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Restaurant Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurant.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No restaurants found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                restaurant.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRestaurants.includes(r.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRestaurant(r.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.address}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.phone}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        {r.rating}
                        <span className="text-muted-foreground text-xs ml-1">
                          ({r.reviewCount} reviews)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusBadge(
                          r.leadStatus.name.toLowerCase()
                        )}
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
