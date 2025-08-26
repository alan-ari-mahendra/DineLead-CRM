"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ScrapingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ScrapingModal({ isOpen, onClose }: ScrapingModalProps) {
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate scraping process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    onClose()

    // Reset form
    setLocation("")
    setCategory("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scrape New Restaurant Data</DialogTitle>
          <DialogDescription>
            Enter the location and category to scrape restaurant data from various sources.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Jakarta, Indonesia"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Restaurant in Jakarta"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="bg-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? "Scraping..." : "Scrape Data"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
