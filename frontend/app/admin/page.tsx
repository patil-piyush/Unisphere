"use client"

import {
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  LucideIcon,
} from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import Link from "next/link"
import axios from "axios"

const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL

type PendingApprovalItem = {
  id: string
  type: "Event"
  name: string
  club: string
  date: string
}

type ActivityItem = {
  id: number
  action: string
  by: string
  time: string
}

const recentActivit: ActivityItem[] = [
  { id: 1, action: "New event created", by: "Tech Club", time: "2 hours ago" },
  { id: 2, action: "Club registration", by: "Photography Club", time: "4 hours ago" },
  { id: 3, action: "Report submitted", by: "Finance Dept", time: "1 day ago" },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<
    {
      title: string
      value: string | number
      icon: LucideIcon
    }[]
  >([])
  const [pendingApprovals, setPendingApprovals] = useState<PendingApprovalItem[]>([])
  const [recentActivity] = useState<ActivityItem[]>(recentActivit)
  const [totalStudents, setTotalStudents] = useState(0)
  const [activeClubs, setActiveClubs] = useState(0)
  const [eventsThisMonth, setEventsThisMonth] = useState(0)

  useEffect(() => {
    if (!BackendURL) return

    // total students
    axios
      .get(`${BackendURL}/api/admin/users`, { withCredentials: true })
      .then((response) => {
        setTotalStudents(response.data.count ?? 0)
      })
      .catch((error) => {
        console.error("Error fetching Total Students:", error)
        // if unauthorized, send to login
        if (error?.response?.status === 401) {
          window.location.href = "/login"
        }
      })

    // active clubs
    axios
      .get(`${BackendURL}/api/admin/`, { withCredentials: true })
      .then((response) => {
        setActiveClubs(response.data.count ?? 0)
      })
      .catch((error) => {
        console.error("Error fetching Active Clubs:", error)
      })

    // events this month
    axios
      .get(`${BackendURL}/api/admin/events/current-month/count`, {
        withCredentials: true,
      })
      .then((response) => {
        setEventsThisMonth(response.data.count ?? 0)
      })
      .catch((error) => {
        console.error("Error fetching Events This Month:", error)
      })

    // pending approvals (events with status=pending)
    axios
      .get(`${BackendURL}/api/admin/events/pending`, {
        withCredentials: true,
      })
      .then((response) => {
        const events = response.data as any[]
        const mapped: PendingApprovalItem[] = events.map((e) => ({
          id: e._id,
          type: "Event",
          name: e.title,
          club: e.clubName || e.club_id?.name || "Unknown Club",
          date: new Date(e.start_date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
        }))
        setPendingApprovals(mapped)
      })
      .catch((error) => {
        console.error("Error fetching pending approvals:", error)
      })
  }, [])

  useEffect(() => {
    setStats([
      {
        title: "Total Students",
        value: totalStudents,
        icon: Users,
      },
      {
        title: "Active Clubs",
        value: activeClubs,
        icon: BarChart3,
      },
      {
        title: "Events This Month",
        value: eventsThisMonth,
        icon: Calendar,
      },
      {
        title: "Total Budget",
        value: "₹125K",
        icon: DollarSign,
      },
    ])
  }, [totalStudents, activeClubs, eventsThisMonth, pendingApprovals.length])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            College-wide event management overview
          </p>
        </div>
        <Link href="/admin/approvals">
          <Button className="bg-primary hover:bg-primary/90">
            <AlertCircle className="mr-2 h-4 w-4" />
            View Approvals ({pendingApprovals.length})
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 glass bg-card/70 rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Pending Approvals</h2>
            <Link href="/admin/approvals">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {pendingApprovals.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No pending approvals at the moment.
              </p>
            )}
            {pendingApprovals.map((item) => (
              <Link
                key={item.id}
                href={`/admin/approvals?eventId=${item.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/30 hover:border-border/50 hover:bg-muted/10 transition-colors cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Badge variant="default">{item.type}</Badge>
                      <h3 className="font-semibold">{item.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Club: {item.club}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.date}
                    </p>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        type="button"
                      >
                        Reject
                      </Button>
                      <Button size="sm" className="h-8" type="button">
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass bg-card/70 rounded-xl p-6 border border-border/50">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="pb-4 border-b border-border/30 last:border-0"
              >
                <p className="font-medium text-sm">{item.action}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.by}
                </p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass bg-card/70 rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/admin/clubs">
            <Button variant="outline" className="w-full h-12">
              <Users className="mr-2 h-4 w-4" />
              Manage Clubs
            </Button>
          </Link>
          <Link href="/admin/events">
            <Button variant="outline" className="w-full h-12">
              <Calendar className="mr-2 h-4 w-4" />
              All Events
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="outline" className="w-full h-12">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant="outline" className="w-full h-12">
              <TrendingUp className="mr-2 h-4 w-4" />
              Reports
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
