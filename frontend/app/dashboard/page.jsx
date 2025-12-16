"use client"

import { Calendar, Trophy, Award, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/dashboard/stats-card"
import { EventCard } from "@/components/dashboard/event-card"
import Link from "next/link"
import { useEffect, useState } from "react"
const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000";
import axios from "axios";



export default function DashboardPage() {
  const [username, setUsername] = useState("")
  const [eventAttended, setEventAttended] = useState(0)
  const [stats, setStats] = useState([])
  const [recommendedEventsList, setRecommendedEventsList] = useState([]);
  const [upcomingEventsList, setUpcomingEventsList] = useState([]);

  useEffect(() => {
    axios
      .get(`${BackendURL}/api/users/me`, { withCredentials: true })
      .then((response) => setUsername(response.data.name))
      .catch((error) => console.error("There was an error fetching the profile data!", error))

    axios
      .get(`${BackendURL}/api/event-registrations/my`, { withCredentials: true })
      .then((response) => setEventAttended(response.data.length))
      .catch((error) => {
        console.error("User is not authenticated!", error)
        window.location.href = "/login"
      })

    axios
      .get(`${BackendURL}/api/events`, { withCredentials: true })
      .then((response) => { setUpcomingEventsList(response.data); setRecommendedEventsList(response.data) })
      .catch((error) => {
        console.error("User is not authenticated!", error)
        window.location.href = "/login"
      })
  }, [])




  useEffect(() => {
    setStats([
      {
        title: "Events Attended",
        value: eventAttended,
        change: "+3 this month",
        changeType: "positive",
        icon: Calendar,
      },
      {
        title: "Total Points",
        value: "2,450",
        change: "+180 this week",
        changeType: "positive",
        icon: Star,
      },
      {
        title: "Certificates",
        value: "12",
        change: "2 pending",
        changeType: "neutral",
        icon: Award,
      },
      {
        title: "Leaderboard Rank",
        value: "#15",
        change: "Up 5 places",
        changeType: "positive",
        icon: Trophy,
      },
    ])
  }, [eventAttended])

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {username}</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening on campus today.</p>
        </div>
        <Link href="/dashboard/events">
          <Button className="group">
            Explore Events
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recommended For You</h2>
            <Link href="/dashboard/events" className="text-primary text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendedEventsList.slice(0, 2).map((event) => (
              <EventCard key={event._id || event.id} {...event} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <div className="glass rounded-2xl p-4 space-y-3">
            {upcomingEventsList.map((event) => {
              const [dayPart = "", monthPart = ""] =
                typeof event.date === "string" ? event.date.split(" ") : []

              const key = event._id || event.id || `${event.title}-${event.start_date}`

              return (
                <div
                  key={key}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">{dayPart}</span>
                    <span className="text-lg font-bold text-primary">{monthPart}</span>
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
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
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  Browse Events
                </Button>
              </Link>
              <Link href="/dashboard/leaderboard">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Trophy className="mr-2 h-4 w-4" />
                  View Leaderboard
                </Button>
              </Link>
              <Link href="/dashboard/my-events">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Award className="mr-2 h-4 w-4" />
                  My Certificates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
