"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import {
    Calendar,
    MapPin,
    Ticket,
    TrendingUp,
    CalendarDays,
    CalendarRange,
    ArrowRight,
    Sparkles,
} from "lucide-react"
import type { Event, Category } from "@/interfaces"

// Event Card Component for reuse
function EventCard({
    event,
    getCategoryName,
    formatDate,
    formatPrice,
}: {
    event: Event
    getCategoryName: (id: string) => string
    formatDate: (date: string) => string
    formatPrice: (price: number) => string
}) {
    return (
        <Link
            href={`/events/${event.id}`}
            className="block transition-transform hover:scale-[1.02]"
        >
            <Card className="h-full overflow-hidden pt-0">
                {event.imageUrl && (
                    <div className="relative w-full h-40 bg-gray-200">
                        <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover"
                        />
                    </div>
                )}
                <CardHeader className="pb-2">
                    <div className="flex flex-wrap gap-1 mb-2">
                        {event.categoryIds && event.categoryIds.length > 0 ? (
                            event.categoryIds.slice(0, 2).map((categoryId) => (
                                <Badge key={categoryId} variant="secondary">
                                    {getCategoryName(categoryId)}
                                </Badge>
                            ))
                        ) : (
                            <Badge variant="secondary">Event</Badge>
                        )}
                    </div>
                    <CardTitle className="line-clamp-1 text-base">
                        {event.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                        {event.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(event.datetime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="line-clamp-1">{event.venue}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-1.5">
                            <Ticket className="h-3.5 w-3.5 text-gray-500" />
                            <span className="text-xs text-gray-600">
                                {event.availableSeats} left
                            </span>
                        </div>
                        <span className="font-bold">
                            {formatPrice(event.pricePerSeat)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

// Event Card Skeleton for loading state
function EventCardSkeleton() {
    return (
        <Card className="h-full overflow-hidden pt-0">
            <Skeleton className="w-full h-40" />
            <CardHeader className="pb-2">
                <Skeleton className="h-5 w-16 mb-2" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <div className="flex justify-between pt-2 border-t">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-12" />
                </div>
            </CardContent>
        </Card>
    )
}

// Section Component
function EventSection({
    title,
    icon: Icon,
    events,
    isLoading,
    getCategoryName,
    formatDate,
    formatPrice,
    viewAllLink,
}: {
    title: string
    icon: React.ComponentType<{ className?: string }>
    events: Event[]
    isLoading: boolean
    getCategoryName: (id: string) => string
    formatDate: (date: string) => string
    formatPrice: (price: number) => string
    viewAllLink?: string
}) {
    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Icon className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">{title}</h2>
                </div>
                {viewAllLink && events.length > 0 && (
                    <Link href={viewAllLink}>
                        <Button variant="ghost" className="gap-1">
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <EventCardSkeleton key={i} />
                    ))}
                </div>
            ) : events.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-gray-500">No events available</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {events.slice(0, 4).map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            getCategoryName={getCategoryName}
                            formatDate={formatDate}
                            formatPrice={formatPrice}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

export default function Home() {
    const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
    const [trendingEvents, setTrendingEvents] = useState<Event[]>([])
    const [thisWeekEvents, setThisWeekEvents] = useState<Event[]>([])
    const [thisMonthEvents, setThisMonthEvents] = useState<Event[]>([])
    const [categoryMap, setCategoryMap] = useState<Record<string, Category>>({})
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    const [loadingFeatured, setLoadingFeatured] = useState(true)
    const [loadingTrending, setLoadingTrending] = useState(true)
    const [loadingThisWeek, setLoadingThisWeek] = useState(true)
    const [loadingThisMonth, setLoadingThisMonth] = useState(true)

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/categories`
            )
            const result = await response.json()
            if (result.success) {
                const map: Record<string, Category> = {}
                result.data.forEach((category: Category) => {
                    map[category.id] = category
                })
                setCategoryMap(map)
            }
        } catch (err) {
            console.error("Error fetching categories:", err)
        }
    }, [])

    // Check auth state
    useEffect(() => {
        const checkAuthState = () => {
            const token = localStorage.getItem("accessToken")
            setIsLoggedIn(!!token)
        }
        checkAuthState()

        // Listen for auth state changes
        window.addEventListener("storage", checkAuthState)
        window.addEventListener("authStateChanged", checkAuthState)

        return () => {
            window.removeEventListener("storage", checkAuthState)
            window.removeEventListener("authStateChanged", checkAuthState)
        }
    }, [])

    // Fetch featured events for carousel
    const fetchFeaturedEvents = useCallback(async () => {
        try {
            setLoadingFeatured(true)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/events/featured?limit=6`
            )
            const result = await response.json()
            if (result.success) {
                setFeaturedEvents(result.data)
            }
        } catch (err) {
            console.error("Error fetching featured events:", err)
        } finally {
            setLoadingFeatured(false)
        }
    }, [])

    // Fetch trending events
    const fetchTrendingEvents = useCallback(async () => {
        try {
            setLoadingTrending(true)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/events/trending?limit=8`
            )
            const result = await response.json()
            if (result.success) {
                setTrendingEvents(result.data)
            }
        } catch (err) {
            console.error("Error fetching trending events:", err)
        } finally {
            setLoadingTrending(false)
        }
    }, [])

    // Fetch this week events
    const fetchThisWeekEvents = useCallback(async () => {
        try {
            setLoadingThisWeek(true)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/events/this-week?limit=8`
            )
            const result = await response.json()
            if (result.success) {
                setThisWeekEvents(result.data)
            }
        } catch (err) {
            console.error("Error fetching this week events:", err)
        } finally {
            setLoadingThisWeek(false)
        }
    }, [])

    // Fetch this month events
    const fetchThisMonthEvents = useCallback(async () => {
        try {
            setLoadingThisMonth(true)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/events/this-month?limit=8`
            )
            const result = await response.json()
            if (result.success) {
                setThisMonthEvents(result.data)
            }
        } catch (err) {
            console.error("Error fetching this month events:", err)
        } finally {
            setLoadingThisMonth(false)
        }
    }, [])

    useEffect(() => {
        fetchCategories()
        fetchFeaturedEvents()
        fetchTrendingEvents()
        fetchThisWeekEvents()
        fetchThisMonthEvents()
    }, [
        fetchCategories,
        fetchFeaturedEvents,
        fetchTrendingEvents,
        fetchThisWeekEvents,
        fetchThisMonthEvents,
    ])

    const getCategoryName = (categoryId: string): string => {
        return categoryMap[categoryId]?.name || "Event"
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Carousel Section */}
            <section className="bg-linear-to-b from-blue-600 to-blue-800 text-white">
                <div className="container mx-auto px-4 py-20 gap-12 flex flex-col">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Discover Amazing Events
                        </h1>
                        <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                            Find and book tickets for concerts, sports, theater,
                            and more events happening near you
                        </p>
                    </div>

                    {/* Featured Events Carousel */}
                    {loadingFeatured ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-pulse flex space-x-4">
                                <Skeleton className="h-64 w-full max-w-4xl bg-blue-400/30 rounded-xl" />
                            </div>
                        </div>
                    ) : featuredEvents.length > 0 ? (
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full max-w-10xl mx-auto"
                        >
                            <CarouselContent>
                                {featuredEvents.map((event) => (
                                    <CarouselItem
                                        key={event.id}
                                        className="basis-1/1 md:basis-1/2 lg:basis-1/3"
                                    >
                                        <Link href={`/events/${event.id}`}>
                                            <Card className="overflow-hidden border-0 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors pt-0 pb-0">
                                                <div className="relative h-48 md:h-56">
                                                    {event.imageUrl ? (
                                                        <Image
                                                            src={event.imageUrl}
                                                            alt={event.title}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full bg-blue-500/30 flex items-center justify-center">
                                                            <Sparkles className="h-12 w-12 text-white/50" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                                        <Badge className="mb-2 bg-blue-600">
                                                            Featured
                                                        </Badge>
                                                        <h3 className="text-xl font-bold text-white line-clamp-2">
                                                            {event.title}
                                                        </h3>
                                                        <div className="flex items-center gap-4 mt-2 text-white/80 text-sm">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {formatDate(
                                                                    event.datetime
                                                                )}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                {event.venue}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-2 bg-white/20 border-0 text-white hover:bg-white/30" />
                            <CarouselNext className="right-2 bg-white/20 border-0 text-white hover:bg-white/30" />
                        </Carousel>
                    ) : (
                        <Card className="max-w-md mx-auto p-6 text-center bg-white/10 backdrop-blur-sm border-0">
                            <p className="text-blue-100">
                                No featured events at the moment
                            </p>
                        </Card>
                    )}

                    {/* Search CTA */}
                    <div className="text-center">
                        <Link href="/events">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="gap-2"
                            >
                                <Ticket className="h-5 w-5" />
                                Browse All Events
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4">
                {/* Trending Events */}
                <EventSection
                    title="Trending Now"
                    icon={TrendingUp}
                    events={trendingEvents}
                    isLoading={loadingTrending}
                    getCategoryName={getCategoryName}
                    formatDate={formatDate}
                    formatPrice={formatPrice}
                    viewAllLink="/events"
                />

                {/* This Week */}
                <EventSection
                    title="This Week"
                    icon={CalendarDays}
                    events={thisWeekEvents}
                    isLoading={loadingThisWeek}
                    getCategoryName={getCategoryName}
                    formatDate={formatDate}
                    formatPrice={formatPrice}
                    viewAllLink="/events"
                />

                {/* This Month */}
                <EventSection
                    title="This Month"
                    icon={CalendarRange}
                    events={thisMonthEvents}
                    isLoading={loadingThisMonth}
                    getCategoryName={getCategoryName}
                    formatDate={formatDate}
                    formatPrice={formatPrice}
                    viewAllLink="/events"
                />
            </div>

            {/* CTA Section */}
            <section className="bg-blue-600 text-white py-16 mt-12">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to Experience Something Amazing?
                    </h2>
                    <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of people discovering and attending
                        incredible events every day.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/events">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="gap-2"
                            >
                                <Calendar className="h-5 w-5" />
                                Explore Events
                            </Button>
                        </Link>
                        {!isLoggedIn && (
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="gap-2 bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
                                >
                                    Create Account
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
