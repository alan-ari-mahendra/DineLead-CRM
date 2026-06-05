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
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header / Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center space-x-2.5">
            <Image
              src="/favicon-DL-removebg-preview.png"
              alt="DineLead"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-sm leading-tight">DineLead</span>
              <span className="text-[10px] text-emerald-600 font-medium tracking-wide uppercase">CRM</span>
            </div>
          </div>
        )}
        {collapsed && (
          <Image
            src="/favicon-DL-removebg-preview.png"
            alt="DineLead"
            width={28}
            height={28}
            className="rounded-lg mx-auto"
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-7 w-7 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors",
            collapsed && "mx-auto mt-2",
          )}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Main Menu
          </p>
        )}
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "w-full h-10 px-3 rounded-lg text-sm font-medium transition-all duration-150",
                "text-gray-500 hover:text-gray-800 hover:bg-gray-50",
                isActive && [
                  "bg-emerald-50 text-emerald-700",
                  "hover:bg-emerald-50 hover:text-emerald-700",
                ],
                collapsed && "justify-center px-0",
                !collapsed && "justify-start",
              )}
              onClick={() => router.push(item.href)}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  !collapsed && "mr-2.5",
                  isActive ? "text-emerald-600" : "text-gray-400",
                )}
              />
              {!collapsed && <span>{item.name}</span>}
              {!collapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </Button>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-3 pb-4">
          <div className="px-3 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <p className="text-xs font-medium text-emerald-700">B2B Lead Gen</p>
            <p className="text-[10px] text-emerald-600 mt-0.5 leading-relaxed">
              Find & convert restaurant leads efficiently
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
