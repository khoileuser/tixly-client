"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { authService, UserProfile } from "@/lib/auth"
import { Loader2, User, Mail, Phone, Shield, LogOut } from "lucide-react"

export default function DashboardPage() {
    const router = useRouter()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadProfile = async () => {
            try {
                if (!authService.isAuthenticated()) {
                    router.push("/login")
                    return
                }

                const result = await authService.getProfile()
                if (result.success) {
                    setProfile(result.data)
                }
            } catch (error) {
                console.error("Failed to load profile:", error)
                authService.logout()
                router.push("/login")
            } finally {
                setIsLoading(false)
            }
        }

        loadProfile()
    }, [router])

    const handleLogout = () => {
        authService.logout()
        router.push("/login")
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!profile) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-12">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Your account details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Full Name
                                    </p>
                                    <p className="font-medium">
                                        {profile.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Username
                                    </p>
                                    <p className="font-medium">
                                        {profile.username}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Email
                                    </p>
                                    <p className="font-medium">
                                        {profile.email}
                                    </p>
                                </div>
                            </div>

                            {profile.phoneNumber && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Phone
                                        </p>
                                        <p className="font-medium">
                                            {profile.phoneNumber}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Role
                                    </p>
                                    <p className="font-medium capitalize">
                                        {profile.role}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>My Tickets</CardTitle>
                            <CardDescription>
                                Your purchased tickets
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {profile.tickets.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    <p>No tickets yet</p>
                                    <p className="text-sm">
                                        Browse events to purchase tickets
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {profile.tickets.map((ticket, index) => (
                                        <div
                                            key={index}
                                            className="rounded-lg border p-3"
                                        >
                                            <p className="font-medium">
                                                Ticket #{index + 1}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {ticket}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    Cognito ID:
                                </span>
                                <span className="font-mono text-xs">
                                    {profile.cognitoId}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    Account Created:
                                </span>
                                <span>
                                    {new Date(
                                        profile.createdAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    Last Updated:
                                </span>
                                <span>
                                    {new Date(
                                        profile.updatedAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
