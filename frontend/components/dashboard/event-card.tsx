"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EventCardProps {
  id: string
  title: string
  description: string
  image: string
  date: string
  time: string
  location: string
  category: string
  club: string
  attendees: number
  maxAttendees: number
  price?: number
  isRegistered?: boolean
  isAdmin?: boolean
}

export function EventCard({
  id,
  title,
  description,
  image,
  date,
  time,
  location,
  category,
  club,
  attendees,
  maxAttendees,
  price = 0,
  isRegistered = false,
  isAdmin = false,
}: EventCardProps) {
  const isFull = attendees >= maxAttendees
  const spotsLeft = maxAttendees - attendees

  return (
    <div className="group glass rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {category}
          </Badge>
          {price > 0 && <Badge className="bg-accent text-accent-foreground">${price}</Badge>}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white/80 text-sm">{club}</p>
          <h3 className="text-white font-semibold text-lg line-clamp-1">{title}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span
              className={cn(
                "text-sm font-medium",
                isFull ? "text-destructive" : spotsLeft <= 10 ? "text-accent" : "text-muted-foreground",
              )}
            >
              {isFull ? "Full" : `${spotsLeft} spots left`}
            </span>
          </div>
          {isAdmin ? (
            <Badge className="bg-background/90 backdrop-blur-sm text-sm">
              {attendees} / {maxAttendees} Attendees
            </Badge>
          ) : (
            <Link href={`/dashboard/events/${id}`}>
              <Button size="sm" variant={isRegistered ? "secondary" : "default"}>
                {isRegistered ? "View Details" : "Register"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
