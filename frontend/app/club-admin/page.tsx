"use client"

import { useEffect, useMemo, useState } from "react"
import { Users, Calendar, BarChart3, DollarSign } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import axios from "axios"

const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000"

type Event = {
  _id: string
  title: string
  start_date: string | Date
  start_time?: string
  registeredCount?: number
}

type Member = {
  _id: string
  name: string
  role?: string
  createdAt?: string | Date
}

export default function ClubAdminDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const [eventsRes, membersRes] = await Promise.all([
          axios.get<Event[]>(`${BackendURL}/api/events/club/myevents`, {
            withCredentials: true,
          }),
          axios.get<Member[]>(`${BackendURL}/api/clubs/members`, {
            withCredentials: true,
          }),
        ])

        setEvents(eventsRes.data || [])
        setMembers(membersRes.data || [])
      } catch (err) {
        console.error("Failed to load dashboard data", err)
        setError("Failed to load dashboard data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const {
    clubMembersCount,
    upcomingEventsCount,
    totalAttendance,
    thisMonthEventsCount,
    nextUpcomingEventDateLabel,
    upcomingEventsList,
    recentMembers,
  } = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-based

    const clubMembersCount = members.length

    // upcoming events (start_date in future or today)
    const parsedEvents = events
      .map((e) => ({
        ...e,
        start: new Date(e.start_date),
      }))
      .filter((e) => !isNaN(e.start.getTime()))

    const upcomingEvents = parsedEvents.filter((e) => e.start >= now)
    const upcomingEventsCount = upcomingEvents.length

    // next upcoming event date
    let nextUpcomingEventDateLabel = "N/A"
    if (upcomingEvents.length > 0) {
      const sorted = [...upcomingEvents].sort((a, b) => a.start.getTime() - b.start.getTime())
      nextUpcomingEventDateLabel = sorted[0].start.toLocaleDateString()
    }

    // events this month (by start_date)
    const thisMonthEventsCount = parsedEvents.filter(
      (e) =>
        e.start.getFullYear() === currentYear && e.start.getMonth() === currentMonth
    ).length

    // total attendance (sum registeredCount)
    const totalAttendance = parsedEvents.reduce(
      (sum, e) => sum + (e.registeredCount || 0),
      0
    )

    // upcoming events list for card (limit to 3)
    const upcomingEventsList = [...upcomingEvents]
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 3)
      .map((e) => ({
        id: e._id,
        name: e.title,
        date: e.start.toLocaleDateString(),
        attendees: e.registeredCount || 0,
      }))

    // recent members sorted by createdAt desc (newest first), limit 3
    const recentMembers = [...members]
      .filter((m) => m.createdAt)
      .sort(
        (a, b) =>
          new Date(b.createdAt as any).getTime() -
          new Date(a.createdAt as any).getTime()
      )
      .slice(0, 3)

    return {
      clubMembersCount,
      upcomingEventsCount,
      totalAttendance,
      thisMonthEventsCount,
      nextUpcomingEventDateLabel,
      upcomingEventsList,
      recentMembers,
    }
  }, [events, members])

  const stats = [
    {
      title: "Club Members",
      value: clubMembersCount.toString(),
      change: `+${thisMonthEventsCount} this month`, // using events this month as requested
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Upcoming Events",
      value: upcomingEventsCount.toString(),
      change: `Next: ${nextUpcomingEventDateLabel}`,
      changeType: "neutral" as const,
      icon: Calendar,
    },
    {
      title: "Total Attendance",
      value: totalAttendance.toString(),
      change: "", // you can derive a monthly delta if you want
      changeType: "positive" as const,
      icon: BarChart3,
    },
    {
      title: "Budget Available",
      value: "$8.5K",
      change: "$1.5K spent",
      changeType: "neutral" as const,
      icon: DollarSign,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Club Dashboard</h1>
          <p className="text-muted-foreground">Tech Club management overview</p>
        </div>
        <Link href="/club-admin/events/create">
          <Button className="bg-accent hover:bg-accent/90">
            <Calendar className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <StatsCard key={i} {...stat} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Events */}
            <div className="lg:col-span-2 glass bg-card/70 rounded-xl p-6 border border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Upcoming Events</h2>
                <Link href="/club-admin/events">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingEventsList.length === 0 && (
                  <p className="text-muted-foreground text-sm">No upcoming events.</p>
                )}
                {upcomingEventsList.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/30 hover:border-border/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{event.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.date} • {event.attendees} expected
                      </p>
                    </div>
                    {/* status removed as requested */}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Members */}
            <div className="glass bg-card/70 rounded-xl p-6 border border-border/50">
              <h2 className="text-xl font-bold mb-6">New Members</h2>
              <div className="space-y-4">
                {recentMembers.length === 0 && (
                  <p className="text-muted-foreground text-sm">No members found.</p>
                )}
                {recentMembers.map((member) => (
                  <div
                    key={member._id}
                    className="pb-4 border-b border-border/30 last:border-0"
                  >
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {member.role || "Member"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.createdAt
                        ? new Date(member.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass bg-card/70 rounded-xl p-6 border border-border/50">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/club-admin/members">
                <Button variant="outline" className="w-full h-12">
                  <Users className="mr-2 h-4 w-4" />
                  Members
                </Button>
              </Link>
              <Link href="/club-admin/events">
                <Button variant="outline" className="w-full h-12">
                  <Calendar className="mr-2 h-4 w-4" />
                  Events
                </Button>
              </Link>
              <Link href="/club-admin/attendance">
                <Button variant="outline" className="w-full h-12">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Attendance
                </Button>
              </Link>
              <Link href="/club-admin/expenses">
                <Button variant="outline" className="w-full h-12">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Expenses
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
