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
import { MoreHorizontal, Eye, Edit, Download } from "lucide-react";
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
}

export function RestaurantTable({ restaurant, metaPagination }: Props) {
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
      ["Name", "Address", "Phone", "Email", "Source"].join(","),
      ...selectedData.map((r) =>
        [r.name, r.address, r.phone, r.email, r.source].join(",")
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
      window.location.reload();
    } catch (error) {
      toast.error("Failed while update status");
    }
  };

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
                    checked={selectedRestaurants.length === restaurant.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Restaurant Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurant.map((r) => (
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
                          onClick={() => handleStatusUpdate(r.id, "contacted")}
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
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {metaPagination && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    metaPagination.page > 1 &&
                    router.push(`/restaurants?page=${metaPagination.page - 1}`)
                  }
                  className={
                    metaPagination.page <= 1
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>

              {Array.from(
                { length: metaPagination.lastPage },
                (_, i) => i + 1
              ).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === metaPagination.page}
                    onClick={() => router.push(`/restaurants?page=${p}`)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    metaPagination.page < metaPagination.lastPage &&
                    router.push(`/restaurants?page=${metaPagination.page + 1}`)
                  }
                  className={
                    metaPagination.page >= metaPagination.lastPage
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <RestaurantDetailModal
        initRestaurant={selectedRestaurant}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSave={() => {
          setIsDetailModalOpen(false);
          window.location.reload();
        }}
      />
    </>
  );
}
