const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

export interface BookingData {
    eventId: string
    seats: number[]
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

const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken")
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    }
}

export const bookingService = {
    // Get booked seats for an event
    async getBookedSeats(eventId: string): Promise<number[]> {
        const response = await fetch(
            `${API_BASE_URL}/events/${eventId}/seats`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to fetch booked seats")
        }

        const result = await response.json()
        return result.data.bookedSeats
    },

    // Create a booking
    async createBooking(bookingData: BookingData) {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(bookingData),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to create booking")
        }

        return await response.json()
    },

    // Get booking by ID
    async getBookingById(ticketId: string) {
        const response = await fetch(`${API_BASE_URL}/bookings/${ticketId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to fetch booking")
        }

        return await response.json()
    },

    // Confirm booking with payment
    async confirmBooking(ticketId: string, paymentData: PaymentData) {
        const response = await fetch(
            `${API_BASE_URL}/bookings/${ticketId}/confirm`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(paymentData),
            }
        )

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to confirm booking")
        }

        return await response.json()
    },

    // Update customer info
    async updateCustomerInfo(ticketId: string, customerInfo: CustomerInfo) {
        const response = await fetch(
            `${API_BASE_URL}/bookings/${ticketId}/customer-info`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(customerInfo),
            }
        )

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to update customer info")
        }

        return await response.json()
    },

    // Cancel booking
    async cancelBooking(ticketId: string) {
        const response = await fetch(`${API_BASE_URL}/bookings/${ticketId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to cancel booking")
        }

        return await response.json()
    },

    // Get user's bookings
    async getUserBookings() {
        const response = await fetch(`${API_BASE_URL}/my-bookings`, {
            method: "GET",
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to fetch bookings")
        }

        return await response.json()
    },
}
