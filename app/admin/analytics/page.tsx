"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Users,
    Ticket,
    Calendar,
    DollarSign,
    ShoppingCart,
    Loader2,
    TrendingUp,
} from "lucide-react"
import type { AnalyticsData } from "@/interfaces"

export default function AnalyticsPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [error, setError] = useState("")

    const checkAdminAccess = async () => {
        try {
            const profile = await authService.getProfile()

            if (!profile.success) {
                router.push("/login")
                return
            }

            if (profile.data.role !== "admin") {
                router.push("/")
                return
            }

            setIsAuthorized(true)
            await fetchAnalytics()
        } catch (error) {
            console.error("Access check error:", error)
            router.push("/login")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        checkAdminAccess()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/analytics`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error("Failed to fetch analytics")
            }

            const data = await response.json()
            setAnalytics(data.data)
        } catch (error) {
            console.error("Fetch analytics error:", error)
            setError("Failed to load analytics data")
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!isAuthorized) {
        return null
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-8xl">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                {analytics && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Users
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {analytics.totalUsers.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Registered users
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Events
                                    </CardTitle>
                                    <Calendar className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {analytics.totalEvents.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Active events
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Tickets Sold
                                    </CardTitle>
                                    <Ticket className="h-4 w-4 text-purple-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {analytics.totalTicketsSold.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Total tickets sold
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Revenue
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-yellow-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        $
                                        {analytics.totalRevenue.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        From ticket sales
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Pending Bookings
                                    </CardTitle>
                                    <ShoppingCart className="h-4 w-4 text-orange-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {analytics.pendingBookings.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Awaiting payment
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Average Order Value
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 text-teal-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        $
                                        {analytics.totalTicketsSold > 0
                                            ? (
                                                  analytics.totalRevenue /
                                                  analytics.totalTicketsSold
                                              ).toFixed(2)
                                            : "0.00"}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Per ticket sold
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    Latest platform activities
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {analytics.recentActivity.length > 0 ? (
                                    <div className="space-y-4">
                                        {analytics.recentActivity.map(
                                            (activity, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start gap-4 pb-4 border-b last:border-0"
                                                >
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">
                                                            {activity.type}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {
                                                                activity.description
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(
                                                                activity.timestamp
                                                            ).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-center py-8">
                                        No recent activity
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}
