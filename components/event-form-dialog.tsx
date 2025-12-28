"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar, Loader2, Upload, X } from "lucide-react"
import { format } from "date-fns"
import type { Event, EventFormData, Category } from "@/interfaces"

interface EventFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    event?: Event | null
    categories: Category[]
    onSubmit: (
        data: EventFormData,
        imageFile?: File
    ) => Promise<{ success: boolean; message?: string }>
    mode: "create" | "edit"
}

const defaultFormData: EventFormData = {
    title: "",
    description: "",
    datetime: "",
    location: "",
    venue: "",
    categoryIds: [],
    pricePerSeat: 0,
    totalSeats: 100,
    seatsPerRow: 10,
    organizerName: "",
    status: "DRAFT",
}

export default function EventFormDialog({
    open,
    onOpenChange,
    event,
    categories,
    onSubmit,
    mode,
}: EventFormDialogProps) {
    const [formData, setFormData] = useState<EventFormData>(defaultFormData)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>()
    const [selectedTime, setSelectedTime] = useState("19:00")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Reset form when dialog opens/closes or event changes
    useEffect(() => {
        if (open) {
            if (mode === "edit" && event) {
                const eventDate = new Date(event.datetime)
                setFormData({
                    title: event.title,
                    description: event.description,
                    datetime: event.datetime,
                    location: event.location,
                    venue: event.venue || "",
                    categoryIds: event.categoryIds || [],
                    pricePerSeat: event.pricePerSeat,
                    totalSeats: event.totalSeats,
                    seatsPerRow: event.seatsPerRow || 10,
                    organizerName: event.organizerName,
                    status: event.status as "PUBLISHED" | "DRAFT",
                })
                setSelectedDate(eventDate)
                setSelectedTime(
                    `${eventDate
                        .getHours()
                        .toString()
                        .padStart(2, "0")}:${eventDate
                        .getMinutes()
                        .toString()
                        .padStart(2, "0")}`
                )
                setImagePreview(event.imageUrl || null)
            } else {
                setFormData(defaultFormData)
                setSelectedDate(undefined)
                setSelectedTime("19:00")
                setImagePreview(null)
            }
            setImageFile(null)
            setErrors({})
        }
    }, [open, event, mode])

    // Update datetime when date or time changes
    useEffect(() => {
        if (selectedDate) {
            const [hours, minutes] = selectedTime.split(":").map(Number)
            const datetime = new Date(selectedDate)
            datetime.setHours(hours, minutes, 0, 0)
            setFormData((prev) => ({
                ...prev,
                datetime: datetime.toISOString(),
            }))
        }
    }, [selectedDate, selectedTime])

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "pricePerSeat" ||
                name === "totalSeats" ||
                name === "seatsPerRow"
                    ? Number(value)
                    : value,
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }))
        }
    }

    const handleCategoryChange = (categoryId: string) => {
        setFormData((prev) => {
            const isSelected = prev.categoryIds.includes(categoryId)
            return {
                ...prev,
                categoryIds: isSelected
                    ? prev.categoryIds.filter((id) => id !== categoryId)
                    : [...prev.categoryIds, categoryId],
            }
        })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors((prev) => ({
                    ...prev,
                    image: "Image size must be less than 5MB",
                }))
                return
            }
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
            setErrors((prev) => ({ ...prev, image: "" }))
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) newErrors.title = "Title is required"
        if (formData.title.length < 3)
            newErrors.title = "Title must be at least 3 characters"

        if (!formData.description.trim())
            newErrors.description = "Description is required"
        if (formData.description.length < 10)
            newErrors.description = "Description must be at least 10 characters"

        if (!formData.datetime) newErrors.datetime = "Date and time is required"

        if (!formData.location.trim())
            newErrors.location = "Location is required"

        if (!formData.venue.trim()) newErrors.venue = "Venue is required"

        if (formData.categoryIds.length === 0)
            newErrors.categories = "At least one category is required"

        if (formData.pricePerSeat < 0)
            newErrors.pricePerSeat = "Price cannot be negative"

        if (formData.totalSeats < 1)
            newErrors.totalSeats = "Must have at least 1 seat"

        if (formData.seatsPerRow < 1)
            newErrors.seatsPerRow = "Seats per row must be at least 1"

        if (!formData.organizerName.trim())
            newErrors.organizerName = "Organizer name is required"

        if (!imagePreview && mode === "create")
            newErrors.image = "Event image is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        // Always validate all fields (required for both draft and publish)
        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        try {
            const result = await onSubmit(formData, imageFile || undefined)
            if (result.success) {
                onOpenChange(false)
            } else {
                setErrors({ submit: result.message || "Failed to save event" })
            }
        } catch (error) {
            setErrors({
                submit:
                    error instanceof Error
                        ? error.message
                        : "Failed to save event",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Create New Event" : "Edit Event"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? "Fill in the details to create a new event. You can save as draft or publish immediately."
                            : "Update the event details below."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {errors.submit && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {errors.submit}
                        </div>
                    )}

                    {/* Title */}
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Event title"
                            required
                            className={errors.title ? "border-red-500" : ""}
                        />
                        {errors.title && (
                            <span className="text-sm text-red-500">
                                {errors.title}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe your event..."
                            rows={4}
                            required
                            className={
                                errors.description ? "border-red-500" : ""
                            }
                        />
                        {errors.description && (
                            <span className="text-sm text-red-500">
                                {errors.description}
                            </span>
                        )}
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`justify-start text-left font-normal ${
                                            !selectedDate
                                                ? "text-muted-foreground"
                                                : ""
                                        } ${
                                            errors.datetime
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {selectedDate
                                            ? format(selectedDate, "PPP")
                                            : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <CalendarComponent
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="time">Time</Label>
                            <Input
                                id="time"
                                type="time"
                                value={selectedTime}
                                onChange={(e) =>
                                    setSelectedTime(e.target.value)
                                }
                                required
                                className={
                                    errors.datetime ? "border-red-500" : ""
                                }
                            />
                        </div>
                    </div>
                    {errors.datetime && (
                        <span className="text-sm text-red-500 -mt-2">
                            {errors.datetime}
                        </span>
                    )}

                    {/* Location and Venue */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="City, Country"
                                required
                                className={
                                    errors.location ? "border-red-500" : ""
                                }
                            />
                            {errors.location && (
                                <span className="text-sm text-red-500">
                                    {errors.location}
                                </span>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="venue">Venue</Label>
                            <Input
                                id="venue"
                                name="venue"
                                value={formData.venue}
                                onChange={handleInputChange}
                                placeholder="Stadium, Theater, etc."
                                required
                                className={errors.venue ? "border-red-500" : ""}
                            />
                            {errors.venue && (
                                <span className="text-sm text-red-500">
                                    {errors.venue}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="grid gap-2">
                        <Label>Categories</Label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <Button
                                    key={category.id}
                                    type="button"
                                    variant={
                                        formData.categoryIds.includes(
                                            category.id
                                        )
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        handleCategoryChange(category.id)
                                    }
                                >
                                    {category.name}
                                </Button>
                            ))}
                        </div>
                        {errors.categories && (
                            <span className="text-sm text-red-500">
                                {errors.categories}
                            </span>
                        )}
                    </div>

                    {/* Price and Seats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="pricePerSeat">
                                Price per Seat ($)
                            </Label>
                            <Input
                                id="pricePerSeat"
                                name="pricePerSeat"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.pricePerSeat}
                                onChange={handleInputChange}
                                required
                                className={
                                    errors.pricePerSeat ? "border-red-500" : ""
                                }
                            />
                            {errors.pricePerSeat && (
                                <span className="text-sm text-red-500">
                                    {errors.pricePerSeat}
                                </span>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="totalSeats">Total Seats</Label>
                            <Input
                                id="totalSeats"
                                name="totalSeats"
                                type="number"
                                min="1"
                                value={formData.totalSeats}
                                onChange={handleInputChange}
                                required
                                className={
                                    errors.totalSeats ? "border-red-500" : ""
                                }
                            />
                            {errors.totalSeats && (
                                <span className="text-sm text-red-500">
                                    {errors.totalSeats}
                                </span>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="seatsPerRow">Seats per Row</Label>
                            <Input
                                id="seatsPerRow"
                                name="seatsPerRow"
                                type="number"
                                min="1"
                                value={formData.seatsPerRow}
                                onChange={handleInputChange}
                                required
                                className={
                                    errors.seatsPerRow ? "border-red-500" : ""
                                }
                            />
                            {errors.seatsPerRow && (
                                <span className="text-sm text-red-500">
                                    {errors.seatsPerRow}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Organizer */}
                    <div className="grid gap-2">
                        <Label htmlFor="organizerName">Organizer Name</Label>
                        <Input
                            id="organizerName"
                            name="organizerName"
                            value={formData.organizerName}
                            onChange={handleInputChange}
                            placeholder="Organization or person name"
                            required
                            className={
                                errors.organizerName ? "border-red-500" : ""
                            }
                        />
                        {errors.organizerName && (
                            <span className="text-sm text-red-500">
                                {errors.organizerName}
                            </span>
                        )}
                    </div>

                    {/* Status */}
                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: "PUBLISHED" | "DRAFT") =>
                                setFormData((prev) => ({
                                    ...prev,
                                    status: value,
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="PUBLISHED">
                                    Published
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Image Upload */}
                    <div className="grid gap-2">
                        <Label>Event Image</Label>
                        <div className="flex items-center gap-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-upload"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {imagePreview ? "Change Image" : "Upload Image"}
                            </Button>
                            {imagePreview && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeImage}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        {errors.image && (
                            <span className="text-sm text-red-500">
                                {errors.image}
                            </span>
                        )}
                        {imagePreview && (
                            <div className="relative w-full h-48 mt-2 rounded-lg overflow-hidden">
                                <Image
                                    src={imagePreview}
                                    alt="Event preview"
                                    fill
                                    sizes="(max-width: 672px) 100vw, 672px"
                                    className="object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {mode === "create"
                                    ? formData.status === "DRAFT"
                                        ? "Saving..."
                                        : "Publishing..."
                                    : "Updating..."}
                            </>
                        ) : mode === "create" ? (
                            formData.status === "DRAFT" ? (
                                "Save as Draft"
                            ) : (
                                "Publish Event"
                            )
                        ) : (
                            "Update Event"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
