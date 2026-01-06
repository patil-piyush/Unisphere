"use client"

import { useEffect, useState } from "react"
import { Trophy, Medal, Award, Filter } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LeaderboardTable } from "@/components/dashboard/leaderboard-table"
import axios from "axios"
import { ApiLeaderboardEntry } from "@/types/apiLeaderboardEntry"
import { LeaderboardApiResponse } from "@/types/leaderboardApiResponse"
import { LeaderboardEntry } from "@/types/leaderboardEntry"

const BackendURL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000"

export default function LeaderboardPage() {
  const [filter, setFilter] = useState("all")
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await axios.get<LeaderboardApiResponse>(
          `${BackendURL}/api/gamification/leaderboard/monthly`,
          { withCredentials: true },
        )

        const data = res.data

        const mapped: LeaderboardEntry[] = (data.leaderboard || []).map(
          (item, index) => ({
            rank: index + 1,
            name: item.name ?? "Unknown",
            avatar:
              item.profileIMG ??
              "/placeholder.svg?height=40&width=40",
            department: item.department ?? "Unknown",
            points: item.points,
            eventsAttended: item.eventsCount ?? 0,
            badges: item.badgesCount ?? 0,
          }),
        )

        setEntries(mapped)
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ??
          err?.message ??
          "Failed to load leaderboard."
        setError(msg)
        console.error("Error fetching leaderboard:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const topThree = entries.slice(0, 3)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">
          See who&apos;s leading the campus event participation
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Top 3 Podium (works with 1–3 entries) */}
      {topThree.length > 0 && (
        <div className="glass rounded-3xl p-8">
          <div className="flex items-end justify-center gap-4 md:gap-8">
            {/* 2nd Place (if exists) */}
            {topThree[1] && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-gray-400">
                    <img
                      src={topThree[1].avatar || "/placeholder.svg"}
                      alt={topThree[1].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                    <Medal className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="font-semibold">{topThree[1].name}</p>
                  <p className="text-sm text-muted-foreground">
                    {topThree[1].points.toLocaleString()} pts
                  </p>
                </div>
                <div className="w-24 md:w-32 h-24 md:h-28 bg-gray-400/20 rounded-t-xl mt-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-400">2</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-yellow-500 shadow-lg shadow-yellow-500/30">
                  <img
                    src={topThree[0].avatar || "/placeholder.svg"}
                    alt={topThree[0].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="font-bold text-lg">{topThree[0].name}</p>
                <p className="text-sm text-muted-foreground">
                  {topThree[0].points.toLocaleString()} pts
                </p>
              </div>
              <div className="w-28 md:w-36 h-32 md:h-40 bg-yellow-500/20 rounded-t-xl mt-4 flex items-center justify-center">
                <span className="text-5xl font-bold text-yellow-500">1</span>
              </div>
            </div>

            {/* 3rd Place (if exists) */}
            {topThree[2] && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-amber-600">
                    <img
                      src={topThree[2].avatar || "/placeholder.svg"}
                      alt={topThree[2].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="font-semibold">{topThree[2].name}</p>
                  <p className="text-sm text-muted-foreground">
                    {topThree[2].points.toLocaleString()} pts
                  </p>
                </div>
                <div className="w-24 md:w-32 h-20 md:h-24 bg-amber-600/20 rounded-t-xl mt-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-amber-600">3</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl font-semibold">Full Rankings</h2>
        <div className="flex gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="cs">Computer Science</SelectItem>
              <SelectItem value="ee">Electronics</SelectItem>
              <SelectItem value="me">Mechanical</SelectItem>
              <SelectItem value="ba">Business Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <LeaderboardTable entries={entries} />

      {loading && (
        <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
      )}
    </div>
  )
}
