"use client"

import { useEffect, useState } from "react"
import { Calendar, Search, Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import axios from "axios"

const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000"

type ClubEvent = {
  _id: string
  title: string
  start_date?: string
  start_time?: string
  max_capacity: number
  registeredCount: number
  isClosed?: boolean
  status?: string
}

export default function ClubEventsPage() {
  const [events, setEvents] = useState<ClubEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)
        setError(null)

        const res = await axios.get<ClubEvent[]>(`${BackendURL}/api/events/club/myevents`, {
          withCredentials: true,
        })

        setEvents(res.data)
      } catch (err) {
        console.error("Failed to fetch club events", err)
        setError("Failed to load events.")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  async function handleDeleteEvent(id: string) {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?")
    if (!confirmDelete) return

    try {
      await axios.delete(`${BackendURL}/api/events/${id}`, {
        withCredentials: true,
      })
      setEvents((prev) => prev.filter((e) => e._id !== id))
    } catch (err) {
      console.error("Failed to delete event", err)
    }
  }

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Club Events</h1>
          <p className="text-muted-foreground">Manage your club events</p>
        </div>
        <Link href="/club-admin/events/create">
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Error / Loading */}
      {loading && <p>Loading events...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {/* Events List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredEvents.length === 0 && (
            <p className="text-muted-foreground">No events found.</p>
          )}

          {filteredEvents.map((event) => {
            const dateStr = event.start_date
              ? new Date(event.start_date).toLocaleDateString()
              : "N/A"
            const timeStr = event.start_time || "N/A"
            const attendees = event.registeredCount ?? 0
            const maxAttendees = event.max_capacity ?? 0
            const percentage =
              maxAttendees > 0 ? (attendees / maxAttendees) * 100 : 0

            const status =
              typeof event.isClosed === "boolean"
                ? event.isClosed
                  ? "Closed"
                  : "Confirmed"
                : event.status || "Planning"

            return (
              <div
                key={event._id}
                className="glass bg-card/70 rounded-xl p-6 border border-border/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{event.title}</h3>
                      <Badge
                        variant={
                          status === "Confirmed"
                            ? "default"
                            : status === "Closed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {dateStr} at {timeStr}
                      </span>
                      <span>
                        {attendees}/{maxAttendees} registered
                      </span>
                    </div>
                    <div className="mt-3 w-full bg-muted/30 rounded-full h-2">
                      <div
                        className="bg-accent h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/club-admin/events/${event._id}`}>
                      <Button size="sm" variant="outline">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => handleDeleteEvent(event._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
