"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Calendar, Clock, MapPin, Users, ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import axios from "axios"

const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000"

const discussions = [
  {
    id: 1,
    user: { name: "Priya Patel", avatar: "/diverse-female-student.png" },
    message: "Is laptop mandatory for the hackathon?",
    time: "2 hours ago",
    likes: 5,
  },
  {
    id: 2,
    user: { name: "Amit Kumar", avatar: "/male-student-studying.png" },
    message: "Yes, you'll need a laptop. They'll provide power outlets and WiFi.",
    time: "1 hour ago",
    likes: 3,
    isReply: true,
  },
  {
    id: 3,
    user: { name: "Sarah Lee", avatar: "/asian-female-student.jpg" },
    message: "Can we form teams on the spot or do we need to register as a team?",
    time: "45 mins ago",
    likes: 2,
  },
]

const participants = [
  { name: "John Doe", department: "Computer Science", avatar: "/student-studying.png" },
  { name: "Jane Smith", department: "Electronics", avatar: "/diverse-student-studying.png" },
  { name: "Mike Johnson", department: "Mechanical", avatar: "/diverse-students-studying.png" },
  { name: "Emily Brown", department: "Computer Science", avatar: "/diverse-student-group.png" },
  { name: "David Wilson", department: "IT", avatar: "/diverse-student-group.png" },
]

export default function EventDetailPage() {
  const params = useParams<{ id: string }>()
  const eventId = params.id

  const [eventData, setEventData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isRegistered, setIsRegistered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isRegLoading, setIsRegLoading] = useState(false)

  // editable form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    max_capacity: "",
    category: "Seminar",
    price: "",
    isClosed: false,
  })

  useEffect(() => {
    if (!eventId) return

    setLoading(true)
    setError(null)

    axios
      .get(`${BackendURL}/api/events/${eventId}`, { withCredentials: true })
      .then((res) => {
        const e = res.data
        setEventData(e)

        // map backend Date -> yyyy-mm-dd string for inputs
        const startDateStr = e.start_date ? new Date(e.start_date).toISOString().slice(0, 10) : ""
        const endDateStr = e.end_date ? new Date(e.end_date).toISOString().slice(0, 10) : ""

        setForm({
          title: e.title || "",
          description: e.description || "",
          venue: e.venue || "",
          start_date: startDateStr,
          start_time: e.start_time || "",
          end_date: endDateStr,
          end_time: e.end_time || "",
          max_capacity: e.max_capacity?.toString() || "",
          category: e.category || "Seminar",
          price: e.price?.toString() || "",
          isClosed: !!e.isClosed,
        })
      })
      .catch((err) => {
        console.error("Failed to fetch event", err)
        setError("Failed to load event.")
      })
      .finally(() => setLoading(false))
  }, [eventId])

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading event...</p>
      </div>
    )
  }

  if (error || !eventData) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-destructive">{error || "Event not found."}</p>
        <Link href="/club-admin/events">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
    )
  }

  const mapped = {
    id: eventData._id,
    title: form.title,
    description: form.description,
    image: eventData.bannerURL || "/placeholder.svg",
    date: form.start_date
      ? new Date(form.start_date).toLocaleDateString()
      : eventData.start_date
      ? new Date(eventData.start_date).toLocaleDateString()
      : "",
    time: `${form.start_time || eventData.start_time || ""} - ${
      form.end_time || eventData.end_time || ""
    }`,
    location: form.venue || eventData.venue || "",
    category: form.category || "Seminar",
    club: eventData.clubName || "Club",
    clubLogo: eventData.clubLogo || "/placeholder.svg",
    attendees: eventData.registeredCount ?? 0,
    maxAttendees: Number(form.max_capacity || eventData.max_capacity || 0),
    price: Number(form.price || eventData.price || 0),
    organizer: {
      name: eventData.organizerName || "Organizer",
      role: eventData.organizerRole || "Event Organizer",
      avatar: eventData.organizerAvatar || "/placeholder.svg",
    },
    schedule:
      eventData.schedule && eventData.schedule.length > 0
        ? eventData.schedule
        : [
            { time: eventData.start_time || "Start", activity: "Event starts" },
            { time: eventData.end_time || "End", activity: "Event ends" },
          ],
  }

  const spotsLeft = mapped.maxAttendees - mapped.attendees

  // async function onClickRegisterHandler(currentlyRegistered: boolean) {
  //   if (!eventId) return
  //   try {
  //     setIsRegLoading(true)

  //     if (currentlyRegistered) {
  //       await axios.delete(`${BackendURL}/api/event-registrations/${eventId}`, {
  //         withCredentials: true,
  //       })
  //       setIsRegistered(false)
  //     } else {
  //       await axios.post(
  //         `${BackendURL}/api/event-registrations/${eventId}`,
  //         {},
  //         { withCredentials: true }
  //       )
  //       setIsRegistered(true)
  //     }
  //   } catch (err) {
  //     console.error("Registration error", err)
  //   } finally {
  //     setIsRegLoading(false)
  //   }
  // }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  async function handleUpdateEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!eventId) return

    try {
      // build payload matching schema
      const payload: any = {
        title: form.title,
        description: form.description,
        venue: form.venue,
        category: form.category,
        start_time: form.start_time,
        end_time: form.end_time,
        max_capacity: Number(form.max_capacity),
        price: Number(form.price) || 0,
        isClosed: form.isClosed,
      }

      if (form.start_date) {
        payload.start_date = new Date(form.start_date)
      }
      if (form.end_date) {
        payload.end_date = new Date(form.end_date)
      }

      // do not touch location_coordinates here unless you add inputs for it

      const res = await axios.put(
        `${BackendURL}/api/events/${eventId}`,
        payload,
        { withCredentials: true }
      )

      setEventData(res.data.event)
      alert("Event updated successfully")
    } catch (err) {
      console.error("Update event error", err)
      alert("Failed to update event")
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/club-admin/events">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      {/* Hero Section */}
      <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden">
        <Image src={mapped.image} alt={mapped.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge>{mapped.category}</Badge>
            {mapped.price === 0 ? (
              <Badge variant="secondary">Free</Badge>
            ) : (
              <Badge className="bg-accent text-accent-foreground">₹{mapped.price}</Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {mapped.title}
          </h1>
          <div className="flex items-center gap-3 text-white/80">
            <Image
              src={mapped.clubLogo || "/placeholder.svg"}
              alt={mapped.club}
              width={24}
              height={24}
              className="rounded-md"
            />
            <span>{mapped.club}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdateEvent}>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Editable fields */}
                <div className="glass rounded-2xl p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Basic Info</h2>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      name="description"
                      rows={5}
                      value={form.description}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Venue</label>
                    <Input
                      name="venue"
                      value={form.venue}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <Input
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Time</label>
                      <Input
                        type="time"
                        name="start_time"
                        value={form.start_time}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <Input
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Time</label>
                      <Input
                        type="time"
                        name="end_time"
                        value={form.end_time}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Capacity</label>
                      <Input
                        type="number"
                        name="max_capacity"
                        value={form.max_capacity}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fees (Price)</label>
                      <Input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2 flex items-end gap-2">
                      <label className="text-sm font-medium">Closed</label>
                      <input
                        type="checkbox"
                        name="isClosed"
                        checked={form.isClosed}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Existing read-only description rendering kept if desired */}
                {/* ... you can remove the prose block if not needed ... */}
              </TabsContent>

              <TabsContent value="discussion" className="space-y-6 mt-6">
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Discussion</h2>
                  <div className="flex gap-3 mb-6">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/current-user.jpg" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Ask a question or share your thoughts..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {discussions.map((comment) => (
                      <div
                        key={comment.id}
                        className={cn("flex gap-3", comment.isReply && "ml-12")}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {comment.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {comment.user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {comment.time}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {comment.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="participants" className="space-y-6 mt-6">
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Participants</h2>
                    <Badge variant="secondary">{mapped.attendees} registered</Badge>
                  </div>
                  <div className="space-y-3">
                    {participants.map((participant, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                      >
                        <Avatar>
                          <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {participant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {participant.department}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    View All Participants
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex gap-3">
              <Button type="submit" className="bg-accent hover:bg-accent/90">
                Save Changes
              </Button>
              <Link href="/club-admin/events">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 sticky top-24">
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  {new Date(mapped.date).toLocaleDateString("en-GB")}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{mapped.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{mapped.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Spots Left</p>
                  <p
                    className={cn(
                      "font-medium",
                      spotsLeft <= 10 ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {spotsLeft} / {mapped.maxAttendees}
                  </p>
                </div>
              </div>
            </div>

            {/* <Button
              className="w-full h-12 text-lg"
              disabled={isRegLoading}
              onClick={() => onClickRegisterHandler(isRegistered)}
            >
              {isRegistered ? "Cancel Registration" : "Register Now"}
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  )
}
