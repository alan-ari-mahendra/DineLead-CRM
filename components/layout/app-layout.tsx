"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { TopNavbar } from "./top-navbar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
