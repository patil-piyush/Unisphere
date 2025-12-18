"use client"

import { useEffect, useMemo, useState } from "react"
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import axios from "axios"

const BackendURL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000"

type AdminEvent = {
  _id: string
  club_id?: { _id: string; name: string; logoURL?: string }
  clubName: string
  title: string
  category: string
  start_date: string
  end_date: string
  max_capacity: number
  registeredCount: number
  price: number
}

type AdminClubsResponse = {
  count: number
  clubs: {
    _id: string
    name: string
    description: string
    logoURL?: string
  }[]
}

type RangeKey = "1month" | "3months" | "6months" | "1year"

export default function AnalyticsPage() {
  const [range, setRange] = useState<RangeKey>("6months")
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [clubs, setClubs] = useState<AdminClubsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [eventsRes, clubsRes] = await Promise.all([
          axios.get<AdminEvent[]>(`${BackendURL}/api/admin/events`, {
            withCredentials: true,
          }),
          axios.get<AdminClubsResponse>(`${BackendURL}/api/admin/`, {
            withCredentials: true,
          }),
        ])

        setEvents(eventsRes.data || [])
        setClubs(clubsRes.data || null)
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ??
          err?.message ??
          "Failed to load analytics."
        setError(msg)
        console.error("Admin analytics load error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter events by date range; only past and up-to-today events
  const filteredEvents = useMemo(() => {
    if (!events.length) return []

    const now = new Date()
    const monthsBack: number =
      range === "1month" ? 1 : range === "3months" ? 3 : range === "6months" ? 6 : 12

    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - monthsBack)

    return events.filter((e) => {
      const d = new Date(e.start_date)
      // only count events whose start_date is between cutoff and now
      return d >= cutoff && d <= now
    })
  }, [events, range])

  // If all your existing events are in the future (e.g. 2026),
  // filteredEvents will be empty. For testing, you can fallback:
  const effectiveEvents =
    filteredEvents.length > 0 ? filteredEvents : events // remove this line if you want strictly past-only

  // Key metrics – attendance is dummy: registeredCount * 1.2
  const totalEvents = effectiveEvents.length
  const totalAttendance = effectiveEvents.reduce(
    (sum, e) => sum + e.registeredCount * 1.2,
    0,
  )
  const totalRevenue = effectiveEvents.reduce(
    (sum, e) => sum + e.registeredCount * e.price,
    0,
  )
  const avgAttendancePerEvent =
    totalEvents > 0 ? Math.round((totalAttendance / totalEvents / 100) * 100) : 0

  // Monthly analytics data
  const analyticsData = useMemo(() => {
    const map = new Map<
      string,
      { month: string; events: number; attendance: number; revenue: number }
    >()

    effectiveEvents.forEach((e) => {
      const d = new Date(e.start_date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const monthLabel = d.toLocaleString("default", { month: "short" })

      if (!map.has(key)) {
        map.set(key, {
          month: monthLabel,
          events: 0,
          attendance: 0,
          revenue: 0,
        })
      }

      const entry = map.get(key)!
      entry.events += 1
      entry.attendance += e.registeredCount * 1.2 // dummy
      entry.revenue += e.registeredCount * e.price
    })

    return Array.from(map.values()).sort((a, b) =>
      a.month.localeCompare(b.month),
    )
  }, [effectiveEvents])

  // Top clubs
  const topClubs = useMemo(() => {
    const clubMap = new Map<
      string,
      { name: string; events: number; attendance: number }
    >()

    effectiveEvents.forEach((e) => {
      const id = e.club_id?._id || e.clubName
      const name = e.club_id?.name || e.clubName || "Unknown Club"

      if (!clubMap.has(id)) {
        clubMap.set(id, { name, events: 0, attendance: 0 })
      }
      const c = clubMap.get(id)!
      c.events += 1
      c.attendance += e.registeredCount * 1.2 // dummy
    })

    return Array.from(clubMap.values())
      .sort((a, b) => b.attendance - a.attendance)
      .slice(0, 5)
  }, [effectiveEvents])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Campus-wide event and engagement metrics
          </p>
          {clubs && (
            <p className="text-xs text-muted-foreground mt-1">
              Tracking {clubs.count} club{clubs.count === 1 ? "" : "s"} and{" "}
              {events.length} event{events.length === 1 ? "" : "s"} (filtered:{" "}
              {effectiveEvents.length}).
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Select
            value={range}
            onValueChange={(v) => setRange(v as RangeKey)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last 1 Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last 1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Events"
          value={totalEvents.toString()}
          change="For selected period"
          changeType="positive"
          icon={Calendar}
        />
        <StatsCard
          title="Total Attendance"
          value={Math.round(totalAttendance).toLocaleString()}
          change="Dummy based on registrations"
          changeType="neutral"
          icon={Users}
        />
        <StatsCard
          title="Avg Attendance/Event"
          value={`${avgAttendancePerEvent}%`}
          change="Approximate engagement"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${Math.round(totalRevenue).toLocaleString()}`}
          change="From paid events"
          changeType={totalRevenue > 0 ? "positive" : "neutral"}
          icon={BarChart3}
        />
      </div>

      {/* Charts placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass bg-card/70 rounded-xl p-6 border border-border/50 h-96 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Events & Attendance Trend</p>
            <p className="text-sm text-muted-foreground mt-2">
              {analyticsData.length} month(s) summarized from{" "}
              {effectiveEvents.length} events.
            </p>
          </div>
        </div>

        <div className="glass bg-card/70 rounded-xl p-6 border border-border/50 h-96 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Revenue Distribution</p>
            <p className="text-sm text-muted-foreground mt-2">
              Based on event registrations and ticket price.
            </p>
          </div>
        </div>
      </div>

      {/* Top Performing Clubs */}
      <div className="glass bg-card/70 rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-bold mb-6">Top Performing Clubs</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-3 px-4 font-semibold">Club Name</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Events Organized
                </th>
                <th className="text-left py-3 px-4 font-semibold">
                  Total Attendance (dummy)
                </th>
                <th className="text-left py-3 px-4 font-semibold">Avg/Event</th>
              </tr>
            </thead>
            <tbody>
              {topClubs.map((club, i) => (
                <tr
                  key={i}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4">{club.name}</td>
                  <td className="py-4 px-4">{club.events}</td>
                  <td className="py-4 px-4">
                    {Math.round(club.attendance).toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    {club.events > 0
                      ? `${Math.round(club.attendance / club.events)} students`
                      : "—"}
                  </td>
                </tr>
              ))}
              {topClubs.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 px-4 text-sm text-muted-foreground"
                  >
                    No events found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading analytics...</p>
      )}
    </div>
  )
}
