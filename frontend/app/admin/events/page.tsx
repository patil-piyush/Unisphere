"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EventCard } from "@/components/dashboard/event-card"
import Link from "next/link"

const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL

type ApiEvent = {
  _id: string
  club_id?: { _id: string; name: string; logoURL?: string }
  clubName?: string
  title: string
  description: string
  bannerURL?: string
  category: string
  venue: string
  start_time: string
  start_date: string
  end_time: string
  end_date: string
  max_capacity: number
  registeredCount: number
  isClosed?: boolean
  price?: number
}

export default function EventsPage() {
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!BackendURL) {
      setError("Client misconfigured: NEXT_PUBLIC_BACKEND_API_URL is missing.")
      return
    }

    setLoading(true)
    axios
      .get<ApiEvent[]>(`${BackendURL}/api/admin/events`, {
        withCredentials: true,
      })
      .then((res) => {
        setEvents(res.data)
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ??
          err.message ??
          "Failed to load events."
        setError(msg)
        console.error("Error fetching events:", err)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Events Management</h1>
          <p className="text-muted-foreground">Manage all campus events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search events..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading && <p className="text-muted-foreground">Loading events...</p>}

        {!loading &&
          events.map((ev) => (
            <Link
              key={ev._id} // ✅ key on the top-level element returned from map
              href={`/admin/events/${ev._id}`}
              className="block"
            >
              <EventCard
                _id={ev._id}
                title={ev.title}
                description={ev.description}
                bannerURL={ev.bannerURL}
                category={
                  (ev.category as
                    | "Workshop"
                    | "Seminar"
                    | "Social"
                    | "Competition"
                    | "Other") || "Other"
                }
                venue={ev.venue}
                start_time={ev.start_time}
                start_date={ev.start_date}
                end_time={ev.end_time}
                end_date={ev.end_date}
                max_capacity={ev.max_capacity}
                registeredCount={ev.registeredCount}
                isClosed={ev.isClosed}
                clubName={ev.clubName || ev.club_id?.name || "Unknown Club"}
                price={ev.price}
                isAdmin={true}
              />
            </Link>
          ))}


        {!loading && !error && events.length === 0 && (
          <p className="text-muted-foreground">No events found.</p>
        )}
      </div>
    </div>
  )
}
