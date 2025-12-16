"use client"

import { useState, useEffect } from "react"
import { Search, Grid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EventCard } from "@/components/dashboard/event-card"
import { cn } from "@/lib/utils"
const BackendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
import axios from "axios";


const categories = ["All", "Technology", "Cultural", "Workshop", "Sports", "Business", "Art"]

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [priceFilter, setPriceFilter] = useState("all")


  type Event = {
    _id?: string
    id: string
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


  const [eventsData, setEventsData] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = axios.get(`${BackendURL}/api/events`);
        const data = await response.then(res => res.data);
        setEventsData(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);


  const filteredEvents = eventsData.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "free" && event.price === 0) ||
      (priceFilter === "paid" && (event.price ?? 0) > 0)
    return matchesSearch && matchesCategory && matchesPrice
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Explore Events</h1>
        <p className="text-muted-foreground">Discover and register for upcoming campus events</p>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Filter */}
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-full md:w-32">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "grid" && "bg-background shadow-sm")}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "list" && "bg-background shadow-sm")}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-muted-foreground">
        Showing {filteredEvents.length} event{filteredEvents.length !== 1 && "s"}
      </p>

      {/* Events Grid */}
      <div className={cn("grid gap-6", viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
        {filteredEvents.map((event) => (
          <EventCard key={event._id || event.id} {...{ ...event, _id: event._id || event.id }} />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found matching your criteria.</p>
          <Button
            variant="outline"
            className="mt-4 bg-transparent"
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("All")
              setPriceFilter("all")
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
