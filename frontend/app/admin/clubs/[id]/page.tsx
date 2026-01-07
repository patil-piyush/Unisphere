"use client"

import * as React from "react"
import Image from "next/image"
import { useClubsStore } from "@/stores/useClubsStore"
import { ArrowLeft, MessageSquare, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import axios from "axios"

const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL

type ClubDetail = {
  id: string
  name: string
  description: string
  image: string
  members: number
  events: number
  category: string
  founded: string
  president: { name: string; avatar: string }
}

type Member = {
  id: string
  name: string
  role: string
  joinedDate: Date
}

export default function ClubDetailPage(props: { params: Promise<{ id: string }> }) {
  const clubs = useClubsStore((state) => state.clubs)

  const { id } = React.use(props.params)

  const [clubDetail, setClubDetail] = React.useState<ClubDetail | null>(null)
  const [recentMembers, setRecentMembers] = React.useState<Member[]>([])

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      const fromStore = clubs.find((c) => c.id === id)
      if (fromStore) {
        setClubDetail({
          ...fromStore,
          founded: "",
          president: {
            name: "Unknown",
            avatar: "/placeholder.svg?height=40&width=40",
          },
        })
        return
      }

      if (!BackendURL) return

      try {
        const res = await axios.get(
          `${BackendURL}/api/admin/clubs/${id}`,
          { withCredentials: true },
        )
        if (cancelled) return

        const data = res.data
        setClubDetail({
          id: data._id,
          name: data.name,
          description: data.description ?? "",
          image: data.image || "/placeholder.svg?height=400&width=600",
          members: data.membersCount ?? 0,
          events: data.eventsCount ?? 0,
          category: data.category ?? "Other",
          founded: data.founded ?? "",
          president: {
            name: data.president?.name ?? "Unknown",
            avatar:
              data.president?.avatar ||
              "/placeholder.svg?height=40&width=40",
          },
        })
      } catch (err) {
        console.error("Error fetching club details:", err)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [clubs, id])

  return (
    <div className="space-y-8">
      <Link href="/admin/clubs">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clubs
        </Button>
      </Link>

      {clubDetail && (
        <>
          <div className="glass bg-card/70 rounded-xl overflow-hidden border border-border/50">
            {/* Club banner */}
            <div className="relative h-64 w-full">
              <Image
                src={clubDetail.image}
                alt={clubDetail.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-r from-black/40 to-black/10" />
            </div>

            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    {clubDetail.name}
                  </h1>
                  <p className="text-muted-foreground">
                    {clubDetail.description}
                  </p>
                </div>
                <Badge>{clubDetail.category}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="text-2xl font-bold">
                    {clubDetail.members}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Events</p>
                  <p className="text-2xl font-bold">
                    {clubDetail.events}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Founded</p>
                  <p className="text-2xl font-bold">
                    {clubDetail.founded}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={clubDetail.president.avatar} />
                  <AvatarFallback>RS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {clubDetail.president.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Club President
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="bg-primary hover:bg-primary/90">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Edit Club
            </Button>
          </div>

          <div className="glass bg-card/70 rounded-xl p-6 border border-border/50">
            <h2 className="text-xl font-bold mb-6">Recent Members</h2>
            <div className="space-y-3">
              {recentMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/30"
                >
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {member.joinedDate.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
