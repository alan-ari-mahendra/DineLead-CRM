"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { getCookies } from "@/app/action";

interface ScrapingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScrapingModal({ isOpen, onClose }: ScrapingModalProps) {
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [radius, setRadius] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const searchRestaurants = async () => {
    try {
      const cookieString = await getCookies();
      const res = await axios.post(
        "/api/scrape",
        {
          userId: user.id,
          location: location,
          radius: parseInt(radius) * 1000,
          category: category,
        },
        {
          headers: {
            Cookie: cookieString,
          },
        }
      );

      const { jobId } = res.data;
      console.log("Job queued:", jobId);
      toast.success(`Job queued: ${jobId}`);
    } catch (err) {
      console.error("Gagal request:", err);
      toast.error("Failed to queue job");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await searchRestaurants();

    setIsLoading(false);
    onClose();

    // Reset form
    setLocation("");
    setCategory("");
    setRadius("1");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scrape New Restaurant Data</DialogTitle>
          <DialogDescription>
            Enter the location and category to scrape restaurant data from
            various sources.
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
              <Label htmlFor="category">
                Radius <span className="text-xs">km</span>
              </Label>
              <Input
                id="category"
                placeholder="e.g., Restaurant in Jakarta"
                value={radius}
                type="number"
                onChange={(e) => setRadius(e.target.value)}
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
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
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
  );
}
