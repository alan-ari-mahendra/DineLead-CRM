"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Building2, Zap, FileText, Settings, CreditCard, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Restaurants", href: "/restaurants", icon: Building2 },
  { name: "Scraping Jobs", href: "/scraping-jobs", icon: Zap },
  { name: "Exports", href: "/export", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Billing", href: "/settings/billing", icon: CreditCard },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center flex-shrink-0">
              <Image src="/favicon-DL-removebg-preview.png" alt="DineLead" width={20} height={20} className="rounded" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm tracking-tight">DineLead</span>
              <p className="text-[10px] text-emerald-700 font-semibold leading-none mt-0.5 uppercase tracking-wider">CRM</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-7 w-7 p-0 hover:bg-gray-100 text-gray-400 hover:text-gray-600 ml-auto shrink-0"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">Menu</p>
        )}
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center h-9 px-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                isActive
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50",
                collapsed && "justify-center px-0",
              )}
            >
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-emerald-600 rounded-r-full" />
              )}
              <item.icon className={cn(
                "h-4 w-4 flex-shrink-0 transition-colors",
                isActive ? "text-emerald-700" : "text-gray-400 group-hover:text-gray-600",
                !collapsed && "mr-2.5"
              )} />
              {!collapsed && <span>{item.name}</span>}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">© 2025 DineLead</p>
        </div>
      )}
    </div>
  )
}
