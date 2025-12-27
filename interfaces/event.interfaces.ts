export interface Event {
    id: string
    title: string
    description: string
    date: string
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
