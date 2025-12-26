"use client"

import { use, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Calendar,
    MapPin,
    Clock,
    Ticket,
    DollarSign,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Users,
} from "lucide-react"

interface Event {
    id: string
    title: string
    description: string
    date: string
    location: string
    venue: string
    categoryId: string
    categoryName: string
    price: number
    totalTickets: number
    availableTickets: number
    status: string
    imageUrl?: string
    organizerId: string
    organizerName: string
    createdAt: string
}

export default function EventDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const [event, setEvent] = useState<Event | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchEventDetails = useCallback(async () => {
        try {
            setIsLoading(true)
            setError("")

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/events/${id}`
            )

            const result = await response.json()

            if (result.success) {
                setEvent(result.data)
            } else {
                setError(result.message || "Event not found")
            }
        } catch (err) {
            console.error("Error fetching event:", err)
            setError("Failed to load event details")
        } finally {
            setIsLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchEventDetails()
    }, [fetchEventDetails])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price)
    }

    const getAvailabilityStatus = () => {
        if (!event) return null

        const percentageAvailable =
            (event.availableTickets / event.totalTickets) * 100

        if (percentageAvailable === 0) {
            return { text: "Sold Out", color: "bg-red-500" }
        } else if (percentageAvailable < 10) {
            return {
                text: `Only ${event.availableTickets} left!`,
                color: "bg-orange-500",
            }
        } else if (percentageAvailable < 25) {
            return { text: "Selling Fast", color: "bg-yellow-500" }
        } else {
            return { text: "Available", color: "bg-green-500" }
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading event details...</p>
                </div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                            <h2 className="text-xl font-semibold mb-2">
                                {error || "Event not found"}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                The event you&apos;re looking for doesn&apos;t
                                exist or has been removed.
                            </p>
                            <Link href="/events">
                                <Button>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Events
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const availability = getAvailabilityStatus()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-3 pt-8">
                <Link
                    href="/events"
                    className="text-sm text-gray-600 hover:text-blue-600 inline-flex items-center"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Events
                </Link>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Event Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Event Image */}
                        {event.imageUrl && (
                            <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-200">
                                <Image
                                    src={event.imageUrl}
                                    alt={event.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        )}

                        {/* Event Info Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <Badge className="mb-2">
                                            {event.categoryName}
                                        </Badge>
                                        <CardTitle className="text-3xl mb-2">
                                            {event.title}
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            Organized by {event.organizerName}
                                        </CardDescription>
                                    </div>
                                    {availability && (
                                        <Badge
                                            className={`${availability.color} text-white`}
                                        >
                                            {availability.text}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {/* Date & Time */}
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">
                                            {formatDate(event.date)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {formatTime(event.date)}
                                        </p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">
                                            {event.venue}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {event.location}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="pt-4 border-t">
                                    <h3 className="font-semibold text-lg mb-2">
                                        About This Event
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {event.description}
                                    </p>
                                </div>

                                {/* Event Stats */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <Ticket className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Available Tickets
                                            </p>
                                            <p className="font-semibold">
                                                {event.availableTickets} /{" "}
                                                {event.totalTickets}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Ticket Price
                                            </p>
                                            <p className="font-semibold">
                                                {formatPrice(event.price)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Book Tickets</CardTitle>
                                <CardDescription>
                                    Secure your spot now
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">
                                            Price per ticket
                                        </span>
                                        <span className="text-2xl font-bold">
                                            {formatPrice(event.price)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {event.availableTickets} tickets
                                        available
                                    </div>
                                </div>

                                {event.availableTickets > 0 ? (
                                    <Button className="w-full" size="lg">
                                        <Ticket className="mr-2 h-5 w-5" />
                                        Buy Tickets
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        disabled
                                    >
                                        Sold Out
                                    </Button>
                                )}

                                <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
                                    <p className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Instant confirmation
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Mobile ticket available
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2 text-xs text-gray-500">
                                <p>Free cancellation up to 24 hours before</p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
