"use client"

import Link from "next/link"
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL!
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  BarChart3,
  QrCode,
  DollarSign,
  FileText,
  Flag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const studentLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Calendar, label: "Events", href: "/dashboard/events" },
  { icon: FileText, label: "My Events", href: "/dashboard/my-events" },
  { icon: Trophy, label: "Leaderboard", href: "/dashboard/leaderboard" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
]

const clubAdminLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/club-admin" },
  { icon: Calendar, label: "Events", href: "/club-admin/events" },
  { icon: QrCode, label: "Attendance", href: "/club-admin/attendance" },
  { icon: Users, label: "Members", href: "/club-admin/members" },
  { icon: BarChart3, label: "Analytics", href: "/club-admin/analytics" },
  { icon: DollarSign, label: "Expenses", href: "/club-admin/expenses" },
]

const superAdminLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Clubs", href: "/admin/clubs" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Calendar, label: "Events", href: "/admin/events" },
  { icon: Calendar, label: "Event Approval", href: "/admin/approvals" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: DollarSign, label: "Budget", href: "/admin/budget" },
  { icon: Flag, label: "Reports", href: "/admin/reports" },
]

export function DashboardSidebar({ role = "student" }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()

  const links = role === "super-admin" ? superAdminLinks : role === "club-admin" ? clubAdminLinks : studentLinks

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_API_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include", // send cookies so backend can clear them
      })
    } catch {
      // ignore errors, still redirect
    } finally {
      router.replace("/") // landing page
    }
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 flex flex-col",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-sidebar-primary-foreground font-bold text-lg">U</span>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl text-sidebar-foreground">
              Uni<span className="text-sidebar-primary">Sphere</span>
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <link.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="font-medium">{link.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-20 w-8 h-8 rounded-full bg-card border border-border shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button> */}
    </aside>
  )
}
