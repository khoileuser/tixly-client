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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
    Calendar,
    MapPin,
    Ticket,
    Loader2,
    AlertCircle,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react"
import { format } from "date-fns"
import type { Event, Category } from "@/interfaces"

interface SearchParams {
    search: string
    categoryId: string
    dateFrom: Date | undefined
    dateTo: Date | undefined
    priceMin: string
    priceMax: string
    sortBy: string
    sortOrder: string
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [categories, setCategories] = useState<Category[]>([])
    const [categoryMap, setCategoryMap] = useState<Record<string, Category>>({})
    const [showFilters, setShowFilters] = useState(false)
    const [totalCount, setTotalCount] = useState(0)

    const [searchParams, setSearchParams] = useState<SearchParams>({
        search: "",
        categoryId: "",
        dateFrom: undefined,
        dateTo: undefined,
        priceMin: "",
        priceMax: "",
        sortBy: "date",
        sortOrder: "asc",
    })

    const [debouncedSearch, setDebouncedSearch] = useState("")

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchParams.search)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchParams.search])

    // Fetch categories from API
    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/categories`
            )
            const result = await response.json()

            if (result.success) {
                setCategories(result.data)
                // Convert array to object keyed by category ID for easy lookup
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

    // Helper function to get category display name
    const getCategoryName = (categoryId: string): string => {
        return categoryMap[categoryId]?.name || "Event"
    }

    const fetchEvents = useCallback(async () => {
        try {
            setIsLoading(true)
            setError("")

            const params = new URLSearchParams()

            if (debouncedSearch) params.append("search", debouncedSearch)
            if (searchParams.categoryId)
                params.append("categoryId", searchParams.categoryId)
            if (searchParams.dateFrom)
                params.append("dateFrom", searchParams.dateFrom.toISOString())
            if (searchParams.dateTo)
                params.append("dateTo", searchParams.dateTo.toISOString())
            if (searchParams.priceMin)
                params.append("priceMin", searchParams.priceMin)
            if (searchParams.priceMax)
                params.append("priceMax", searchParams.priceMax)
            if (searchParams.sortBy)
                params.append("sortBy", searchParams.sortBy)
            if (searchParams.sortOrder)
                params.append("sortOrder", searchParams.sortOrder)

            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL
                }/events/search?${params.toString()}`
            )

            const result = await response.json()

            if (result.success) {
                setEvents(result.data)
                setTotalCount(result.totalCount || result.count)
            } else {
                setError(result.message || "Failed to load events")
            }
        } catch (err) {
            console.error("Error fetching events:", err)
            setError("Failed to load events")
        } finally {
            setIsLoading(false)
        }
    }, [
        debouncedSearch,
        searchParams.categoryId,
        searchParams.dateFrom,
        searchParams.dateTo,
        searchParams.priceMin,
        searchParams.priceMax,
        searchParams.sortBy,
        searchParams.sortOrder,
    ])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

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

    const handleSearchChange = (
        key: keyof SearchParams,
        value: string | Date | undefined
    ) => {
        setSearchParams((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setSearchParams({
            search: "",
            categoryId: "",
            dateFrom: undefined,
            dateTo: undefined,
            priceMin: "",
            priceMax: "",
            sortBy: "date",
            sortOrder: "asc",
        })
    }

    const hasActiveFilters =
        searchParams.categoryId ||
        searchParams.dateFrom ||
        searchParams.dateTo ||
        searchParams.priceMin ||
        searchParams.priceMax

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Search and Filter Header */}
            <div className="sticky top-0 z-10 pt-4">
                <div className="container mx-auto px-4 py-4">
                    {/* Search Bar */}
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1 bg-white">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search events by name, description, or venue..."
                                value={searchParams.search}
                                onChange={(e) =>
                                    handleSearchChange("search", e.target.value)
                                }
                                className="pl-10"
                            />
                        </div>
                        <Button
                            variant={showFilters ? "default" : "outline"}
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filters
                            {hasActiveFilters && (
                                <Badge
                                    variant="secondary"
                                    className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
                                >
                                    !
                                </Badge>
                            )}
                        </Button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-white rounded-lg border">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Category Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={searchParams.categoryId}
                                        onValueChange={(value) =>
                                            handleSearchChange(
                                                "categoryId",
                                                value === "all" ? "" : value
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All categories
                                            </SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date From */}
                                <div className="space-y-2">
                                    <Label>From Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${
                                                    !searchParams.dateFrom &&
                                                    "text-muted-foreground"
                                                }`}
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {searchParams.dateFrom ? (
                                                    format(
                                                        searchParams.dateFrom,
                                                        "PPP"
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <CalendarComponent
                                                mode="single"
                                                selected={searchParams.dateFrom}
                                                onSelect={(date) =>
                                                    handleSearchChange(
                                                        "dateFrom",
                                                        date
                                                    )
                                                }
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Date To */}
                                <div className="space-y-2">
                                    <Label>To Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${
                                                    !searchParams.dateTo &&
                                                    "text-muted-foreground"
                                                }`}
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {searchParams.dateTo ? (
                                                    format(
                                                        searchParams.dateTo,
                                                        "PPP"
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <CalendarComponent
                                                mode="single"
                                                selected={searchParams.dateTo}
                                                onSelect={(date) =>
                                                    handleSearchChange(
                                                        "dateTo",
                                                        date
                                                    )
                                                }
                                                disabled={(date) =>
                                                    searchParams.dateFrom
                                                        ? date <
                                                          searchParams.dateFrom
                                                        : date < new Date()
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Price Range */}
                                <div className="space-y-2">
                                    <Label>Price Range</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={searchParams.priceMin}
                                            onChange={(e) =>
                                                handleSearchChange(
                                                    "priceMin",
                                                    e.target.value
                                                )
                                            }
                                            min="0"
                                            className="w-full"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={searchParams.priceMax}
                                            onChange={(e) =>
                                                handleSearchChange(
                                                    "priceMax",
                                                    e.target.value
                                                )
                                            }
                                            min="0"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sort Options and Clear */}
                            <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="sortBy">Sort by:</Label>
                                        <Select
                                            value={searchParams.sortBy}
                                            onValueChange={(value) =>
                                                handleSearchChange(
                                                    "sortBy",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-35">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="date">
                                                    Date
                                                </SelectItem>
                                                <SelectItem value="price">
                                                    Price
                                                </SelectItem>
                                                <SelectItem value="title">
                                                    Name
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="sortOrder">
                                            Order:
                                        </Label>
                                        <Select
                                            value={searchParams.sortOrder}
                                            onValueChange={(value) =>
                                                handleSearchChange(
                                                    "sortOrder",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-35">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="asc">
                                                    Ascending
                                                </SelectItem>
                                                <SelectItem value="desc">
                                                    Descending
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        onClick={clearFilters}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Info */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <p className="text-gray-600">
                        {isLoading ? (
                            "Loading events..."
                        ) : (
                            <>
                                Found{" "}
                                <span className="font-semibold">
                                    {totalCount}
                                </span>{" "}
                                {totalCount === 1 ? "event" : "events"}
                                {(debouncedSearch || hasActiveFilters) &&
                                    " matching your criteria"}
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Events Grid */}
            <div className="container mx-auto px-4 pb-8">
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    </div>
                ) : error ? (
                    <Card className="max-w-md mx-auto">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                                <h2 className="text-xl font-semibold mb-2">
                                    {error}
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Unable to load events. Please try again
                                    later.
                                </p>
                                <Button onClick={fetchEvents}>Retry</Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : events.length === 0 ? (
                    <Card className="max-w-md mx-auto">
                        <CardContent className="pt-6 text-center">
                            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">
                                No events found
                            </h2>
                            <p className="text-gray-600 mb-4">
                                {debouncedSearch || hasActiveFilters
                                    ? "Try adjusting your search or filters"
                                    : "No upcoming events available at the moment"}
                            </p>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </Button>
                            )}
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
                                            <div className="flex flex-wrap gap-1">
                                                {event.categoryIds &&
                                                event.categoryIds.length > 0 ? (
                                                    event.categoryIds.map(
                                                        (categoryId) => (
                                                            <Badge
                                                                key={categoryId}
                                                            >
                                                                {getCategoryName(
                                                                    categoryId
                                                                )}
                                                            </Badge>
                                                        )
                                                    )
                                                ) : (
                                                    <Badge>Event</Badge>
                                                )}
                                            </div>
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
                                                {formatDate(event.datetime)}
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
