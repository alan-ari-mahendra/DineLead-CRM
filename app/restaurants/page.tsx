import { RestaurantTable } from "@/components/restaurants/restaurant-table"
import { RestaurantFilters } from "@/components/restaurants/restaurant-filters"

export default function RestaurantsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Management</h1>
        <p className="text-gray-600">Manage and track your restaurant leads and contacts.</p>
      </div>

      <RestaurantFilters />
      <RestaurantTable />
    </div>
  )
}
