"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import axios from "axios"
import { set } from "date-fns"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL!

function extractLatLngFromMapsUrl(url: string): { lat: number; lng: number } | null {
  try {
    const u = new URL(url)

    const atMatch = u.pathname.match(/@(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/)
    if (atMatch) {
      const lat = parseFloat(atMatch[1])
      const lng = parseFloat(atMatch[3])
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng }
    }

    const qParam = u.searchParams.get("q")
    if (qParam) {
      const coordMatch = qParam.match(/(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/)
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1])
        const lng = parseFloat(coordMatch[3])
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng }
      }
    }

    return null
  } catch {
    return null
  }
}

export default function CreateEventPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clubName: "",
    venue: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    max_capacity: "",
    googleMapsUrl: "",
    price: 0,
    category: "Seminar", // matches schema default
  })
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [clubName, setClubName] = useState<string | null>(null)

  useEffect(() => {
    axios
      .get(`${BACKEND_API_URL}/api/clubs/`, { withCredentials: true })
      .then((res) => {
        const cName = res.data.name
        setClubName(cName)
        setFormData((prev) => ({ ...prev, clubName: cName }))
      })
      .catch((err) => {
        console.error("Failed to fetch club name", err)
      })
  }, [])


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }




  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setBannerFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)


    if (!formData.title || !formData.description || !formData.venue) {
      setError("Please fill in title, description, and venue.")
      return
    }
    if (!formData.start_date || !formData.start_time) {
      setError("Please provide event start date and time.")
      return
    }
    if (!formData.end_date || !formData.end_time) {
      setError("Please provide event end date and time.")
      return
    }
    if (!formData.max_capacity) {
      setError("Please provide max capacity.")
      return
    }

    const maxCapacityNumber = Number(formData.max_capacity)
    if (Number.isNaN(maxCapacityNumber) || maxCapacityNumber <= 0) {
      setError("Max capacity must be a positive number.")
      return
    }

    let coords = extractLatLngFromMapsUrl(formData.googleMapsUrl)
    if (!coords) {
      coords = { lat: 0, lng: 0 } // default to (0,0) if extraction fails
    }

    setIsLoading(true)
    try {
      const fd = new FormData()
      fd.append("title", formData.title)
      fd.append("description", formData.description)
      fd.append("clubName", formData.clubName)
      fd.append("venue", formData.venue)
      fd.append("start_date", formData.start_date)
      fd.append("start_time", formData.start_time)
      fd.append("end_date", formData.end_date)
      fd.append("end_time", formData.end_time)
      fd.append("max_capacity", String(maxCapacityNumber))
      fd.append("category", formData.category)
      fd.append("price", String(formData.price))
      fd.append("location_type", "Point")
      fd.append("location_lat", String(coords.lat))
      fd.append("location_lng", String(coords.lng))

      if (bannerFile) {
        fd.append("banner", bannerFile)
      }

      const res = await fetch(`${BACKEND_API_URL}/api/events/`, {
        method: "POST",
        credentials: "include",
        body: fd,
      })

      if (!res.ok) {
        const text = await res.text()
        let message = "Failed to create event."
        if (text && text.trim().startsWith("{")) {
          try {
            const data = JSON.parse(text)
            if (data?.message) message = data.message
          } catch {
            // ignore
          }
        }
        throw new Error(message)
      }

      setSuccess("Event created successfully.")
      setTimeout(() => router.push("/club-admin/events"), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <Link href="/club-admin/events" className="mb-4 inline-block">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <div className="glass bg-card/70 rounded-xl p-8 border border-border/50">
        <h1 className="text-3xl font-bold mb-6">Create New Event</h1>

        {error && (
          <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-sm text-emerald-600 bg-emerald-500/10 border border-emerald-500/40 rounded-md px-3 py-2">
            {success}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Web Development Workshop"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your event..."
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Banner file */}
          <div className="space-y-2">
            <Label htmlFor="banner">Banner Image</Label>
            <Input
              id="banner"
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="Seminar">Seminar</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Competition">Competition</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Venue */}
          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              name="venue"
              placeholder="Main Auditorium"
              value={formData.venue}
              onChange={handleChange}
              required
            />
          </div>

          {/* Dates and times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Max capacity */}
          <div className="space-y-2">
            <Label htmlFor="max_capacity">Max Capacity</Label>
            <Input
              id="max_capacity"
              name="max_capacity"
              type="number"
              placeholder="e.g., 100"
              value={formData.max_capacity}
              onChange={handleChange}
              required
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="max_capacity">Fees</Label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="e.g., 100"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          {/* Google Maps URL */}
          <div className="space-y-2">
            <Label htmlFor="googleMapsUrl">Location (Google Maps URL)</Label>
            <Input
              id="googleMapsUrl"
              name="googleMapsUrl"
              placeholder="Paste Google Maps link to the venue"
              value={formData.googleMapsUrl}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-muted-foreground">
              Paste a Google Maps URL; coordinates will be extracted automatically.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Link href="/club-admin/events" className="flex-1">
              <Button variant="outline" className="w-full" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              className="flex-1 bg-accent hover:bg-accent/90"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
function customUseEffect(arg0: () => void, arg1: never[]) {
  throw new Error("Function not implemented.")
}

