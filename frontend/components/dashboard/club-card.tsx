"use client"

import Image from "next/image"
import { Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ClubCardProps {
  id: string
  name: string
  description: string
  image: string
  members: number
  events: number
  category: string
}

export function ClubCard({
  id,
  name,
  description,
  image,
  members,
  events,
  category,
}: ClubCardProps) {
  return (
    <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-primary font-medium uppercase tracking-wide mb-1">
            {category}
          </p>
          <h3 className="font-semibold text-lg truncate">{name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{members}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{events} events</span>
          </div>
        </div>
        <Button size="sm" variant="ghost">
          View
        </Button>
      </div>
    </div>
  )
}
