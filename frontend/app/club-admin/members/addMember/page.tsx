"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, Mail, Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL!

export default function AddMemberPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"member" | "president" | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!role) {
      setError("Please select a role.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/clubs/addMember`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // send club-admin auth cookie
        body: JSON.stringify({ name, email, role }),
      })

      if (!res.ok) {
        const text = await res.text()
        let message = "Failed to add member."
        if (text && text.trim().startsWith("{")) {
          try {
            const data = JSON.parse(text)
            if (data?.message) message = data.message
          } catch {
            // ignore parse error
          }
        }
        throw new Error(message)
      }

      setSuccess("Member added successfully.")
      // optional: redirect back to members list after a short delay
      setTimeout(() => {
        router.push("/club-admin/members")
      }, 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <UserPlus className="h-7 w-7" />
          Add Member
        </h1>
        <p className="text-muted-foreground">
          Add a new member to your club by filling in the details below.
        </p>
      </div>

      <div className="glass rounded-2xl p-6 border border-border/50">
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Rahul Sharma"
                className="pl-9 h-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="member@college.edu"
                className="pl-9 h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Select
                value={role}
                onValueChange={(value: "member" | "president") => setRole(value)}
              >
                <SelectTrigger id="role" className="pl-9 h-11">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="president">President</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 text-base flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Adding member...
                </>
              ) : (
                <>
                  Add Member
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
