"use client";

import React, { useState, useEffect } from "react";
import { RestaurantFilters } from "./restaurant-filters";
import { RestaurantTable } from "@/components/restaurants/restaurant-table";
import { Restaurant } from "@/types/restaurant.type";
import { MetaPagination } from "@/types/paginationMeta.type";

export default function RestaurantComponent() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [metaPagination, setMetaPagination] = useState<MetaPagination>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    rating: "all",
    industry: "all",
  });

  // Fetch initial data
  useEffect(() => {
    fetchFilteredData(filters, 1);
  }, []);

  // Fetch filtered data
  const fetchFilteredData = async (
    newFilters: typeof filters,
    page: number = 1
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
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
    } catch (error) {
      console.error("Failed to fetch filtered data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchFilteredData(updatedFilters, 1); // Reset to page 1 when filters change
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchFilteredData(filters, page);
  };

  return (
    <>
      <RestaurantFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
      />
      <RestaurantTable
        restaurant={restaurants}
        metaPagination={metaPagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </>
  );
}
