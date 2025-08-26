"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { addDays } from "date-fns"
import type { DateRange } from "react-day-picker"

export function ExportFilters() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 20),
    to: addDays(new Date(2024, 0, 20), 20),
  })
  const [selectedFields, setSelectedFields] = useState(["name", "address", "phone", "rating", "status"])

  const availableFields = [
    { id: "name", label: "Restaurant Name" },
    { id: "address", label: "Address" },
    { id: "phone", label: "Phone Number" },
    { id: "rating", label: "Rating" },
    { id: "status", label: "Status" },
    { id: "website", label: "Website" },
    { id: "notes", label: "Notes" },
    { id: "dateAdded", label: "Date Added" },
    { id: "lastContact", label: "Last Contact Date" },
  ]

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, fieldId])
    } else {
      setSelectedFields(selectedFields.filter((id) => id !== fieldId))
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Export Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Status Filter</Label>
            <Select defaultValue="all">
              <SelectTrigger className="bg-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="prospect">Prospect Only</SelectItem>
                <SelectItem value="contacted">Contacted Only</SelectItem>
                <SelectItem value="closed">Closed Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rating Filter</Label>
            <Select defaultValue="all">
              <SelectTrigger className="bg-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location Filter</Label>
            <Select defaultValue="all">
              <SelectTrigger className="bg-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="jakarta">Jakarta</SelectItem>
                <SelectItem value="bandung">Bandung</SelectItem>
                <SelectItem value="surabaya">Surabaya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label>Date Range (Date Added)</Label>
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        </div>

        {/* Field Selection */}
        <div className="space-y-2">
          <Label>Fields to Export</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableFields.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={field.id}
                  checked={selectedFields.includes(field.id)}
                  onCheckedChange={(checked) => handleFieldToggle(field.id, checked as boolean)}
                />
                <Label htmlFor={field.id} className="text-sm font-normal">
                  {field.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
