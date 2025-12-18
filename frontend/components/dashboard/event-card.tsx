"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EventCardProps {
  _id: string
  title: string
  description: string
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
  clubName: string
  price?: number
  isRegistered?: boolean
  isAdmin?: boolean
}

export function EventCard({
  _id,
  title,
  description,
  bannerURL,
  category,
  venue,
  start_time,
  start_date,
  end_time,
  end_date,
  max_capacity,
  registeredCount,
  isClosed = false,
  clubName,
  price = 0,
  isRegistered = false,
  isAdmin = false,
}: EventCardProps) {
  const attendees = registeredCount
  const isFull = attendees >= max_capacity || isClosed
  const spotsLeft = Math.max(max_capacity - attendees, 0)

  const startDateStr =
    start_date
      ? typeof start_date === "string"
        ? new Date(start_date).toLocaleDateString()
        : start_date.toLocaleDateString()
      : ""

  const endDateStr =
    end_date
      ? typeof end_date === "string"
        ? new Date(end_date).toLocaleDateString()
        : end_date.toLocaleDateString()
      : ""

  return (
      <div className="group glass rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={bannerURL || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
              {category}
            </Badge>
            {price > 0 && (
              <Badge className="bg-accent text-accent-foreground">₹{price}</Badge>
            )}
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white/80 text-sm">{clubName}</p>
            <h3 className="text-white font-semibold text-lg line-clamp-1">{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {startDateStr}
                {startDateStr && endDateStr && startDateStr !== endDateStr
                  ? ` - ${endDateStr}`
                  : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {start_time} - {end_time}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{venue}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span
                className={cn(
                  "text-sm font-medium",
                  isFull
                    ? "text-destructive"
                    : spotsLeft <= 10
                    ? "text-accent"
                    : "text-muted-foreground"
                )}
              >
                {isFull ? "Full" : `${spotsLeft} spots left`}
              </span>
            </div>

            {isAdmin ? (
              <Badge className="bg-background/90 backdrop-blur-sm text-sm">
                {attendees} / {max_capacity} Attendees
              </Badge>
            ) : (
              <Button
                size="sm"
                variant={isRegistered ? "secondary" : "default"}
                disabled={isFull}
              >
                {isRegistered
                  ? "Registered"
                  : isFull
                  ? "Full"
                  : "Register"}
              </Button>
            )}
          </div>
        </div>
      </div>
  )
}
