"use client"

import { Calendar, Search, Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EventCard } from "@/components/dashboard/event-card"
import Link from "next/link"

const events = [
  {
    id: "1",
    title: "Tech Fest 2024",
    description: "Annual technology festival with hackathons",
    image: "/placeholder.svg?height=200&width=300",
    date: "Dec 15, 2024",
    time: "9:00 AM",
    location: "Main Auditorium",
    category: "Technology",
    club: "Tech Club",
    attendees: 180,
    maxAttendees: 200,
    isAdmin: true
  },
  {
    id: "2",
    title: "Cultural Night",
    description: "Celebrate diversity with performances",
    image: "/placeholder.svg?height=200&width=300",
    date: "Dec 20, 2024",
    time: "6:00 PM",
    location: "Open Air Theatre",
    category: "Cultural",
    club: "Cultural Committee",
    attendees: 350,
    maxAttendees: 500,
    price: 5,
    isAdmin: true
  },
]

export default function EventsPage() {
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

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <Link key={event.id} href={`/admin/events/${event.id}`}>
            <EventCard {...event} />
          </Link>
        ))}
      </div>
    </div>
  )
}
