"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function ExportPreview() {
  // Mock preview data
  const previewData = [
    {
      name: "Warung Padang Sederhana",
      address: "Jl. Sudirman No. 123, Jakarta",
      phone: "+62 21 1234567",
      rating: 4.5,
      status: "prospect",
    },
    {
      name: "Sate Ayam Pak Budi",
      address: "Jl. Malioboro No. 45, Yogyakarta",
      phone: "+62 274 987654",
      rating: 4.2,
      status: "contacted",
    },
    {
      name: "Bakso Solo Enaknya",
      address: "Jl. Pahlawan No. 78, Solo",
      phone: "+62 271 456789",
      rating: 4.8,
      status: "closed",
    },
  ]

  const getStatusBadge = (status: string) => {
    const variants = {
      prospect: "bg-blue-100 text-blue-800 border-blue-200",
      contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
      closed: "bg-green-100 text-green-800 border-green-200",
    }
    return variants[status as keyof typeof variants] || variants.prospect
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Export Preview</CardTitle>
        <p className="text-sm text-muted-foreground">Preview of data that will be exported (showing first 3 records)</p>
      </CardHeader>
      <CardContent>
        <div className="border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((restaurant, index) => (
                <TableRow key={index}>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
