"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ExportFiltersProps {
  onFiltersChange: (filters: ExportFilters) => void;
  onPreviewRequest: () => void;
}

export interface ExportFilters {
  dateRange: DateRange | undefined;
  selectedFields: string[];
  status: string;
  rating: string;
  location: string;
}

export function ExportFilters({
  onFiltersChange,
  onPreviewRequest,
}: ExportFiltersProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedFields, setSelectedFields] = useState([
    "name",
    "address",
    "phone",
    "email",
    "rating",
    "status",
    "source",
  ]);
  const [status, setStatus] = useState("all");
  const [rating, setRating] = useState("all");
  const [location, setLocation] = useState("all");

  // Only show fields that actually exist in the database schema
  const availableFields = [
    { id: "name", label: "Restaurant Name" },
    { id: "address", label: "Address" },
    { id: "phone", label: "Phone Number" },
    { id: "email", label: "Email" },
    { id: "rating", label: "Rating" },
    { id: "reviewCount", label: "Review Count" },
    { id: "source", label: "Source" },
    { id: "status", label: "Status" },
    { id: "companyName", label: "Company Name" },
    { id: "companyWebsite", label: "Company Website" },
    { id: "companyIndustry", label: "Company Industry" },
    { id: "latestNote", label: "Latest Note" },
    { id: "latestActivity", label: "Latest Activity" },
    { id: "latestActivityType", label: "Activity Type" },
    { id: "latestActivityDescription", label: "Activity Description" },
  ];

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, fieldId]);
    } else {
      setSelectedFields(selectedFields.filter((id) => id !== fieldId));
    }
  };

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange({
      dateRange,
      selectedFields,
      status,
      rating,
      location,
    });
  }, [dateRange, selectedFields, status, rating, location, onFiltersChange]);

  const handlePreview = () => {
    onPreviewRequest();
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Export Filters</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure filters and select fields for your data export
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status, Rating, and Location Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Status Filter</Label>
            <Select value={status} onValueChange={setStatus}>
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
            <Select value={rating} onValueChange={setRating}>
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
            <Select value={location} onValueChange={setLocation}>
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

        {/* Date Range Filter - Note: This is for filtering, not for export fields */}
        <div className="space-y-2">
          <Label>Date Range (Filter by Latest Activity/Note Date)</Label>
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <p className="text-xs text-muted-foreground">
            Note: Date filtering is based on the latest activity or note date,
            not a direct field
          </p>
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
                  onCheckedChange={(checked) =>
                    handleFieldToggle(field.id, checked as boolean)
                  }
                />
                <Label htmlFor={field.id} className="text-sm font-normal">
                  {field.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Button */}
        <div className="flex justify-end">
          <Button
            onClick={handlePreview}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Update Preview</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
