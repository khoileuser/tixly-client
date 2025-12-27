"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Ticket, Loader2, AlertCircle } from "lucide-react"
import type { Event } from "@/interfaces"

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            setIsLoading(true)
            setError("")

            // Fetch all published events (backend defaults to PUBLISHED status)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/events`
            )

            const result = await response.json()

            if (result.success) {
                // Filter to only show upcoming events on the client side
                const upcomingEvents = result.data.filter(
                    (event: Event) => event.timeStatus === "upcoming"
                )
                setEvents(upcomingEvents)
            } else {
                setError(result.message || "Failed to load events")
            }
        } catch (err) {
            console.error("Error fetching events:", err)
            setError("Failed to load events")
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price)
    }

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                            <h2 className="text-xl font-semibold mb-2">
                                {error}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Unable to load events. Please try again later.
                            </p>
                            <Button onClick={fetchEvents}>Retry</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Events Grid */}
            <div className="container mx-auto px-4 py-8">
                {events.length === 0 ? (
                    <Card className="max-w-md mx-auto">
                        <CardContent className="pt-6 text-center">
                            <p className="text-gray-600">No events found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <Link
                                key={event.id}
                                href={`/events/${event.id}`}
                                className="block transition-transform hover:scale-[1.02]"
                            >
                                <Card className="h-full overflow-hidden pt-0">
                                    {/* Event Image */}
                                    {event.imageUrl && (
                                        <div className="relative w-full h-48 bg-gray-200">
                                            <Image
                                                src={event.imageUrl}
                                                alt={event.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <Badge>Event</Badge>
                                            {event.availableSeats <
                                                event.totalSeats * 0.1 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="text-xs"
                                                >
                                                    Selling Fast
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="line-clamp-2 leading-relaxed">
                                            {event.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {event.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        {/* Date */}
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {formatDate(event.date)}
                                            </span>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span className="line-clamp-1">
                                                {event.venue}
                                            </span>
                                        </div>

                                        {/* Price & Tickets */}
                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <div className="flex items-center gap-2">
                                                <Ticket className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-600">
                                                    {event.availableSeats} left
                                                </span>
                                            </div>
                                            <span className="font-bold text-lg">
                                                {formatPrice(
                                                    event.pricePerSeat
                                                )}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
