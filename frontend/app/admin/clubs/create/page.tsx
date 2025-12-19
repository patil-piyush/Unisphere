"use client"

import { useState, FormEvent, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export default function CreateClubPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    password: "",
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setLogoFile(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!BackendURL) {
      setError("Client is misconfigured. BACKEND_API_URL is missing.")
      return
    }

    if (!logoFile) {
      setError("Please select a logo image.")
      return
    }

    setIsLoading(true)
    try {
      const data = new FormData()
      data.append("name", formData.name)
      data.append("description", formData.description)
      data.append("email", formData.email)
      data.append("password", formData.password)
      data.append("logo", logoFile) // field name must match backend expectation[web:193][web:195]

      const res = await axios.post(
        `${BackendURL}/api/clubs/register`,
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )

      const created = res.data
      if (created?.club?._id) {
        router.push(`/admin/clubs/${created.club._id}`)
      } else {
        router.push("/admin/clubs")
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to create club. Please try again."
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create Club</h1>
      <p className="text-muted-foreground">
        Register a new club in the system.
      </p>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e => updateField("name", e.target.value)}
            placeholder="Tech Club"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={e => updateField("description", e.target.value)}
            placeholder="A club focused on technology, coding, and innovation."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Club Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={e => updateField("email", e.target.value)}
            placeholder="club@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={e => updateField("password", e.target.value)}
            placeholder="******"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo">Logo Image</Label>
          <Input
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Club"}
        </Button>
      </form>
    </div>
  )
}
