"use client"

import { useEffect, useState } from "react"
import { Users, Search, Mail, Shield, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"


const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL!

type Member = {
  _id: string
  name: string
  email: string
  role: string
  joinedDate?: string
  avatar?: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(false)

      try {
        const res = await fetch(
          `${BACKEND_API_URL}/api/clubs/members`,
          {
            method: "GET",
            credentials: "include", // send admin auth cookie
          }
        )

        if (!res.ok) {
          const text = await res.text()
          let message = "Failed to load members."
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

        const data: Member[] = await res.json()
        setMembers(data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load members."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase()
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    )
  })


  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      const res = await fetch(`${BACKEND_API_URL}/api/clubs/delMember/${memberId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) {
        const text = await res.text()
        let message = "Failed to delete member."
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

      // Optimistically update UI
      setMembers((prev) => prev.filter((m) => m._id !== memberId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete member.")
    }
  }


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Club Members</h1>
          <p className="text-muted-foreground">Manage club members and roles</p>
        </div>

        <Link href="/club-admin/members/addMember">
          <Button>
            Add Member
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="glass bg-card/70 rounded-xl p-6 border border-border/50 overflow-x-auto">
        {loading ? (
          <p className="text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Loading members...
          </p>
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : filteredMembers.length === 0 ? (
          <p className="text-muted-foreground text-sm">No members found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-3 px-4 font-semibold">Member</th>
                <th className="text-left py-3 px-4 font-semibold">Email</th>
                <th className="text-left py-3 px-4 font-semibold">Role</th>
                <th className="text-left py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member._id}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name?.[0] || "M"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {member.email}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant={
                        member.role === "President" ||
                          member.role === "Vice President"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {member.role}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => handleDeleteMember(member._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
