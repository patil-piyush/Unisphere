"use client"

import { useEffect, useState } from "react"
import {
  Edit2,
  Mail,
  Calendar,
  Award,
  Star,
  Trophy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import axios from "axios"
import { User } from "@/types/user"
import { ApiBadge, ApiBadgesResponse, BadgeConfigEntry } from "@/types/badges"
import { BadgesEarnedCard } from "@/components/dashboard/profile/BadgesEarnedCard"
import { ProgressStreaksCard } from "@/components/dashboard/profile/ProgressStreaksCard"

const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL!


export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [eventsCount, setEventsCount] = useState<number>(0)
  const [points, setPoints] = useState(0)
  const [badgesCount, setBadgesCount] = useState(0)
  const [rank, setRank] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [stats, setStats] = useState<
    Array<{
      title: string
      value: any
    }>
  >([])

  const [earnedBadges, setEarnedBadges] = useState<ApiBadge[]>([])

  const monthlyBadgeConfig: BadgeConfigEntry[] = [
    { name: "Newcomer", description: "Attended first event", requiredPoints: 10, isPermanent: false },
    { name: "Explorer", description: "Active participant", requiredPoints: 30, isPermanent: false },
    { name: "Learner", description: "Consistent event attendance", requiredPoints: 50, isPermanent: false },
    { name: "Contributor", description: "Highly active in events", requiredPoints: 80, isPermanent: false },
    { name: "Achiever", description: "Outstanding participation", requiredPoints: 120, isPermanent: false },
    { name: "Leader", description: "Top performer of the month", requiredPoints: 160, isPermanent: false },
    { name: "Star Student", description: "Elite level engagement", requiredPoints: 200, isPermanent: false },
    { name: "Campus Icon", description: "Exceptional consistency", requiredPoints: 250, isPermanent: false },
    { name: "UniSphere Elite", description: "Monthly legend", requiredPoints: 300, isPermanent: false },
    { name: "UniSphere Champion", description: "Top-tier monthly achiever", requiredPoints: 350, isPermanent: false },
  ]

  useEffect(() => {
    // events
    axios
      .get(`${BackendURL}/api/event-registrations/my`, { withCredentials: true })
      .then((response) => setEventsCount(response.data.length))
      .catch((error) => {
        console.error("User is not authenticated!", error)
        window.location.href = "/login"
      })

    // points + monthly badges
    axios
      .get<ApiBadgesResponse>(`${BackendURL}/api/gamification/badges/me`, {
        withCredentials: true,
      })
      .then((response) => {
        setPoints(response.data.points)
        setEarnedBadges(response.data.badges || [])
        setBadgesCount((response.data.badges || []).length)
      })
      .catch((error) => {
        console.error("Error fetching user badges!", error)
      })

    // rank
    axios
      .get(`${BackendURL}/api/gamification/leaderboard/rank`, {
        withCredentials: true,
      })
      .then((response) => setRank(response.data.rank.toString()))
      .catch((error) => {
        console.error("Error fetching user rank!", error)
      })
  }, [])

  useEffect(() => {
    setStats([
      {
        title: "Events Attended",
        value: eventsCount,
      },
      {
        title: "Points",
        value: points,
      },
      {
        title: "Badges Earned",
        value: badgesCount,
      },
      {
        title: "Leaderboard Rank",
        value: rank,
      },
    ])
  }, [eventsCount, points, badgesCount, rank])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const userRes = await fetch(`${BackendURL}/api/users/me`, {
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
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load profile."
        )
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
        <p className="text-muted-foreground">
          Manage your profile and preferences
        </p>
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

          {/* Badges from backend */}
          <BadgesEarnedCard earnedBadges={earnedBadges} />
        </div>

        {/* Stats & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass rounded-2xl p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">
                {stats.find((stat) => stat.title === "Events Attended")?.value ||
                  0}
              </p>
              <p className="text-sm text-muted-foreground">Events</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <Star className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">
                {(
                  stats.find((stat) => stat.title === "Points")?.value || 0
                ).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Points</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <Award className="h-6 w-6 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">
                {stats.find((stat) => stat.title === "Badges Earned")?.value ||
                  0}
              </p>
              <p className="text-sm text-muted-foreground">Badges</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-bold">
                #
                {stats.find(
                  (stat) => stat.title === "Leaderboard Rank"
                )?.value || "Unranked"}
              </p>
              <p className="text-sm text-muted-foreground">Rank</p>
            </div>
          </div>

          {/* Bio */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-3">About Me</h3>
            <p className="text-muted-foreground">
              {user.aboutMe ||
                "Tell others about yourself by editing your profile."}
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

          {/* Progress + Streaks */}
          <ProgressStreaksCard
            points={points}
            eventsCount={eventsCount}
            monthlyBadgeConfig={monthlyBadgeConfig}
          />
        </div>
      </div>
    </div>
  )
}
