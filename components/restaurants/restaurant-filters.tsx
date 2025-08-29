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
import { Search, Filter, Loader2, X } from "lucide-react";

interface RestaurantFiltersProps {
  filters: {
    search: string;
    status: string;
    rating: string;
    industry: string;
  };
  onFilterChange: (filters: Partial<RestaurantFiltersProps["filters"]>) => void;
  isLoading: boolean;
}

export function RestaurantFilters({
  filters,
  onFilterChange,
  isLoading,
}: RestaurantFiltersProps) {
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([]);
  const [availableRatings] = useState([2, 3, 4, 5]);
  const [searchInput, setSearchInput] = useState(filters.search);

  // Fetch available filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch("/api/restaurant?page=1&limit=1");
        if (response.ok) {
          const data = await response.json();
          setAvailableStatuses(data.filters?.availableStatuses || []);
          setAvailableIndustries(data.filters?.availableIndustries || []);
        }
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Update search input when filters change externally
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchInput });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ status: value });
  };

  const handleRatingChange = (value: string) => {
    onFilterChange({ rating: value });
  };

  const handleIndustryChange = (value: string) => {
    onFilterChange({ industry: value });
  };

  const clearFilters = () => {
    setSearchInput("");
    onFilterChange({
      search: "",
      status: "all",
      rating: "all",
      industry: "all",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.rating !== "all" ||
    filters.industry !== "all";

  return (
    <div className="bg-card p-4 rounded-lg border border-border space-y-4">
      {/* Search Bar */}
      <div className="flex-1">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search restaurants by name, email, phone, address, or company... (Press Enter to search)"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-input pr-20"
            disabled={isLoading}
          />
          {searchInput && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => {
                setSearchInput("");
                onFilterChange({ search: "" });
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </form>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-end">
        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={handleStatusChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[140px] bg-input">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {availableStatuses.map((status) => (
              <SelectItem key={status} value={status.toLowerCase()}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rating Filter */}
        <Select
          value={filters.rating}
          onValueChange={handleRatingChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[140px] bg-input">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {availableRatings.map((rating) => (
              <SelectItem key={rating} value={rating.toString()}>
                {rating}+ Stars
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Industry Filter */}
        <Select
          value={filters.industry}
          onValueChange={handleIndustryChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[160px] bg-input">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {availableIndustries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <X className="h-3 w-3" />
            <span>Clear</span>
          </Button>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Filtering...</span>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Search: "{filters.search}"
            </span>
          )}
          {filters.status !== "all" && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              Status: {filters.status}
            </span>
          )}
          {filters.rating !== "all" && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
              Rating: {filters.rating}+ stars
            </span>
          )}
          {filters.industry !== "all" && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              Industry: {filters.industry}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
