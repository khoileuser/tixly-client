export interface Event {
    id: string
    title: string
    description: string
    datetime: string
    location: string
    venue: string
    categoryIds: string[]
    pricePerSeat: number
    totalSeats: number
    availableSeats: number
    takenSeats: number[]
    seatsPerRow: number
    status: string // PUBLISHED or DRAFT
    timeStatus: string // upcoming or past
    imageUrl?: string
    organizerName: string
    createdAt?: string
}

export interface EventFormData {
    title: string
    description: string
    datetime: string
    location: string
    venue: string
    categoryIds: string[]
    pricePerSeat: number
    totalSeats: number
    seatsPerRow: number
    organizerName: string
    status: "PUBLISHED" | "DRAFT"
    imageUrl?: string
}

export interface CreateEventRequest extends EventFormData {
    image?: File
}

export interface UpdateEventRequest extends Partial<EventFormData> {
    image?: File
}

export interface EventResponse {
    success: boolean
    data?: Event
    message?: string
}

export interface EventsListResponse {
    success: boolean
    data?: Event[]
    count?: number
    totalCount?: number
    message?: string
}
