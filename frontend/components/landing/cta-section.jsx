"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-primary via-primary/90 to-primary/80" />
          <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10 mix-blend-overlay" />

          <div className="relative z-10 py-16 px-6 md:py-24 md:px-12 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 text-balance">
              Ready to Transform Your Campus Events?
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-10 text-lg text-pretty">
              Join thousands of students and organizers already using UniSphere to create memorable campus experiences.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                >
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
