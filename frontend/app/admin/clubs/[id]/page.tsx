"use client"

import { Users, Calendar, MessageSquare, Settings, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useEffect, useState } from "react"
import axios from "axios"



export default function ClubDetailPage({ params }: { params: { id: string } }) {


  const [clubDetail, setClubDetail] = useState<{
    id: string;
    name: string;
    description: string;
    image: string | "/placeholder.svg?height=400&width=600";
    members: number;
    events: number;
    category: string;
    founded: string;
    president: { name: string; avatar: string | "/placeholder.svg?height=40&width=40" };
  } | null>(null);
  
  const [recentMembers, setRecentMembers] = useState<Array<{
    id: string;
    name: string;
    role: string;
    joinedDate: Date;
  }>>([]);


  useEffect(() => {
    // Fetch club details from API
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/${params.id}`, { withCredentials: true })
      .then(response => {
        setClubDetail(response.data);
      })
      .catch(error => {
        console.error("Error fetching club details:", error);
      });
  }, [params.id]);

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link href="/admin/clubs">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clubs
        </Button>
      </Link>

      {/* Club Header */}
      <div className="glass bg-card/70 rounded-xl overflow-hidden border border-border/50">
        <div className="h-64 bg-linear-to-r from-primary to-accent" />
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{clubDetail?.name}</h1>
              <p className="text-muted-foreground">{clubDetail?.description}</p>
            </div>
            <Badge>{clubDetail?.category}</Badge>
          </div>

          {/* Club Stats */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Members</p>
              <p className="text-2xl font-bold">{clubDetail?.members}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Events</p>
              <p className="text-2xl font-bold">{clubDetail?.events}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Founded</p>
              <p className="text-2xl font-bold">{clubDetail?.founded}</p>
            </div>
          </div>

          {/* President */}
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={clubDetail?.president.avatar} />
              <AvatarFallback>RS</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{clubDetail?.president.name}</p>
              <p className="text-sm text-muted-foreground">Club President</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button className="bg-primary hover:bg-primary/90">
          <MessageSquare className="mr-2 h-4 w-4" />
          Send Message
        </Button>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Edit Club
        </Button>
      </div>

      {/* Recent Members */}
      <div className="glass bg-card/70 rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-bold mb-6">Recent Members</h2>
        <div className="space-y-3">
          {recentMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-border/30">
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
              <p className="text-xs text-muted-foreground">{member.joinedDate.toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
