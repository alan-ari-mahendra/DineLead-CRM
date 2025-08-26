"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Plus, Database, FileText, Settings, Sparkles } from "lucide-react"
import { useState } from "react"
import { ScrapingModal } from "@/components/modals/scraping-modal"
import { useRouter } from "next/navigation"

export function QuickActions() {
  const [isScrapingModalOpen, setIsScrapingModalOpen] = useState(false)
  const router = useRouter()

  const actions = [
    {
      title: "Scrape New Data",
      description: "Find new restaurants",
      icon: Plus,
      color: "from-blue-500 to-purple-600",
      hoverColor: "hover:from-blue-600 hover:to-purple-700",
      onClick: () => setIsScrapingModalOpen(true),
    },
    {
      title: "View Restaurants",
      description: "Browse your database",
      icon: Database,
      color: "from-green-500 to-teal-600",
      hoverColor: "hover:from-green-600 hover:to-teal-700",
      onClick: () => router.push("/restaurants"),
    },
    {
      title: "Export Data",
      description: "Download reports",
      icon: FileText,
      color: "from-orange-500 to-red-600",
      hoverColor: "hover:from-orange-600 hover:to-red-700",
      onClick: () => router.push("/export"),
    },
    {
      title: "Settings",
      description: "Configure your app",
      icon: Settings,
      color: "from-gray-500 to-gray-600",
      hoverColor: "hover:from-gray-600 hover:to-gray-700",
      onClick: () => router.push("/settings"),
    },
  ]

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {actions.map((action, index) => (
            <Card
              key={index}
              className="border-0 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
              onClick={action.onClick}
            >
              <CardContent className="p-0">
                <div
                  className={`h-32 bg-gradient-to-br ${action.color} ${action.hoverColor} transition-all duration-200 flex flex-col items-center justify-center text-white relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <action.icon className="h-8 w-8 mb-2 relative z-10" />
                  <h3 className="font-semibold text-lg mb-1 relative z-10">{action.title}</h3>
                  <p className="text-sm opacity-90 relative z-10">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ScrapingModal isOpen={isScrapingModalOpen} onClose={() => setIsScrapingModalOpen(false)} />
    </>
  )
}
