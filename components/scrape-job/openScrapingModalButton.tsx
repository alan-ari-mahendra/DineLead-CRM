"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { ScrapingModal } from "../modals/scraping-modal";
import { Zap } from "lucide-react";

export default function OpenScrapingModalButton() {
  const [isScrapingModalOpen, setIsScrapingModalOpen] = useState(false);

  const handleJobAdded = () => {
    // This will be called when a new job is added
    // The scraping jobs page will automatically refresh via the custom event
  };

  return (
    <>
      <Button
        onClick={() => setIsScrapingModalOpen(!isScrapingModalOpen)}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
      >
        <Zap className="h-4 w-4 mr-2" />
        New Scraping Job
      </Button>
      <ScrapingModal
        isOpen={isScrapingModalOpen}
        onClose={() => setIsScrapingModalOpen(false)}
        onJobAdded={handleJobAdded}
      />
    </>
  );
}
