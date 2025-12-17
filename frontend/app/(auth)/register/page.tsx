"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Award as IdCard, ArrowRight, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

const passwordRequirements = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[a-z]/, label: "One lowercase letter" },
  { regex: /[0-9]/, label: "One number" },
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college_Name: "",
    department: "",
    year_of_study: "",
    interest: "",
    password: "",
  })

  const updateForm = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getPasswordStrength = () => {
    const passed = passwordRequirements.filter((req) => req.regex.test(formData.password)).length
    return passed
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!BACKEND_API_URL) {
      setError("Client is misconfigured. BACKEND_API_URL is missing.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // registration usually doesn’t need cookies, so no credentials here
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          college_Name: formData.college_Name,
          department: formData.department,
          year_of_study: formData.year_of_study,
          interest: formData.interest,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        let message = "Registration failed. Please try again."
        if (text && text.trim().startsWith("{")) {
          try {
            const data = JSON.parse(text)
            if (data?.message) message = data.message
          } catch {
            /* ignore parse error */
          }
        } else if (res.status === 404) {
          message = "Registration endpoint not found. Check backend URL."
        }
        throw new Error(message)
      }

      // success → go to login page
      router.push("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">U</span>
            </div>
            <span className="font-bold text-2xl">
              Uni<span className="text-primary">Sphere</span>
            </span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join your college event community</p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 h-12"
                  value={formData.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">College Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@college.edu"
                  className="pl-10 h-12"
                  value={formData.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  required
                />
              </div>
            </div>

            {/*  College Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collegeName">College Name</Label>
                <Input
                  id="collegeName"
                  type="text"
                  placeholder="PCCOE, Pune"
                  className="h-12"
                  value={formData.college_Name}
                  onChange={(e) => updateForm("college_Name", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Department + Year of Study */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => updateForm("department", value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                    <SelectItem value="Computer Engineering Regional">Computer Engineering Regional</SelectItem>
                    <SelectItem value="Artificial Intelligence & Machine Learning">AIML</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="Electrical Engineering">Electrical Eng.</SelectItem>
                    <SelectItem value="Electronics & TeleCommunication">E&TC</SelectItem>
                    <SelectItem value="Mechanical Engineering">Mechanical Eng.</SelectItem>
                    <SelectItem value="Civil Engineering">Civil Eng.</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year of Study</Label>
                <Select
                  value={formData.year_of_study}
                  onValueChange={(value) => updateForm("year_of_study", value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">First Year</SelectItem>
                    <SelectItem value="2nd">Second Year</SelectItem>
                    <SelectItem value="3rd">Third Year</SelectItem>
                    <SelectItem value="4th">Fourth Year</SelectItem>
                    <SelectItem value="5th">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label htmlFor="interest">Interests</Label>
              <Input
                id="interest"
                type="text"
                placeholder="Hackathons, robotics, cultural events..."
                className="h-12"
                value={formData.interest}
                onChange={(e) => updateForm("interest", e.target.value)}
              />
            </div>

            {/* Password + strength */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10 h-12"
                  value={formData.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          getPasswordStrength() >= level
                            ? level <= 2
                              ? "bg-destructive"
                              : level === 3
                              ? "bg-accent"
                              : "bg-green-500"
                            : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {req.regex.test(formData.password) ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            req.regex.test(formData.password)
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-lg group" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
