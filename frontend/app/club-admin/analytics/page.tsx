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

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts"

const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000"

type Member = {
  _id: string
  name: string
  role?: string
  createdAt?: string | Date
}

type EventType = {
  _id: string
  title: string
  start_date: string | Date
  registeredCount?: number
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<"1month" | "3months" | "6months">("6months")
  const [members, setMembers] = useState<Member[]>([])
  const [events, setEvents] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const [membersRes, eventsRes] = await Promise.all([
          axios.get<Member[]>(`${BackendURL}/api/clubs/members`, {
            withCredentials: true,
          }),
          axios.get<EventType[]>(`${BackendURL}/api/events/club/myevents`, {
            withCredentials: true,
          }),
        ])

        setMembers(membersRes.data || [])
        setEvents(eventsRes.data || [])
      } catch (err) {
        console.error("Failed to load analytics data", err)
        setError("Failed to load analytics data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const {
    totalMembers,
    membersThisMonth,
    totalEvents,
    eventsThisMonth,
    memberSeries,
    attendanceSeries,
  } = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-11 [web:760]

    const totalMembers = members.length

    const membersThisMonth = members.filter((m) => {
      if (!m.createdAt) return false
      const d = new Date(m.createdAt)
      return (
        d.getFullYear() === currentYear &&
        d.getMonth() === currentMonth
      )
    }).length

    const totalEvents = events.length

    const eventsThisMonth = events.filter((e) => {
      const d = new Date(e.start_date)
      return (
        d.getFullYear() === currentYear &&
        d.getMonth() === currentMonth
      )
    }).length

    // Build 6‑month series for charts from real data counts, with dummy attendance%
    const monthsBack = 6
    const series: { label: string; members: number; events: number; attendance: number }[] = []

    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1)
      const y = d.getFullYear()
      const m = d.getMonth()

      const label = d.toLocaleString("default", { month: "short" })

      const membersCount = members.filter((mem) => {
        if (!mem.createdAt) return false
        const md = new Date(mem.createdAt)
        return md.getFullYear() === y && md.getMonth() === m
      }).length

      const eventsCount = events.filter((ev) => {
        const ed = new Date(ev.start_date)
        return ed.getFullYear() === y && ed.getMonth() === m
      }).length

      // dummy attendance% based on eventsCount
      const attendance =
        eventsCount === 0 ? 0 : Math.min(95, 60 + eventsCount * 5)

      series.push({ label, members: membersCount, events: eventsCount, attendance })
    }

    const memberSeries = series.map((s) => ({
      month: s.label,
      members: s.members,
    }))

    const attendanceSeries = series.map((s) => ({
      month: s.label,
      attendance: s.attendance,
    }))

    return {
      totalMembers,
      membersThisMonth,
      totalEvents,
      eventsThisMonth,
      memberSeries,
      attendanceSeries,
    }
  }, [members, events])

  const filteredMemberSeries = useMemo(() => {
    if (range === "1month") return memberSeries.slice(-1)
    if (range === "3months") return memberSeries.slice(-3)
    return memberSeries
  }, [memberSeries, range])

  const filteredAttendanceSeries = useMemo(() => {
    if (range === "1month") return attendanceSeries.slice(-1)
    if (range === "3months") return attendanceSeries.slice(-3)
    return attendanceSeries
  }, [attendanceSeries, range])

  const avgAttendance =
    filteredAttendanceSeries.reduce((sum, d) => sum + d.attendance, 0) /
      (filteredAttendanceSeries.length || 1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Club Analytics</h1>
          <p className="text-muted-foreground">Track club performance and growth</p>
        </div>
        <Select
          defaultValue="6months"
          onValueChange={(v) => setRange(v as typeof range)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last 1 Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <p>Loading analytics...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="Total Members"
              value={totalMembers.toString()}
              change={`+${membersThisMonth} this month`}
              changeType="positive"
              icon={Users}
            />
            <StatsCard
              title="Events Hosted"
              value={totalEvents.toString()}
              change={`+${eventsThisMonth} this month`}
              changeType="positive"
              icon={Calendar}
            />
            <StatsCard
              title="Avg Attendance"
              value={`${avgAttendance.toFixed(0)}%`}
              change="+X% vs previous"
              changeType="positive"
              icon={TrendingUp}
            />
            <StatsCard
              title="Engagement Rate"
              value="76%"
              change="Very active"
              changeType="positive"
              icon={BarChart3}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Member Growth Trend */}
            <div className="glass bg-card/70 rounded-xl p-6 border border-border/50 h-96">
              <h2 className="text-lg font-semibold mb-4">Member Growth Trend</h2>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredMemberSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="members"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Event Attendance Trend */}
            <div className="glass bg-card/70 rounded-xl p-6 border border-border/50 h-96">
              <h2 className="text-lg font-semibold mb-4">Event Attendance Trend</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredAttendanceSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#22c55e" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
