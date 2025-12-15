"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL!

type User = {
    name: string
    email: string
    college_Name: string
    department: string
    year_of_study: number
    interest?: string[]
    profileIMG?: string
    bannerIMG?: string
    aboutMe?: string
}

export default function ProfileEditPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [name, setName] = useState("")
    const [aboutMe, setAboutMe] = useState("")
    const [interests, setInterests] = useState("")
    const [profileFile, setProfileFile] = useState<File | null>(null)
    const [BannerFile, setBannerFile] = useState<File | null>(null)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    // load current user into form
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true)
                const res = await fetch(`${BACKEND_API_URL}/api/users/me`, {
                    method: "GET",
                    credentials: "include",
                })

                if (!res.ok) {
                    const text = await res.text()
                    let message = "Failed to load user profile."
                    if (text && text.trim().startsWith("{")) {
                        try {
                            const data = JSON.parse(text)
                            if (data?.message) message = data.message
                        } catch { }
                    }
                    throw new Error(message)
                }

                const data: User = await res.json()
                setUser(data)
                setName(data.name || "")
                setAboutMe(data.aboutMe || "")
                setInterests((data.interest || []).join(", "))
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load profile.")
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    const handleSave = async () => {
        if (!user) return
        setSaving(true)
        setSaveError(null)

        try {
            const fd = new FormData()
            fd.append("name", name)
            fd.append("aboutMe", aboutMe)
            fd.append("interest", interests) // backend splits into array

            if (profileFile) {
                fd.append("profileIMG", profileFile)
            }
            if (BannerFile) {
                fd.append("bannerIMG", BannerFile)
            }

            const res = await fetch(`${BACKEND_API_URL}/api/users/me`, {
                method: "PUT",
                credentials: "include",
                body: fd,
            })

            if (!res.ok) {
                const text = await res.text()
                let message = "Failed to update profile."
                if (text && text.trim().startsWith("{")) {
                    try {
                        const data = JSON.parse(text)
                        if (data?.message) message = data.message
                    } catch { }
                }
                throw new Error(message)
            }

            await res.json()
            router.push("/dashboard/profile")
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Failed to update profile.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <p className="text-muted-foreground">Loading profile...</p>
    }

    if (error) {
        return <p className="text-destructive text-sm">{error}</p>
    }

    if (!user) {
        return <p className="text-muted-foreground">No user data available.</p>
    }

    return (
        <div className="max-w-xl space-y-6">
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.push("/dashboard/profile")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Profile
                </Button>
                <h1 className="text-2xl font-bold">Edit Profile</h1>
            </div>

            <div className="glass rounded-2xl p-6 border border-border/50 space-y-4">
                {/* Profile picture */}
                <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            setProfileFile(file)
                        }}
                    />
                </div>
                
                {/* Banner picture */}
                <div className="space-y-2">
                    <Label>Banner Picture</Label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            setBannerFile(file)
                        }}
                    />
                </div>

                {/* Name */}
                <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* About Me */}
                <div className="space-y-2">
                    <Label>About Me</Label>
                    <Textarea
                        value={aboutMe}
                        onChange={(e) => setAboutMe(e.target.value)}
                        rows={3}
                    />
                </div>

                {/* Interests */}
                <div className="space-y-2">
                    <Label>Interests (comma separated)</Label>
                    <Input
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        placeholder="AI/ML, Web Development, Music"
                    />
                </div>

                {saveError && (
                    <p className="text-sm text-destructive">{saveError}</p>
                )}

                <div className="flex gap-3 pt-2">
                    <Button
                        className="flex-1"
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => router.push("/dashboard/profile")}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    )
}
