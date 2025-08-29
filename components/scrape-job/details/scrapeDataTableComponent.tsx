"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Download, Zap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetaPagination } from "@/types/paginationMeta.type";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { ScrapingData } from "@/types/scraping.type";
import { toast } from "react-toastify";

interface Props {
  initialData: ScrapingData[];
  initialMeta: MetaPagination;
  jobId: string;
  isOnProgress: string;
}

export default function ScrapeDataTableComponent({
  initialData,
  initialMeta,
  jobId,
  isOnProgress,
}: Props) {
  const [scrapingData, setScrapingData] = useState(initialData);
  const [metaPagination, setMetaPagination] = useState(initialMeta);

  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [page, setPage] = useState(initialMeta.page);
  const { user } = useAuth();

  const [selectedRestaurants, setSelectedRestaurants] = useState<
    ScrapingData[]
  >([]);

  const fetchData = async () => {
    const params: any = { page, limit: 15 };

    if (searchTerm) params.keyword = searchTerm;
    if (ratingFilter !== "all") params.rating = ratingFilter;

    const res = await axios.get(`/api/scraping-job/${jobId}`, { params });
    setScrapingData(res.data.data);
    setMetaPagination(res.data.meta);
  };

  useEffect(() => {
    fetchData();
    setSelectedRestaurants([]);
  }, [page, ratingFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRestaurants(scrapingData.filter((r) => !r.hasBeenAdded));
    } else {
      setSelectedRestaurants([]);
    }
  };

  const handleSelectRestaurant = (
    scrapingData: ScrapingData,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedRestaurants([...selectedRestaurants, scrapingData]);
    } else {
      setSelectedRestaurants(
        selectedRestaurants.filter(
          (rid: ScrapingData) => rid.id !== scrapingData.id
        )
      );
    }
  };

  const handleExportSelected = () => {
    if (selectedRestaurants.length === 0) {
      toast.warning("No restaurants selected to export");
      return;
    }

    const headers = ["Name", "Address", "Phone", "Rating", "Website"];

    const rows = selectedRestaurants.map((r) => [
      `"${r.name || ""}"`,
      `"${r.address || ""}"`,
      `"${r.phone || ""}"`,
      `"${r.rating || ""}"`,
      `"${r.website || ""}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "restaurants.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Export successful 🚀");
  };

  const handleMakeProspected = async () => {
    const res = await axios.post(`/api/restaurant`, {
      userId: user.id,
      restaurants: selectedRestaurants,
    });

    if (res.data.code === 200) {
      toast.success("Success to make to prospect");
      window.location.reload();
    }
  };

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[140px] bg-input">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        {selectedRestaurants.length > 0 && (
          <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
            <span className="text-sm text-muted-foreground">
              {selectedRestaurants.length} restaurant(s) selected
            </span>
            <div className="flex flex-row gap-4">
              <Button
                onClick={handleExportSelected}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
              <Button
                onClick={handleMakeProspected}
                size="sm"
                variant="outline"
              >
                <Zap className="h-4 w-4 mr-2" />
                Make Prospected
              </Button>
            </div>
          </div>
        )}

        <div className="border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRestaurants.length === scrapingData.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Restaurant Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scrapingData.map((restaurant) => (
                <TableRow
                  key={restaurant.id}
                  className={`${restaurant.hasBeenAdded ? "opacity-70" : ""}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRestaurants.includes(restaurant)}
                      disabled={restaurant.hasBeenAdded}
                      onCheckedChange={(checked) =>
                        handleSelectRestaurant(restaurant, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium py-3">
                    {restaurant.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground py-3">
                    {restaurant.address}
                  </TableCell>
                  <TableCell className="text-muted-foreground py-3">
                    {restaurant.phone}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      {restaurant.rating}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {isOnProgress !== "COMPLETED" && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mb-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v-2h6v2m-7-8h8M5 7h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 
        2 0 01-2-2V9a2 2 0 012-2z"
                        />
                      </svg>
                      <p className="text-lg font-medium">{isOnProgress}</p>
                      <p className="text-sm text-gray-400">
                        Your Scraping Data Will Display There
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {metaPagination && isOnProgress === "COMPLETED" && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && setPage(page - 1)}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from(
                { length: metaPagination.lastPage },
                (_, i) => i + 1
              ).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === page}
                    onClick={() => setPage(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    page < metaPagination.lastPage && setPage(page + 1)
                  }
                  className={
                    page >= metaPagination.lastPage
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </>
  );
}
