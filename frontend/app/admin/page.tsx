"use client"

import { BarChart3, Users, Calendar, DollarSign, TrendingUp, AlertCircle, LucideIcon } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, use } from "react"
import Link from "next/link"
import axios from "axios"
const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL;


const pendingApproval = [
  { id: 1, type: "Event", name: "Inter-College Hackathon", club: "Tech Club", date: "Dec 20" },
  { id: 2, type: "Event", name: "Cultural Night", club: "Cultural Committee", date: "Dec 25" },
  { id: 3, type: "Club", name: "Robotics Club", requestedBy: "Prof. Smith", date: "Dec 10" },
]

const recentActivit = [
  { id: 1, action: "New event created", by: "Tech Club", time: "2 hours ago" },
  { id: 2, action: "Club registration", by: "Photography Club", time: "4 hours ago" },
  { id: 3, action: "Report submitted", by: "Finance Dept", time: "1 day ago" },
]

export default function AdminDashboard() {

  const [stats, setStats] = useState<Array<{
    title: string;
    value: string | number;
    change: string;
    changeType: "positive" | "neutral" | "negative";
    icon: LucideIcon;
  }>>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Array<{
    id: number;
    type: string;
    name: string;
    club?: string;
    requestedBy?: string;
    date: string;
  }>>([]);
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: number;
    action: string;
    by: string;
    time: string;
  }>>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeClubs, setActiveClubs] = useState(0);
  const [eventsThisMonth, setEventsThisMonth] = useState(0);
  // const [totalBudget, setTotalBudget] = useState(0);


  useEffect(() => {
    // Fetch dashboard data from API or database
    axios.get(`${BackendURL}/api/admin/users`, { withCredentials: true })
      .then(response => {
        const data = response.data;
        console.log("Total Students data:", data.count);
        setTotalStudents(data.count);
      })
      .catch(error => {
        console.error("Error fetching Total Students:", error);
      });

    axios.get(`${BackendURL}/api/admin/`, { withCredentials: true })
      .then(response => {
        const data = response.data;
        console.log("active clubs:", data.count);
        setActiveClubs(data.count);
      })
      .catch(error => {
        console.error("Error fetching Active Clubs:", error);
      });

    axios.get(`${BackendURL}/api/admin/events/current-month/count`, { withCredentials: true })
      .then(response => {
        const data = response.data;
        console.log("Events This Month data:", data.count);
        setEventsThisMonth(data.count);
      })
      .catch(error => {
        console.error("Error fetching Active Clubs:", error);
      });


    setStats([{
      title: "Total Students",
      value: totalStudents,
      change: "+245 this semester",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Active Clubs",
      value: activeClubs,
      change: `${pendingApprovals.length} pending approval`,
      changeType: "neutral" as const,
      icon: BarChart3,
    },
    {
      title: "Events This Month",
      value: eventsThisMonth,
      change: "+15 vs last month",
      changeType: "positive" as const,
      icon: Calendar,
    },
    {
      title: "Total Budget",
      value: "rs 125K",
      change: "rs 18K remaining",
      changeType: "neutral" as const,
      icon: DollarSign,
    }])

  }, [totalStudents, activeClubs, eventsThisMonth]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">College-wide event management overview</p>
        </div>
        <Link href="/admin/approvals">
          <Button className="bg-primary hover:bg-primary/90">
            <AlertCircle className="mr-2 h-4 w-4" />
            View Approvals ({pendingApprovals.length})
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 glass bg-card/70 rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Pending Approvals</h2>
            <Link href="/admin/approvals">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {pendingApprovals.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border/30 hover:border-border/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Badge variant={item.type === "Event" ? "default" : "secondary"}>{item.type}</Badge>
                    <h3 className="font-semibold">{item.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.type === "Event" ? `Club: ${item.club}` : `Requested by: ${item.requestedBy}`}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-2">{item.date}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8">
                      Reject
                    </Button>
                    <Button size="sm" className="h-8">
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass bg-card/70 rounded-xl p-6 border border-border/50">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="pb-4 border-b border-border/30 last:border-0">
                <p className="font-medium text-sm">{item.action}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.by}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass bg-card/70 rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/admin/clubs">
            <Button variant="outline" className="w-full h-12">
              <Users className="mr-2 h-4 w-4" />
              Manage Clubs
            </Button>
          </Link>
          <Link href="/admin/events">
            <Button variant="outline" className="w-full h-12">
              <Calendar className="mr-2 h-4 w-4" />
              All Events
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="outline" className="w-full h-12">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant="outline" className="w-full h-12">
              <TrendingUp className="mr-2 h-4 w-4" />
              Reports
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
