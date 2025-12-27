export interface BookingData {
    eventId: string
    seats: number[] // Array of seat numbers (integers)
    pricePerSeat: number
    name?: string
    email?: string
    phone?: string
}

export interface PaymentData {
    cardNumber: string
    expiryDate: string
    cvv: string
    cardholderName: string
}

export interface CustomerInfo {
    name: string
    email: string
    phone: string
}
