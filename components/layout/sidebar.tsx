"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Building2, Zap, FileText, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Restaurants", href: "/restaurants", icon: Building2 },
  { name: "Scraping Jobs", href: "/scraping-jobs", icon: Zap },
  { name: "Exports", href: "/export", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Image src="/favicon-DL-removebg-preview.png" alt="DineLead" width={40} height={40} className="rounded-lg" />
            <span className="font-bold text-gray-900">DineLead</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "w-full justify-start h-11 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors",
                isActive && "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700",
                collapsed && "justify-center px-0",
              )}
              onClick={() => router.push(item.href)}
            >
              <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
