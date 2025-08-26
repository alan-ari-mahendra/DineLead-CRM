"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, Download } from "lucide-react"
import { RestaurantDetailModal } from "@/components/modals/restaurant-detail-modal"

// Mock data
const restaurants = [
  {
    id: 1,
    name: "Warung Padang Sederhana",
    address: "Jl. Sudirman No. 123, Jakarta",
    phone: "+62 21 1234567",
    rating: 4.5,
    status: "prospect",
  },
  {
    id: 2,
    name: "Sate Ayam Pak Budi",
    address: "Jl. Malioboro No. 45, Yogyakarta",
    phone: "+62 274 987654",
    rating: 4.2,
    status: "contacted",
  },
  {
    id: 3,
    name: "Bakso Solo Enaknya",
    address: "Jl. Pahlawan No. 78, Solo",
    phone: "+62 271 456789",
    rating: 4.8,
    status: "closed",
  },
  {
    id: 4,
    name: "Nasi Gudeg Bu Tjitro",
    address: "Jl. Tugu No. 12, Yogyakarta",
    phone: "+62 274 123456",
    rating: 4.6,
    status: "prospect",
  },
  {
    id: 5,
    name: "Ayam Geprek Bensu",
    address: "Jl. Kemang Raya No. 89, Jakarta",
    phone: "+62 21 987654",
    rating: 4.3,
    status: "contacted",
  },
]

export function RestaurantTable() {
  const [selectedRestaurants, setSelectedRestaurants] = useState<number[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRestaurants(restaurants.map((r) => r.id))
    } else {
      setSelectedRestaurants([])
    }
  }

  const handleSelectRestaurant = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRestaurants([...selectedRestaurants, id])
    } else {
      setSelectedRestaurants(selectedRestaurants.filter((rid) => rid !== id))
    }
  }

  const handleViewDetail = (restaurant: any) => {
    setSelectedRestaurant(restaurant)
    setIsDetailModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      prospect: "bg-blue-100 text-blue-800 border-blue-200",
      contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
      closed: "bg-green-100 text-green-800 border-green-200",
    }
    return variants[status as keyof typeof variants] || variants.prospect
  }

  const handleExportSelected = () => {
    // In a real app, this would export the selected restaurants
    console.log("Exporting selected restaurants:", selectedRestaurants)
  }

  const handleStatusUpdate = (restaurantId: number, newStatus: string) => {
    // In a real app, this would make an API call to update the status
    console.log(`Updating restaurant ${restaurantId} status to ${newStatus}`)
  }

  return (
    <>
      <div className="space-y-4">
        {selectedRestaurants.length > 0 && (
          <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
            <span className="text-sm text-muted-foreground">{selectedRestaurants.length} restaurant(s) selected</span>
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
                    checked={selectedRestaurants.length === restaurants.length}
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
              {restaurants.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRestaurants.includes(restaurant.id)}
                      onCheckedChange={(checked) => handleSelectRestaurant(restaurant.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{restaurant.name}</TableCell>
                  <TableCell className="text-muted-foreground">{restaurant.address}</TableCell>
                  <TableCell className="text-muted-foreground">{restaurant.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      {restaurant.rating}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(restaurant.status)}>
                      {restaurant.status.charAt(0).toUpperCase() + restaurant.status.slice(1)}
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
                        <DropdownMenuItem onClick={() => handleViewDetail(restaurant)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(restaurant.id, "contacted")}>
                          <Edit className="h-4 w-4 mr-2" />
                          Mark as Contacted
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(restaurant.id, "closed")}>
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
      </div>

      <RestaurantDetailModal
        restaurant={selectedRestaurant}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </>
  )
}
