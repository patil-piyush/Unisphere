"use client"

import { useEffect, useState } from "react"
import { Edit2, Mail, Calendar, Award, Star, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL!

type User = {
  name: string
  email: string
  college_Name: string
  department: string
  year_of_study: number
  interest?: string[]
  profileIMG?: string
  bannerIMG?: string
  role: "student" | "clubMember" | "admin"
  aboutMe?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [eventsCount, setEventsCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)


  // temporary static stats & badges (as requested)
  const defaultStats = {
    eventsAttended: eventsCount,
    points: 2450,
    certificates: 12,
    rank: 15,
  }
  const defaultBadges = [
    { name: "Tech Enthusiast", icon: "🖥️", color: "bg-blue-500/10 text-blue-500" },
    { name: "Event Regular", icon: "📅", color: "bg-green-500/10 text-green-500" },
    { name: "Hackathon Winner", icon: "🏆", color: "bg-yellow-500/10 text-yellow-500" },
    { name: "Early Bird", icon: "🐦", color: "bg-orange-500/10 text-orange-500" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // fetch user profile
        const userRes = await fetch(`${BACKEND_API_URL}/api/users/me`, {
          method: "GET",
          credentials: "include",
        })

        if (!userRes.ok) {
          const text = await userRes.text()
          let message = "Failed to load user profile."
          if (text && text.trim().startsWith("{")) {
            try {
              const data = JSON.parse(text)
              if (data?.message) message = data.message
            } catch {
              /* ignore */
            }
          }
          throw new Error(message)
        }

        const userData: User = await userRes.json()
        setUser(userData)

        // fetch event registrations for count
        const eventsRes = await fetch(
          `${BACKEND_API_URL}/api/event-registrations/my`,
          {
            method: "GET",
            credentials: "include",
          },
        )

        if (eventsRes.ok) {
          const registrations = await eventsRes.json()
          setEventsCount(Array.isArray(registrations) ? registrations.length : 0)
        } else {
          // do not hard fail profile if this request fails
          setEventsCount(0)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <p className="text-muted-foreground">Loading profile...</p>
  }

  if (error) {
    return <p className="text-destructive text-sm">{error}</p>
  }

  if (!user) {
    return <p className="text-muted-foreground">No user data available.</p>
  }

  const avatarFallback = user.name?.[0]?.toUpperCase() || "U"
  const interests = user.interest && user.interest.length > 0 ? user.interest : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card with banner background */}
      <div className="lg:col-span-1">
        <div className="glass rounded-2xl overflow-hidden">
          {/* Banner as cover */}
          <div className="relative h-24 sm:h-28 md:h-32 w-full bg-muted">
            {user.bannerIMG ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.bannerIMG}
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                Banner coming soon...
              </div>
            )}
          </div>

          {/* Avatar + info */}
          <div className="p-6 pt-0">
            <div className="flex flex-col items-center -mt-10">
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarImage src={user.profileIMG || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-bold mt-3">{user.name}</h2>
              <p className="text-muted-foreground">{user.department}</p>
              <Badge variant="secondary" className="mt-2">
                {user.year_of_study} Year
              </Badge>

              <div className="mt-5 w-full space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{user.college_Name}</span>
                </div>
              </div>

              <Button
                asChild
                className="w-full mt-5 bg-transparent"
                variant="outline"
              >
                <Link
                  href="/dashboard/profile/edit"
                  className="flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Badges (unchanged) */}
        <div className="glass rounded-2xl p-6 mt-6">
          <h3 className="font-semibold mb-4">Badges Earned</h3>
          <div className="grid grid-cols-2 gap-3">
            {defaultBadges.map((badge, index) => (
              <div
                key={index}
                className={`rounded-xl p-3 text-center ${badge.color}`}
              >
                <span className="text-2xl">{badge.icon}</span>
                <p className="text-xs font-medium mt-1">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


        {/* Stats & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass rounded-2xl p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{defaultStats.eventsAttended}</p>
              <p className="text-sm text-muted-foreground">Events</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <Star className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{defaultStats.points.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Points</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <Award className="h-6 w-6 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">{defaultStats.certificates}</p>
              <p className="text-sm text-muted-foreground">Certificates</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-bold">#{defaultStats.rank}</p>
              <p className="text-sm text-muted-foreground">Rank</p>
            </div>
          </div>

          {/* Bio */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-3">About Me</h3>
            <p className="text-muted-foreground">
              {user.aboutMe || "Tell others about yourself by editing your profile."}
            </p>
          </div>

          {/* Interests */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Interests</h3>
            {interests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add your interests to personalize your experience.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Activity Chart Placeholder */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Event Activity</h3>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <p>Activity chart coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
