"use client";

import React from "react";
import { RestaurantFilters } from "./restaurant-filters";
import { RestaurantTable } from "./restaurant-table";
import { Restaurant } from "@/types/restaurant.type";
import { MetaPagination } from "@/types/paginationMeta.type";

interface Props {
  restaurant: Restaurant[];
  metaPagination: MetaPagination;
}

export default function RestaurantComponent({
  restaurant,
  metaPagination,
}: Props) {
  console.log(restaurant);

  return (
    <>
      <RestaurantFilters />
      <RestaurantTable
        restaurant={restaurant}
        metaPagination={metaPagination}
      />
    </>
  );
}
