"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Users, Award, QrCode } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-up">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Reimagining College Events
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-up animation-delay-100 text-balance">
            Your College Universe of <span className="text-primary">Events</span>,{" "}
            <span className="text-accent">Attendance</span> &{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-accent">Opportunities</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up animation-delay-200 text-pretty">
            Discover events, track attendance with smart QR codes, earn certificates, and build your campus profile. All
            in one powerful platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animation-delay-300">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg group">
                Explore Events
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent">
                Login to Dashboard
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 animate-fade-up animation-delay-400">
            {[
              { icon: Calendar, label: "Events Hosted", value: "500+" },
              { icon: Users, label: "Active Students", value: "10K+" },
              { icon: Award, label: "Certificates Issued", value: "25K+" },
              { icon: QrCode, label: "Attendance Scans", value: "100K+" },
            ].map((stat, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-4 md:p-6 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1"
              >
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block absolute top-1/4 left-10 animate-float">
          <div className="glass rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Attendance Marked</p>
                <p className="text-xs text-muted-foreground">Tech Fest 2024</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute bottom-1/4 right-10 animate-float animation-delay-200">
          <div className="glass rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Award className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-sm">Certificate Earned!</p>
                <p className="text-xs text-muted-foreground">Hackathon Winner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
