// app/dashboard/dashboard-client.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Calendar,
  ScanLine,
  Trophy,
  Award,
  Star,
  LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/dashboard/stats-card"
import { EventCard } from "@/components/dashboard/event-card"

type Event = {
  _id?: string
  id?: string
  title: string
  description: string
  clubName: string
  bannerURL?: string
  category: "Workshop" | "Seminar" | "Social" | "Competition" | "Other"
  venue: string
  start_time: string
  start_date: string | Date
  end_time: string
  end_date: string | Date
  max_capacity: number
  registeredCount: number
  isClosed?: boolean
  price?: number
  isRegistered?: boolean
  isAdmin?: boolean
}

type StatData = {
  title: string
  value: string | number
  change: string
  changeType: "positive" | "neutral" | "negative"
  icon: "calendar" | "star" | "award" | "trophy"
}

const iconMap: Record<StatData["icon"], LucideIcon> = {
  calendar: Calendar,
  star: Star,
  award: Award,
  trophy: Trophy,
}

type DashboardClientProps = {
  username: string
  stats: StatData[]
  recommendedEventsList: Event[]
  upcomingEventsList: Event[]
}

export function DashboardClient({
  username,
  stats,
  recommendedEventsList,
  upcomingEventsList,
}: DashboardClientProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {username}</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening on campus today.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/attendance">
            <Button variant="outline" className="group">
              Scan QR to Mark Attendance
              <ScanLine className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link href="/dashboard/events">
            <Button className="group">
              Explore Events
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = iconMap[stat.icon]
          return (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={Icon}
            />
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recommended For You</h2>
            <Link
              href="/dashboard/events"
              className="text-primary text-sm hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendedEventsList.slice(0, 2).map((event) => {
              const key = event._id || event.id || "unknown"
              return (
                <Link href="/dashboard/events" key={key}>
                  <EventCard
                    {...{
                      ...event,
                      _id: key,
                      id: key,
                    }}
                  />
                </Link>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <div className="glass rounded-2xl p-4 space-y-3">
            {upcomingEventsList.map((event) => {
              const startDateStr = event.start_date
              ? new Date(event.start_date).toISOString().slice(0, 10) // 2026-01-03
              : ""
            

              const key =
                event._id || event.id || `${event.title}-${event.start_date}`

              return (
                <div
                  key={key}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                    <Image
                      src={event.bannerURL || "/placeholder.svg"}
                      alt={event.title}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full rounded-xl"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {startDateStr}
                    </p>
                  </div>
                </div>
              )
            })}

            <Link href="/dashboard/my-events">
              <Button variant="ghost" className="w-full mt-2">
                View My Schedule
              </Button>
            </Link>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/dashboard/events">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Browse Events
                </Button>
              </Link>
              <Link href="/dashboard/leaderboard">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
