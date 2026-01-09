"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, LogOut, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      if (!BACKEND_API_URL) {
        console.error("NEXT_PUBLIC_BACKEND_API_URL is not set")
      } else {
        const res = await fetch(`${BACKEND_API_URL}/api/users/logout`, {
          method: "POST",
          credentials: "include", // send token cookie
        })

        if (!res.ok) {
          const text = await res.text()
          console.error("Logout failed:", res.status, text)
        }
      }
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      // Regardless of API result, move user out of dashboard
      router.push("/")
    }
  }

  return (
    <div
      className="flex items-center justify-between px-6 py-4"
      suppressHydrationWarning
    >
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild suppressHydrationWarning>
            <Button variant="ghost" size="icon" className="relative">
              <Settings className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            suppressHydrationWarning
          >
            <Link href="/dashboard/profile">
              <DropdownMenuItem>Profile</DropdownMenuItem>
            </Link>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
