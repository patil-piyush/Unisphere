"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Download, CheckCircle2, XCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { EventCard } from "@/types/eventCard"
import { ApiRegistration } from "@/types/apiRegistration"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export default function MyEventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<EventCard[]>([])
  const [pastEvents, setPastEvents] = useState<EventCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      if (!BACKEND_API_URL) {
        setError("Client misconfigured: NEXT_PUBLIC_BACKEND_API_URL is missing.")
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${BACKEND_API_URL}/api/event-registrations/my`, {
          method: "GET",
          credentials: "include",
        })

        if (!res.ok) {
          const text = await res.text()
          let message = "Failed to load events."
          if (text && text.trim().startsWith("{")) {
            try {
              const data = JSON.parse(text)
              if (data?.message) message = data.message
            } catch {
              // ignore parse error
            }
          }
          throw new Error(message)
        }

        const data: ApiRegistration[] = await res.json()
        const now = new Date()

        const upcoming: EventCard[] = []
        const past: EventCard[] = []

        data.forEach((reg) => {
          const ev = reg.event_id
          if (!ev || !ev.start_date) return

          const startDateISO = ev.start_date
          const startDate = new Date(startDateISO)

          const endDateISO = ev.end_date
          const endDate = endDateISO ? new Date(endDateISO) : undefined

          const dateLabel = startDate.toLocaleDateString()
          const timeLabel =
            ev.start_time && ev.end_time
              ? `${ev.start_time} - ${ev.end_time}`
              : ev.start_time || ""

          const card: EventCard = {
            id: ev._id,
            title: ev.title,
            startDateISO,
            endDateISO,
            dateLabel,
            timeLabel,
            location: ev.venue || "TBA",
            image: ev.bannerURL || "/placeholder.svg?height=100&width=150",
            attended: reg.attended,
            certificateAvailable: reg.certificateAvailable,
            pointsEarned: reg.pointsEarned ?? 0,
          }

          // classify by start date vs now
          if (startDate >= now) {
            upcoming.push(card)
          } else {
            past.push(card)
          }
        })

        // sort by startDateISO (ISO string sortable)
        upcoming.sort(
          (a, b) =>
            new Date(a.startDateISO).getTime() - new Date(b.startDateISO).getTime(),
        )
        past.sort(
          (a, b) =>
            new Date(b.startDateISO).getTime() - new Date(a.startDateISO).getTime(),
        )

        setUpcomingEvents(upcoming)
        setPastEvents(past)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events.")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Events</h1>
        <p className="text-muted-foreground">
          Manage your registered events and download certificates
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
        </TabsList>

        {/* Upcoming */}
        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="text-muted-foreground">Loading events...</div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-4"
                >
                  <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      width={150}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {event.dateLabel}
                          </span>
                          {event.timeLabel && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {event.timeLabel}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-500/10 text-green-500"
                      >
                        Confirmed
                      </Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/dashboard/events/${event.id}`}>
                        <Button size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && upcomingEvents.length === 0 && (
                <div className="text-center py-12 glass rounded-2xl">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No upcoming events</p>
                  <Button className="mt-4">Browse Events</Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Past */}
        <TabsContent value="past" className="mt-6">
          {loading ? (
            <div className="text-muted-foreground">Loading events...</div>
          ) : (
            <div className="space-y-4">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-4"
                >
                  <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      width={150}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {event.dateLabel}
                          </span>
                          {event.timeLabel && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {event.timeLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.attended ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-500/10 text-green-500"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Attended
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-destructive/10 text-destructive"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Missed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {event.attended &&
                          event.pointsEarned != null &&
                          event.pointsEarned > 0 && (
                            <span className="text-sm text-primary font-medium">
                              +{event.pointsEarned} points earned
                            </span>
                          )}
                      </div>
                      {event.certificateAvailable && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 bg-transparent"
                        >
                          <Download className="h-4 w-4" />
                          Download Certificate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {!loading && pastEvents.length === 0 && (
                <div className="text-center py-12 glass rounded-2xl">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No past events</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
