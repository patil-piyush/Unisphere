"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QRAttendance } from "@/components/dashboard/qr-attendance"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock } from "lucide-react"

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

type LiveAttendee = {
  _id: string
  user_id: { name: string; email: string }
  check_in_time: string
}

const recentAttendees = [
  { name: "Priya Sharma", time: "2 mins ago", avatar: "/placeholder.svg?height=32&width=32" },
  { name: "Raj Kumar", time: "3 mins ago", avatar: "/placeholder.svg?height=32&width=32" },
  { name: "Emily Chen", time: "5 mins ago", avatar: "/placeholder.svg?height=32&width=32" },
  { name: "John Doe", time: "7 mins ago", avatar: "/placeholder.svg?height=32&width=32" },
  { name: "Sarah Lee", time: "10 mins ago", avatar: "/placeholder.svg?height=32&width=32" },
]

export default function AttendancePage() {
  const [events, setEvents] = useState<ClubEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [qrCode, setQrCode] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  const [liveAttendees, setLiveAttendees] = useState<LiveAttendee[]>([])
  const [isLiveLoading, setIsLiveLoading] = useState(false)




  

  // fetch events from backend
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)
        setError(null)

        const res = await axios.get<ClubEvent[]>(
          `${BackendURL}/api/events/club/myevents`,
          { withCredentials: true },
        )

        setEvents(res.data)
        if (res.data.length > 0) {
          setSelectedEvent(res.data[0])
        }
      } catch (err) {
        console.error("Failed to fetch club events", err)
        setError("Failed to load events.")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // when selectedEvent changes, start polling live attendance
  useEffect(() => {
    if (!selectedEvent?._id) return

    // initial load
    fetchLiveAttendance(selectedEvent._id)

    // poll every 5 seconds
    const id = setInterval(() => {
      fetchLiveAttendance(selectedEvent._id)
    }, 5000)

    return () => clearInterval(id)
  }, [selectedEvent?._id])



  useEffect(() => {
    if (!sessionId || !selectedEvent?._id || !expiresIn) return
  
    let remaining = expiresIn
  
    const interval = setInterval(() => {
      remaining -= 1
  
      if (remaining <= 0) {
        clearInterval(interval)
  
        fetchNextToken(selectedEvent._id, sessionId)
          .then(data => {
            setQrCode(data.qrCode)
            setExpiresIn(Number(data.expires_in)) 
          })
          .catch(err => {
            console.error("Failed to refresh QR", err)
            setError("Failed to refresh QR code.")
          })
      } else {
        setExpiresIn(remaining)
      }
    }, 1000)
  
    return () => clearInterval(interval)
  }, [sessionId, selectedEvent?._id])
  


  const startSession = async () => {
    if (!selectedEvent) {
      setError("Please select an event first.")
      return
    }

    setError(null)
    setIsStarting(true)
    try {
      const duration = 30 // seconds
      const res = await axios.post(
        `${BackendURL}/api/events/${selectedEvent._id}/attendance/start`,
        { duration },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      )
      const data = res.data
      setQrCode(data.qrCode)
      setExpiresIn(Number(data.expires_in))
      setSessionId(data.session_id)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to start attendance session."
      setError(msg)
    } finally {
      setIsStarting(false)
    }
  }


  const fetchLiveAttendance = async (eventId: string) => {
    try {
      setIsLiveLoading(true)
      const res = await axios.get<LiveAttendee[]>(
        `${BackendURL}/api/events/${eventId}/attendance/live`,
        { withCredentials: true },
      )
      setLiveAttendees(res.data)
    } catch (err) {
      console.error("Failed to fetch live attendance", err)
    } finally {
      setIsLiveLoading(false)
    }
  }

  const fetchNextToken = async (eventId: string, sessionId: string) => {
    const res = await axios.get(
      `${BackendURL}/api/events/${eventId}/attendance/next-token`,
      {
        withCredentials: true,
        params: { session_id: sessionId }, // goes into req.query.session_id
      },
    ) 
  
    return res.data as { qrCode: string; expires_in: number }
  }

  


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Attendance Panel</h1>
        <p className="text-muted-foreground">Track event attendance with dynamic QR codes</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Select
          value={selectedEvent?._id ?? ""}
          onValueChange={(value) => {
            const ev = events.find((e) => e._id === value) || null
            setSelectedEvent(ev)
            // reset previous session QR if switching event
            setQrCode(null)
            setExpiresIn(null)
            setSessionId(null)
          }}
          disabled={loading || events.length === 0}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder={loading ? "Loading events..." : "Select Event"} />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event._id} value={event._id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={startSession} disabled={isStarting || !selectedEvent}>
          {isStarting ? "Starting..." : "Start Attendance Session"}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <QRAttendance
          eventId={selectedEvent?._id ?? ""}
          eventName={selectedEvent?.title ?? "No event selected"}
          totalRegistered={selectedEvent?.registeredCount ?? 0}
          attendedCount={0} // replace with real count if available
          qrCode={qrCode}
          expiresIn={expiresIn}
          sessionId={sessionId}
        />

<div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Live Attendance Feed</h3>
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
              {isLiveLoading ? "Refreshing..." : "Live"}
            </Badge>
          </div>

          <div className="space-y-4">
            {liveAttendees.length === 0 && !isLiveLoading && (
              <p className="text-sm text-muted-foreground">
                No attendees yet. Ask participants to scan the QR.
              </p>
            )}

            {liveAttendees.map((att, index) => (
              <div
                key={att._id}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={"/placeholder.svg"} />
                    <AvatarFallback>
                      {att.user_id.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{att.user_id.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(att.check_in_time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
