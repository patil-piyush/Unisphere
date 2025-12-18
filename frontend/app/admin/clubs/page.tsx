"use client"

import { Users, Search, Plus, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ClubCard } from "@/components/dashboard/club-card"
import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL;


const clu = [
  {
    id: "1",
    name: "Tech Club",
    description: "Exploring latest technologies and innovations",
    image: "/placeholder.svg?height=200&width=300",
    members: 145,
    events: 12,
    category: "Technology",
  },
  {
    id: "2",
    name: "Cultural Committee",
    description: "Celebrating diversity and cultural exchange",
    image: "/placeholder.svg?height=200&width=300",
    members: 98,
    events: 8,
    category: "Cultural",
  },
  {
    id: "3",
    name: "Sports Committee",
    description: "Organizing sports events and competitions",
    image: "/placeholder.svg?height=200&width=300",
    members: 203,
    events: 15,
    category: "Sports",
  },
]

export default function ClubsPage() {

  const [clubs, setClubs] = useState<Array<{
    id: string;
    name: string;
    description: string;
    image: string;
    members: number;
    events: number;
    category: string;
  }>>([]);


  useEffect(() => {
    axios
      .get(`${BackendURL}/api/admin/`, { withCredentials: true })
      .then((response) => {
        const data = response.data
        const mapped = (data.clubs || []).map((c: any) => ({
          id: c._id,
          name: c.name,
          description: c.description,
          image: c.image || "/placeholder.svg",
          members: c.membersCount ?? 0,
          events: c.eventsCount ?? 0,
          category: c.category || "Other",
        }))
        setClubs(mapped)
      })
      .catch((error) => {
        console.error("Error fetching Active Clubs:", error)
      })
  }, [])



  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Clubs Management</h1>
          <p className="text-muted-foreground">Manage all registered clubs</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Link href="/admin/clubs/create" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            New Club
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clubs..." className="pl-10" />
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <Link key={club.id} href={`/admin/clubs/${club.id}`}>
            <ClubCard {...club} id={club.id} />
          </Link>
        ))}
      </div>
    </div>
  )
}
