"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Calendar,
    MapPin,
    Loader2,
    AlertCircle,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Ticket,
    Tags,
} from "lucide-react"
import { format } from "date-fns"
import type { Event, EventFormData, Category } from "@/interfaces"
import EventFormDialog from "@/components/event-form-dialog"
import CategoryManagementDialog from "@/components/category-management-dialog"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function AdminEventsPage() {
    const router = useRouter()
    const [events, setEvents] = useState<Event[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [categories, setCategories] = useState<Category[]>([])
    const [categoryMap, setCategoryMap] = useState<Record<string, Category>>({})

    // Filters
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    // Dialog states
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [formMode, setFormMode] = useState<"create" | "edit">("create")
    const [isDeleting, setIsDeleting] = useState(false)
    const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(
        null
    )

    // Check if user is admin
    useEffect(() => {
        const userRole = localStorage.getItem("userRole")
        if (userRole !== "admin") {
            router.push("/events")
        }
    }, [router])

    const getAuthHeader = () => {
        const token = localStorage.getItem("accessToken")
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    }

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`)
            const result = await response.json()

            if (result.success) {
                setCategories(result.data)
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

    // Fetch events
    const fetchEvents = useCallback(async () => {
        try {
            setIsLoading(true)
            setError("")

            const params = new URLSearchParams()
            if (searchQuery) params.append("search", searchQuery)
            if (statusFilter && statusFilter !== "all")
                params.append("status", statusFilter)

            const response = await fetch(
                `${API_BASE_URL}/admin/events?${params.toString()}`,
                {
                    headers: getAuthHeader(),
                }
            )

            if (response.status === 401 || response.status === 403) {
                router.push("/login")
                return
            }

            const result = await response.json()

            if (result.success) {
                setEvents(result.data)
            } else {
                setError(result.message || "Failed to load events")
            }
        } catch (err) {
            console.error("Error fetching events:", err)
            setError("Failed to load events")
        } finally {
            setIsLoading(false)
        }
    }, [searchQuery, statusFilter, router])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchEvents()
        }, 300)
        return () => clearTimeout(debounceTimer)
    }, [fetchEvents])

    const getCategoryName = (categoryId: string): string => {
        return categoryMap[categoryId]?.name || "Event"
    }

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "PPP 'at' p")
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price)
    }

    // Create or Update event
    const handleSubmitEvent = async (
        data: EventFormData,
        imageFile?: File
    ): Promise<{ success: boolean; message?: string }> => {
        try {
            const formData = new FormData()

            // Append all form fields
            formData.append("title", data.title)
            formData.append("description", data.description)
            formData.append("datetime", data.datetime)
            formData.append("location", data.location)
            formData.append("venue", data.venue || "")
            formData.append("categoryIds", JSON.stringify(data.categoryIds))
            formData.append("pricePerSeat", data.pricePerSeat.toString())
            formData.append("totalSeats", data.totalSeats.toString())
            formData.append("seatsPerRow", data.seatsPerRow.toString())
            formData.append("organizerName", data.organizerName)
            formData.append("status", data.status)

            // Append image if provided
            if (imageFile) {
                formData.append("image", imageFile)
            }

            const url =
                formMode === "create"
                    ? `${API_BASE_URL}/admin/events`
                    : `${API_BASE_URL}/admin/events/${selectedEvent?.id}`

            const token = localStorage.getItem("accessToken")
            const response = await fetch(url, {
                method: formMode === "create" ? "POST" : "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            const result = await response.json()

            if (result.success) {
                await fetchEvents()
                return { success: true }
            } else {
                return {
                    success: false,
                    message: result.message || "Failed to save event",
                }
            }
        } catch (error) {
            console.error("Error saving event:", error)
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to save event",
            }
        }
    }

    // Delete event
    const handleDeleteEvent = async () => {
        if (!selectedEvent) return

        setIsDeleting(true)
        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/events/${selectedEvent.id}`,
                {
                    method: "DELETE",
                    headers: getAuthHeader(),
                }
            )

            const result = await response.json()

            if (result.success) {
                setIsDeleteDialogOpen(false)
                setSelectedEvent(null)
                await fetchEvents()
            } else {
                setError(result.message || "Failed to delete event")
            }
        } catch (error) {
            console.error("Error deleting event:", error)
            setError("Failed to delete event")
        } finally {
            setIsDeleting(false)
        }
    }

    // Toggle event status
    const handleToggleStatus = async (event: Event) => {
        setIsTogglingStatus(event.id)
        try {
            const newStatus =
                event.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"

            const response = await fetch(
                `${API_BASE_URL}/admin/events/${event.id}/status`,
                {
                    method: "PATCH",
                    headers: getAuthHeader(),
                    body: JSON.stringify({ status: newStatus }),
                }
            )

            const result = await response.json()

            if (result.success) {
                await fetchEvents()
            } else {
                setError(result.message || "Failed to update status")
            }
        } catch (error) {
            console.error("Error toggling status:", error)
            setError("Failed to update status")
        } finally {
            setIsTogglingStatus(null)
        }
    }

    const openCreateDialog = () => {
        setSelectedEvent(null)
        setFormMode("create")
        setIsFormDialogOpen(true)
    }

    const openEditDialog = (event: Event) => {
        setSelectedEvent(event)
        setFormMode("edit")
        setIsFormDialogOpen(true)
    }

    const openDeleteDialog = (event: Event) => {
        setSelectedEvent(event)
        setIsDeleteDialogOpen(true)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-8xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <div className="relative flex-1 bg-white">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-full sm:w-45 bg-white">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="PUBLISHED">
                                    Published
                                </SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsCategoryDialogOpen(true)}
                        >
                            <Tags className="mr-2 h-4 w-4" />
                            Categories
                        </Button>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Event
                        </Button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-700">{error}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setError("")}
                            className="ml-auto"
                        >
                            Dismiss
                        </Button>
                    </div>
                )}

                {/* Events List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    </div>
                ) : events.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Ticket className="h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">
                                No events found
                            </h3>
                            <p className="text-gray-500 mt-1">
                                {searchQuery || statusFilter !== "all"
                                    ? "Try adjusting your filters"
                                    : "Create your first event to get started"}
                            </p>
                            {!searchQuery && statusFilter === "all" && (
                                <Button
                                    onClick={openCreateDialog}
                                    className="mt-4"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Event
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {events.map((event) => (
                            <Card
                                key={event.id}
                                className="overflow-hidden py-0"
                            >
                                <div className="flex flex-col sm:flex-row">
                                    {/* Event Image */}
                                    <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-gray-100 shrink-0">
                                        {event.imageUrl ? (
                                            <Image
                                                src={event.imageUrl}
                                                alt={event.title}
                                                fill
                                                sizes="(max-width: 640px) 100vw, 192px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Ticket className="h-8 w-8 text-gray-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Event Details */}
                                    <div className="flex-1 p-8">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {event.title}
                                                    </h3>
                                                    <Badge
                                                        variant={
                                                            event.status ===
                                                            "PUBLISHED"
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {event.status}
                                                    </Badge>
                                                    {event.timeStatus ===
                                                        "past" && (
                                                        <Badge variant="outline">
                                                            Past Event
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(
                                                            event.datetime
                                                        )}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {event.location}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                    <span>
                                                        {formatPrice(
                                                            event.pricePerSeat
                                                        )}{" "}
                                                        per seat
                                                    </span>
                                                    <span>
                                                        {event.availableSeats} /{" "}
                                                        {event.totalSeats} seats
                                                        available
                                                    </span>
                                                </div>
                                                {event.categoryIds?.length >
                                                    0 && (
                                                    <div className="flex gap-1 mt-2">
                                                        {event.categoryIds.map(
                                                            (catId) => (
                                                                <Badge
                                                                    key={catId}
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {getCategoryName(
                                                                        catId
                                                                    )}
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            event
                                                        )
                                                    }
                                                    disabled={
                                                        isTogglingStatus ===
                                                        event.id
                                                    }
                                                >
                                                    {isTogglingStatus ===
                                                    event.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : event.status ===
                                                      "PUBLISHED" ? (
                                                        <>
                                                            <EyeOff className="h-4 w-4 mr-1" />
                                                            Unpublish
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Publish
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openEditDialog(event)
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openDeleteDialog(event)
                                                    }
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Event Form Dialog */}
                <EventFormDialog
                    open={isFormDialogOpen}
                    onOpenChange={setIsFormDialogOpen}
                    event={selectedEvent}
                    categories={categories}
                    onSubmit={handleSubmitEvent}
                    mode={formMode}
                />

                {/* Category Management Dialog */}
                <CategoryManagementDialog
                    open={isCategoryDialogOpen}
                    onOpenChange={setIsCategoryDialogOpen}
                    onCategoriesUpdated={fetchCategories}
                />

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Event</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete &quot;
                                {selectedEvent?.title}&quot;? This action cannot
                                be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteEvent}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
