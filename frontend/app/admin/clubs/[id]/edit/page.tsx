"use client"

import * as React from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"

const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL

type ClubForm = {
  name: string
  description: string
  image: string
  category: string
  founded: string
}

export default function EditClubPage(props: { params: Promise<{ id: string }> }) {
  // unwrap dynamic params (Next 15)
  const { id } = React.use(props.params) // clubId
  const router = useRouter()

  const [form, setForm] = React.useState<ClubForm>({
    name: "",
    description: "",
    image: "",
    category: "",
    founded: "",
  })
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Load existing club
  React.useEffect(() => {
    if (!BackendURL || !id) return

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const res = await axios.get(
          `${BackendURL}/api/admin/clubs/${id}`,
          { withCredentials: true },
        )

        if (cancelled) return
        const data = res.data

        setForm({
          name: data.name ?? "",
          description: data.description ?? "",
          image: data.image ?? "",
          category: data.category ?? "",
          founded: data.founded ?? "",
        })
      } catch (err: any) {
        if (!cancelled) {
          setError("Failed to load club details")
          console.error("Error loading club:", err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [id])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!BackendURL || !id) return

    setSaving(true)
    setError(null)

    try {
      // you can use PUT or PATCH depending on your route
      const res = await axios.put(
        `${BackendURL}/api/admin/${id}`,
        form,
        { withCredentials: true },
      )
      console.log("Club updated:", res.data)

      // go back to detail page
      router.push(`/admin/clubs/${id}`)
    } catch (err: any) {
      console.error("Error updating club:", err)
      setError("Failed to update club")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Link href={`/admin/clubs/${id}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <p className="text-muted-foreground">Loading club...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/admin/clubs/${id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Club</h1>
            <p className="text-muted-foreground">
              Update details for this club.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass bg-card/70 rounded-xl border border-border/50 p-6 space-y-6"
      >
        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="founded">Founded</Label>
            <Input
              id="founded"
              name="founded"
              value={form.founded}
              onChange={handleChange}
              placeholder="e.g. 2019"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Banner Image URL</Label>
            <Input
              id="image"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Link href={`/admin/clubs/${id}`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
