"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Bell, Search, Settings, LogOut, User } from "lucide-react"

export function TopNavbar() {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="flex items-center justify-between px-6 h-14">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-350 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search restaurants, jobs..."
            className={[
              "w-full pl-9 pr-4 py-1.5 text-sm",
              "bg-gray-50 border border-gray-200 rounded-lg",
              "text-gray-700 placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400",
              "transition-all duration-150",
            ].join(" ")}
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative h-8 w-8 p-0 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-emerald-500 rounded-full ring-1 ring-white" />
          </Button>

          {/* Divider */}
          <div className="h-5 w-px bg-gray-200 mx-1" />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-[10px] font-semibold">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs font-medium text-gray-700 leading-tight">John Doe</span>
                  <span className="text-[10px] text-gray-400 leading-tight">Admin</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 shadow-lg border border-gray-100 rounded-xl p-1" align="end">
              <div className="px-2 py-2 mb-1">
                <p className="text-sm font-semibold text-gray-900">John Doe</p>
                <p className="text-xs text-gray-400 truncate">john.doe@example.com</p>
              </div>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem className="rounded-lg text-sm text-gray-600 focus:text-gray-900 focus:bg-gray-50 cursor-pointer gap-2 my-0.5">
                <User className="h-3.5 w-3.5" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg text-sm text-gray-600 focus:text-gray-900 focus:bg-gray-50 cursor-pointer gap-2 my-0.5"
                onClick={() => router.push("/settings")}
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-lg text-sm text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer gap-2 my-0.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
