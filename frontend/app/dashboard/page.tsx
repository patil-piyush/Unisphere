"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import Image from "next/image"
import {
  Calendar,
  Trophy,
  Award,
  Star,
  ArrowRight,
  ScanLine,
  LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/dashboard/stats-card"
import { EventCard } from "@/components/dashboard/event-card"

const BackendURL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000"

const api = axios.create({
  baseURL: BackendURL,
  withCredentials: true,
})

type Event = {
  _id?: string
  id?: string
  title: string
  description: string
  clubName: string
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
  price?: number
  isRegistered?: boolean
  isAdmin?: boolean
}

export default function DashboardPage() {
  const [username, setUsername] = useState("")
  const [eventAttended, setEventAttended] = useState(0)
  const [points, setPoints] = useState(0)
  const [badges, setBadges] = useState(0)
  const [rank, setRank] = useState("")
  const [stats, setStats] = useState<
    Array<{
      title: string
      value: any
      change: string
      changeType: "positive" | "neutral" | "negative"
      icon: LucideIcon
    }>
  >([])
  const [recommendedEventsList, setRecommendedEventsList] = useState<Event[]>(
    [],
  )
  const [upcomingEventsList, setUpcomingEventsList] = useState<Event[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          profileRes,
          regsRes,
          pointsRes,
          rankRes,
          eventsRes,
        ] = await Promise.all([
          api.get("/api/users/me"),
          api.get("/api/event-registrations/my"),
          api.get("/api/gamification/points/monthly"),
          api.get("/api/gamification/leaderboard/rank"),
          api.get("/api/events"),
        ])

        // profile
        setUsername(profileRes.data.name ?? "")

        // registrations count
        const regsData = Array.isArray(regsRes.data) ? regsRes.data : []
        setEventAttended(regsData.length)

        // points + badges from same response
        const pointsVal = pointsRes.data.points ?? 0
        setPoints(pointsVal.toString())
        const badgesArr = pointsRes.data.badges ?? []
        setBadges(badgesArr.length)

        // rank
        setRank(rankRes.data.rank?.toString() ?? "Unranked")

        // events with registration flags
        const registeredEventIds = new Set<string>(
          regsData
            .map((r: any) => r?.event_id?._id)
            .filter((id: any) => typeof id === "string"),
        )

        interface EventWithFlags extends Event {
          isRegistered: boolean
        }

        const events = eventsRes.data as Event[]
        const eventsWithFlags: EventWithFlags[] = events.map(
          (e): EventWithFlags => {
            const eid = (typeof e._id === "string" ? e._id : "") || e.id || ""
            return {
              ...e,
              _id: eid,
              id: eid,
              isRegistered: registeredEventIds.has(eid),
            }
          },
        )

        setRecommendedEventsList(eventsWithFlags)
        setUpcomingEventsList(eventsWithFlags)
      } catch (error: any) {
        console.error("Error fetching dashboard data", error)
        // if unauthorized, send to login
        if (error?.response?.status === 401) {
          window.location.href = "/login"
        }
      }
    }

    fetchAll()
  }, [])

  useEffect(() => {
    setStats([
      {
        title: "Events Attended",
        value: eventAttended,
        change: "+3 this month --- remaining",
        changeType: "positive",
        icon: Calendar,
      },
      {
        title: "Total Points",
        value: points,
        change: `${Number(points) >= 100 ? "Great job!" : "Keep going!"}`,
        changeType: "positive",
        icon: Star,
      },
      {
        title: "Badges Earned",
        value: badges,
        change: "",
        changeType: "neutral",
        icon: Award,
      },
      {
        title: "Leaderboard Rank",
        value: rank,
        change:
          rank === "Unranked" || !rank
            ? "Participate more to get ranked!"
            : "Go higher!",
        changeType:
          rank === "Unranked" || !rank ? "negative" : "positive",
        icon: Trophy,
      },
    ])
  }, [eventAttended, points, badges, rank])

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {username}</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening on campus today.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/attendance">
            <Button variant="outline" className="group">
              Scan QR to Mark Attendance
              <ScanLine className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link href="/dashboard/events">
            <Button className="group">
              Explore Events
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recommended For You</h2>
            <Link
              href="/dashboard/events"
              className="text-primary text-sm hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendedEventsList.slice(0, 2).map((event) => {
              const key = event._id || event.id || "unknown"
              return (
                <Link href="/dashboard/events" key={key}>
                  <EventCard
                    {...{
                      ...event,
                      _id: key,
                      id: key,
                    }}
                  />
                </Link>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <div className="glass rounded-2xl p-4 space-y-3">
            {upcomingEventsList.map((event) => {
              const startDateStr = event.start_date
                ? typeof event.start_date === "string"
                  ? new Date(event.start_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : event.start_date.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                : ""

              const key =
                event._id || event.id || `${event.title}-${event.start_date}`

              return (
                <div
                  key={key}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                    <Image
                      src={event.bannerURL || "/placeholder.svg"}
                      alt={event.title}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full rounded-xl"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {startDateStr}
                    </p>
                  </div>
                </div>
              )
            })}

            <Link href="/dashboard/my-events">
              <Button variant="ghost" className="w-full mt-2">
                View My Schedule
              </Button>
            </Link>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/dashboard/events">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Browse Events
                </Button>
              </Link>
              <Link href="/dashboard/leaderboard">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  View Leaderboard
                </Button>
              </Link>
              <Link href="/dashboard/my-events">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Award className="mr-2 h-4 w-4" />
                  My Certificates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}










// "use client"

// import { useEffect, useState } from "react"
// import axios from "axios"
// import Link from "next/link"
// import Image from "next/image"
// import {
//   Calendar,
//   Trophy,
//   Award,
//   Star,
//   ArrowRight,
//   ScanLine,
//   LucideIcon,
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { StatsCard } from "@/components/dashboard/stats-card"
// import { EventCard } from "@/components/dashboard/event-card"

// const BackendURL =
//   process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000"

// type Event = {
//   _id?: string
//   id?: string
//   title: string
//   description: string
//   clubName: string
//   bannerURL?: string
//   category: "Workshop" | "Seminar" | "Social" | "Competition" | "Other"
//   venue: string
//   start_time: string
//   start_date: string | Date
//   end_time: string
//   end_date: string | Date
//   max_capacity: number
//   registeredCount: number
//   isClosed?: boolean
//   price?: number
//   isRegistered?: boolean
//   isAdmin?: boolean
// }

// export default function DashboardPage() {
//   const [username, setUsername] = useState("")
//   const [eventAttended, setEventAttended] = useState(0)
//   const [points, setPoints] = useState(0)
//   const [badges, setBadges] = useState(0)
//   const [rank, setRank] = useState("")
//   const [stats, setStats] = useState<
//     Array<{
//       title: string
//       value: any
//       change: string
//       changeType: "positive" | "neutral" | "negative"
//       icon: LucideIcon
//     }>
//   >([])
//   const [recommendedEventsList, setRecommendedEventsList] = useState<Event[]>(
//     [],
//   )
//   const [upcomingEventsList, setUpcomingEventsList] = useState<Event[]>([])

//   useEffect(() => {
//     // profile
//     axios
//       .get(`${BackendURL}/api/users/me`, { withCredentials: true })
//       .then((response) => setUsername(response.data.name))
//       .catch((error) => {
//         console.error("There was an error fetching the profile data!", error)
//       })

//     // registrations (for stats)
//     axios
//       .get(`${BackendURL}/api/event-registrations/my`, {
//         withCredentials: true,
//       })
//       .then((response) => setEventAttended(response.data.length))
//       .catch((error) => {
//         console.error("User is not authenticated!", error)
//         window.location.href = "/login"
//       })

//     axios
//       .get(`${BackendURL}/api/gamification/points/monthly`, {
//         withCredentials: true,
//       })
//       .then((response) => setPoints(response.data.points.toString()))
//       .catch((error) => {
//         console.error("Error fetching user points!", error)
//       })

//     axios
//       .get(`${BackendURL}/api/gamification/points/monthly`, {
//         withCredentials: true,
//       })
//       .then((response) => {
//         const badges = response.data.badges ?? []
//         setBadges(badges.length)
//       })
//       .catch((error) => {
//         console.error("Error fetching user badges!", error)
//       })

//     axios
//       .get(`${BackendURL}/api/gamification/leaderboard/rank`, {
//         withCredentials: true,
//       })
//       .then((response) => setRank(response.data.rank.toString()))
//       .catch((error) => {
//         console.error("Error fetching user rank!", error)
//       })

//     const fetchEventsWithFlags = async () => {
//       try {
//         const [eventsRes, regsRes] = await Promise.all([
//           axios.get(`${BackendURL}/api/events`, { withCredentials: true }),
//           axios.get(`${BackendURL}/api/event-registrations/my`, {
//             withCredentials: true,
//           }),
//         ])

//         const events = eventsRes.data as Event[]
//         const regsData = Array.isArray(regsRes.data) ? regsRes.data : []
//         const registeredEventIds = new Set<string>(
//           regsData
//             .map((r: any) => r?.event_id?._id)
//             .filter((id: any) => typeof id === "string"),
//         )

//         interface EventWithFlags extends Event {
//           isRegistered: boolean
//         }

//         const eventsWithFlags: EventWithFlags[] = events.map(
//           (e): EventWithFlags => {
//             const eid = (typeof e._id === "string" ? e._id : "") || e.id || ""
//             return {
//               ...e,
//               _id: eid,
//               id: eid,
//               isRegistered: registeredEventIds.has(eid),
//             }
//           },
//         )

//         setRecommendedEventsList(eventsWithFlags)
//         setUpcomingEventsList(eventsWithFlags)
//       } catch (error) {
//         console.error("User is not authenticated!", error)
//         window.location.href = "/login"
//       }
//     }

//     fetchEventsWithFlags()
//   }, [])

//   useEffect(() => {
//     setStats([
//       {
//         title: "Events Attended",
//         value: eventAttended,
//         change: "+3 this month --- remaining",
//         changeType: "positive",
//         icon: Calendar,
//       },
//       {
//         title: "Total Points",
//         value: points,
//         change: `${Number(points) >= 100 ? "Great job!" : "Keep going!"}`,
//         changeType: "positive",
//         icon: Star,
//       },
//       {
//         title: "Badges Earned",
//         value: badges,
//         change: "",
//         changeType: "neutral",
//         icon: Award,
//       },
//       {
//         title: "Leaderboard Rank",
//         value: rank,
//         change:
//           rank === "Unranked" || !rank
//             ? "Participate more to get ranked!"
//             : "Go higher!",
//         changeType:
//           rank === "Unranked" || !rank ? "negative" : "positive",
//         icon: Trophy,
//       },
//     ])
//   }, [eventAttended, points, badges, rank])

//   return (
//     <div className="space-y-8">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold">Welcome back, {username}</h1>
//           <p className="text-muted-foreground">
//             Here&apos;s what&apos;s happening on campus today.
//           </p>
//         </div>

//         <div className="flex gap-3">
//           <Link href="/dashboard/attendance">
//             <Button variant="outline" className="group">
//               Scan QR to Mark Attendance
//               <ScanLine className="ml-2 h-4 w-4" />
//             </Button>
//           </Link>

//           <Link href="/dashboard/events">
//             <Button className="group">
//               Explore Events
//               <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
//             </Button>
//           </Link>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {stats.map((stat, index) => (
//           <StatsCard key={index} {...stat} />
//         ))}
//       </div>

//       <div className="grid lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-semibold">Recommended For You</h2>
//             <Link
//               href="/dashboard/events"
//               className="text-primary text-sm hover:underline"
//             >
//               View all
//             </Link>
//           </div>
//           <div className="grid md:grid-cols-2 gap-4">
//             {recommendedEventsList.slice(0, 2).map((event) => {
//               const key = event._id || event.id || "unknown"
//               return (
//                 <Link href="/dashboard/events" key={key}>
//                   <EventCard
//                     {...{
//                       ...event,
//                       _id: key,
//                       id: key,
//                     }}
//                   />
//                 </Link>
//               )
//             })}
//           </div>
//         </div>

//         <div className="space-y-4">
//           <h2 className="text-xl font-semibold">Upcoming Events</h2>
//           <div className="glass rounded-2xl p-4 space-y-3">
//             {upcomingEventsList.map((event) => {
//               const startDateStr = event.start_date
//                 ? typeof event.start_date === "string"
//                   ? new Date(event.start_date).toLocaleDateString("en-GB", {
//                       day: "2-digit",
//                       month: "2-digit",
//                       year: "numeric",
//                     })
//                   : event.start_date.toLocaleDateString("en-GB", {
//                       day: "2-digit",
//                       month: "2-digit",
//                       year: "numeric",
//                     })
//                 : ""

//               const key =
//                 event._id || event.id || `${event.title}-${event.start_date}`

//               return (
//                 <div
//                   key={key}
//                   className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
//                 >
//                   <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
//                     <Image
//                       src={event.bannerURL || "/placeholder.svg"}
//                       alt={event.title}
//                       width={48}
//                       height={48}
//                       className="object-cover w-full h-full rounded-xl"
//                     />
//                   </div>
//                   <div>
//                     <p className="font-medium">{event.title}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {startDateStr}
//                     </p>
//                   </div>
//                 </div>
//               )
//             })}

//             <Link href="/dashboard/my-events">
//               <Button variant="ghost" className="w-full mt-2">
//                 View My Schedule
//               </Button>
//             </Link>
//           </div>

//           <div className="glass rounded-2xl p-4">
//             <h3 className="font-semibold mb-3">Quick Actions</h3>
//             <div className="space-y-2">
//               <Link href="/dashboard/events">
//                 <Button
//                   variant="outline"
//                   className="w-full justify-start bg-transparent"
//                 >
//                   <Calendar className="mr-2 h-4 w-4" />
//                   Browse Events
//                 </Button>
//               </Link>
//               <Link href="/dashboard/leaderboard">
//                 <Button
//                   variant="outline"
//                   className="w-full justify-start bg-transparent"
//                 >
//                   <Trophy className="mr-2 h-4 w-4" />
//                   View Leaderboard
//                 </Button>
//               </Link>
//               <Link href="/dashboard/my-events">
//                 <Button
//                   variant="outline"
//                   className="w-full justify-start bg-transparent"
//                 >
//                   <Award className="mr-2 h-4 w-4" />
//                   My Certificates
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }







/*
"use client"

import { Calendar, Trophy, Award, Star, ArrowRight, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/dashboard/stats-card"
import { EventCard } from "@/components/dashboard/event-card"
import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "next/image"
import axios from "axios"
import { ScanLine } from "lucide-react" 


const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000"

type Event = {
  _id?: string
  id?: string
  title: string
  description: string
  clubName: string
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
  price?: number
  isRegistered?: boolean
  isAdmin?: boolean
}

export default function DashboardPage() {
  const [username, setUsername] = useState("")
  const [eventAttended, setEventAttended] = useState(0)
  const [points, setPoints] = useState(0)
  const [badges, setbadges] = useState(0)
  const [rank, setRank] = useState("")
  const [stats, setStats] = useState<Array<{
    title: string,
    value: any,
    change: string,
    changeType: "positive" | "neutral" | "negative",
    icon: LucideIcon,
  }>>([])
  const [recommendedEventsList, setRecommendedEventsList] = useState<Array<Event>>([])
  const [upcomingEventsList, setUpcomingEventsList] = useState<Array<Event>>([])

  useEffect(() => {
    // profile
    axios
      .get(`${BackendURL}/api/users/me`, { withCredentials: true })
      .then((response) => setUsername(response.data.name))
      .catch((error) =>
        console.error("There was an error fetching the profile data!", error))

    // registrations (for stats)
    axios
      .get(`${BackendURL}/api/event-registrations/my`, { withCredentials: true })
      .then((response) => setEventAttended(response.data.length))
      .catch((error) => {
        console.error("User is not authenticated!", error)
        window.location.href = "/login"
      })

    axios.get(`${BackendURL}/api/gamification/points/monthly`, { withCredentials: true })
      .then((response) => setPoints(response.data.points.toString()))
      .catch((error) => {
        console.error("Error fetching user points!", error)
      })

    axios.get(`${BackendURL}/api/gamification/points/monthly`, { withCredentials: true })
      .then((response) => {
        const badges = response.data.badges ?? [];
        setbadges(badges.length);
      }
      )
      .catch((error) => {
        console.error("Error fetching user points!", error)
      })


    axios.get(`${BackendURL}/api/gamification/leaderboard/rank`, { withCredentials: true })
      .then((response) => setRank(response.data.rank.toString()))
      .catch((error) => {
        console.error("Error fetching user points!", error)
      })

    // events + registration flags for cards
    const fetchEventsWithFlags = async () => {
      try {
        const [eventsRes, regsRes] = await Promise.all([
          axios.get(`${BackendURL}/api/events`, { withCredentials: true }),
          axios.get(`${BackendURL}/api/event-registrations/my`, {
            withCredentials: true,
          }),
        ])

        const events = eventsRes.data

        const regsData = Array.isArray(regsRes.data) ? regsRes.data : []
        // shape: [{ _id, event_id: { _id: "..." }, user_id, ... }]
        const registeredEventIds = new Set<string>(
          regsData
            .map((r) => r?.event_id?._id)
            .filter((id) => typeof id === "string")
        )

        interface EventWithFlags extends Event {
          isRegistered: boolean
        }

        const eventsWithFlags: EventWithFlags[] = (events as Event[]).map((e): EventWithFlags => {
          const eid = (typeof e._id === "string" ? e._id : "") || e.id || ""
          return {
            ...e,
            _id: eid,
            id: eid,
            isRegistered: registeredEventIds.has(eid),
          }
        })

        // you can choose a smarter split; for now reuse same list
        setRecommendedEventsList(eventsWithFlags)
        setUpcomingEventsList(eventsWithFlags)
      } catch (error) {
        console.error("User is not authenticated!", error)
        window.location.href = "/login"
      }
    }

    fetchEventsWithFlags()
  }, [])

  useEffect(() => {
    setStats([
      {
        title: "Events Attended",
        value: eventAttended,
        change: "+3 this month --- remaining",
        changeType: "positive",
        icon: Calendar,
      },
      {
        title: "Total Points",
        value: points,
        change: `${Number(points) >= 100 ? "Great job!" : "Keep going!"}`,
        changeType: "positive",
        icon: Star,
      },
      {
        title: "Badges Earned",
        value: badges,
        change: ``,
        changeType: "neutral",
        icon: Award,
      },
      {
        title: "Leaderboard Rank",
        value: rank,
        change: `${rank === "Unranked" || !rank
          ? "Participate more to get ranked!"
          : "Go higher!"
          }`,
        changeType:
          rank === "Unranked" || !rank ? "negative" : "positive",
        icon: Trophy,
      },
    ])
  }, [eventAttended, points, badges, rank])


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {username}</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening on campus today.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/attendance">
            <Button variant="outline" className="group">
              Scan QR to Mark Attendance
              <ScanLine className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link href="/dashboard/events">
            <Button className="group">
              Explore Events
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recommended For You</h2>
            <Link href="/dashboard/events" className="text-primary text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendedEventsList.slice(0, 2).map((event) => {
              const key = event._id || event.id || "unknown"
              return (
                <Link href="/dashboard/events" key={key}>
                  <EventCard
                    {...{
                      ...event,
                      _id: key,
                      id: key,
                    }}
                  />
                </Link>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <div className="glass rounded-2xl p-4 space-y-3">
            {upcomingEventsList.map((event) => {
              const startDateStr =
                event.start_date
                  ? typeof event.start_date === "string"
                    ? new Date(event.start_date).toLocaleDateString()
                    : event.start_date.toLocaleDateString()
                  : ""

              const key = event._id || event.id || `${event.title}-${event.start_date}`

              return (
                <div
                  key={key}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                    <Image
                      src={event.bannerURL || "/placeholder.svg"}
                      alt={event.title}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full rounded-xl"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {startDateStr}
                    </p>
                  </div>
                </div>
              )
            })}

            <Link href="/dashboard/my-events">
              <Button variant="ghost" className="w-full mt-2">
                View My Schedule
              </Button>
            </Link>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/dashboard/events">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  Browse Events
                </Button>
              </Link>
              <Link href="/dashboard/leaderboard">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Trophy className="mr-2 h-4 w-4" />
                  View Leaderboard
                </Button>
              </Link>

              { <Link href="/dashboard/my-events">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Award className="mr-2 h-4 w-4" />
                  My Certificates
                </Button>
              </Link> }
              
              </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
   
    

*/