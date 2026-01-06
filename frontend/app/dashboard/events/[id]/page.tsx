"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Share2,
  Heart,
  MessageCircle,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import axios from "axios"
import { CommentItem } from "@/components/event/CommentItem"
import { ApiComment } from "@/types/apiComment"
import { CommentWithReplies } from "@/types/commentWithReplies"

const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000"

export default function EventDetailPage() {
  const params = useParams<{ id: string }>()
  const eventId = params.id

  // replace static discussions array with state
  const [comments, setComments] = useState<CommentWithReplies[]>([])  
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)
  // track which comment you're replying to (optional)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const [eventData, setEventData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isRegistered, setIsRegistered] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isRegLoading, setIsRegLoading] = useState(false)

  useEffect(() => {
    if (!eventId) return

    setLoading(true)
    setError(null)

    axios
      .get(`${BackendURL}/api/events/${eventId}`, { withCredentials: true })
      .then((res) => {
        setEventData(res.data)
      })
      .catch((err) => {
        console.error("Failed to fetch event", err)
        setError("Failed to load event.")
      })
      .finally(() => setLoading(false))

    axios
      .get(`${BackendURL}/api/event-registrations/my`, { withCredentials: true })
      .then((res) => {
        console.log("My registrations:", res.data)

        const data = Array.isArray(res.data) ? res.data : []

        const found = data.some(
          (r: any) =>
            r &&
            r.event_id &&
            typeof r.event_id._id === "string" &&
            r.event_id._id === eventId
        )

        setIsRegistered(found)
      })
      .catch((err) => {
        console.error("Failed to fetch registrations", err)
      })

      const fetchComments = async () => {
        try {
          setCommentLoading(true)
          setCommentError(null)
      
          const res = await axios.get<ApiComment[]>(
            `${BackendURL}/api/event-comments/${eventId}`,
            { withCredentials: true },
          )
      
          const raw = res.data || []
      
          // normalize each comment
          const flat: CommentWithReplies[] = raw.map((c) => ({
            _id: c._id,
            user: {
              name: c.user_id?.name ?? "Unknown User",
              avatar: c.user_id?.profileIMG,
            },
            content: c.content,
            createdAt: c.createdAt,
            likesCount: c.likes?.length ?? 0,
            parent_comment_id: c.parent_comment_id ?? null,
            replies: [],
          }))
      
          const map = new Map<string, CommentWithReplies>()
          flat.forEach((c) => {
            map.set(c._id, c)
          })
      
          const roots: CommentWithReplies[] = []
          flat.forEach((c) => {
            if (c.parent_comment_id && map.has(c.parent_comment_id)) {
              map.get(c.parent_comment_id)!.replies.push(c)
            } else {
              roots.push(c)
            }
          })
      
          setComments(roots)
        } catch (err) {
          console.error("Failed to fetch comments", err)
          setCommentError("Failed to load discussion.")
        } finally {
          setCommentLoading(false)
        }
      }
      
    fetchComments()
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
        <Link href="/dashboard/events">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
    )
  }

  // map backend fields to UI fields
  const mapped = {
    id: eventData._id,
    title: eventData.title,
    description: eventData.description || "",
    image: eventData.bannerURL || "/placeholder.svg",
    date: eventData.start_date ? new Date(eventData.start_date).toLocaleDateString() : "",
    time: `${eventData.start_time || ""} - ${eventData.end_time || ""}`,
    location: eventData.venue || "",
    category: eventData.category || "Seminar",
    club: eventData.clubName || "Club",
    clubLogo: eventData.clubLogo || "/placeholder.svg",
    attendees: eventData.registeredCount ?? 0,
    maxAttendees: eventData.max_capacity ?? 0,
    price: eventData.price ?? 0,
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

  async function onClickRegisterHandler(currentlyRegistered: boolean) {
    if (!eventId) return
    try {
      setIsRegLoading(true)

      if (currentlyRegistered) {
        // cancel registration
        await axios.delete(`${BackendURL}/api/event-registrations/${eventId}`, {
          withCredentials: true,
        })
        setIsRegistered(false)
        console.log("Unregistered from event")
      } else {
        // register
        await axios.post(
          `${BackendURL}/api/event-registrations/${eventId}`,
          {},
          { withCredentials: true }
        )
        setIsRegistered(true)
        console.log("Registered for event")
      }
    } catch (err: any) {
      const status = err?.response?.status
      if (!currentlyRegistered && status === 409) {
        // backend says “already registered” → reflect that in UI
        console.warn("Already registered, updating UI state")
        setIsRegistered(true)
        return
      }

      console.error("Registration error", err)
    } finally {
      setIsRegLoading(false)
    }
  }


  const handleAddComment = async () => {
    if (!eventId || !newComment.trim()) return
    try {
      const body: any = { content: newComment.trim() }
      if (replyTo) body.parent_comment_id = replyTo
  
      const res = await axios.post(
        `${BackendURL}/api/event-comments/${eventId}`,
        body,
        { withCredentials: true },
      )
  
      // controller returns { message, comment }
      const created: ApiComment = res.data.comment
  
      const normalized: CommentWithReplies = {
        _id: created._id,
        user: {
          name: (created as any).user_id?.name ?? "You",
          avatar: (created as any).user_id?.profileIMG,
        },
        content: created.content,
        createdAt: created.createdAt,
        likesCount: created.likes?.length ?? 0,
        parent_comment_id: created.parent_comment_id ?? null,
        replies: [],
      }
  
      setNewComment("")
      setReplyTo(null)
  
      setComments((prev) => {
        if (normalized.parent_comment_id) {
          const parentId = normalized.parent_comment_id
          const attach = (list: CommentWithReplies[]): CommentWithReplies[] =>
            list.map((c) =>
              c._id === parentId
                ? { ...c, replies: [...c.replies, normalized] }
                : { ...c, replies: attach(c.replies) },
            )
          return attach(prev)
        }
        return [...prev, normalized]
      })
    } catch (err) {
      console.error("Failed to add comment", err)
    }
  }
  
  const handleToggleLike = async (commentId: string) => {
    if (!eventId) return
    try {
      const res = await axios.post(
        `${BackendURL}/api/event-comments/${commentId}/like`,
        {},
        { withCredentials: true },
      )
  
      const likeCount = res.data.likeCount as number
  
      const updateNode = (list: CommentWithReplies[]): CommentWithReplies[] =>
        list.map((c) => ({
          ...c,
          likesCount: c._id === commentId ? likeCount : c.likesCount,
          replies: updateNode(c.replies),
        }))
  
      setComments((prev) => updateNode(prev))
    } catch (err) {
      console.error("Failed to toggle like", err)
    }
  }
  

  const handleDeleteComment = async (commentId: string) => {
    if (!eventId) return
    try {
      await axios.delete(
        `${BackendURL}/api/event-comments/${commentId}`,
        { withCredentials: true },
      )
      const removeNode = (list: CommentWithReplies[]): CommentWithReplies[] =>
        list
          .filter((c) => c._id !== commentId)
          .map((c) => ({ ...c, replies: removeNode(c.replies) }))
      setComments((prev) => removeNode(prev))
    } catch (err) {
      console.error("Failed to delete comment", err)
    }
  }


  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/events">
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{mapped.title}</h1>
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
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Description */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {mapped.description.split("\n").map((line: string, i: number) => (
                    <p key={i} className="text-muted-foreground">
                      {line.startsWith("**") ? (
                        <strong className="text-foreground">
                          {line.replace(/\*\*/g, "")}
                        </strong>
                      ) : line.startsWith("-") ? (
                        <span className="block ml-4">{line}</span>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Event Schedule</h2>
                <div className="space-y-4">
                  {mapped.schedule.map((item: any, index: number) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-20 shrink-0">
                        <span className="text-sm font-medium text-primary">{item.time}</span>
                      </div>
                      <div className="flex-1 pb-4 border-b border-border last:border-0 last:pb-0">
                        <span>{item.activity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organizer */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Organizer</h2>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={mapped.organizer.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {mapped.organizer.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{mapped.organizer.name}</p>
                    <p className="text-sm text-muted-foreground">{mapped.organizer.role}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="discussion" className="space-y-6 mt-6">
              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Discussion</h2>

                {/* Comment Input */}
                <div className="flex gap-3 mb-6">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/current-user.jpg" />
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder={
                        replyTo
                          ? "Reply to comment..."
                          : "Ask a question or share your thoughts..."
                      }
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button size="icon" onClick={handleAddComment}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {commentError && (
                  <p className="text-sm text-destructive mb-2">{commentError}</p>
                )}
                {commentLoading && (
                  <p className="text-sm text-muted-foreground">Loading comments...</p>
                )}

                {/* Comments */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      onReply={(id) => setReplyTo(id)}
                      onLike={handleToggleLike}
                      onDelete={handleDeleteComment}
                    />
                  ))}
                  {!commentLoading && comments.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No comments yet. Be the first to start the discussion!
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <div className="glass rounded-2xl p-6 sticky top-24">
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{mapped.date}</p>
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

            <Button
              className={cn(
                "w-full h-12 text-lg",
                isRegistered &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
              disabled={isRegLoading}
              onClick={() => onClickRegisterHandler(isRegistered)}
            >
              {isRegistered ? "Cancel Registration" : "Register Now"}
            </Button>

            <div className="flex items-center justify-center gap-4 mt-4">
              {/* <Button
                variant="ghost"
                size="sm"
                className={cn(isLiked && "text-destructive")}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current")} />
                Save
              </Button> */}
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
