export interface RegisterData {
    username: string
    email: string
    password: string
    name: string
    phoneNumber: string
}

export interface LoginData {
    username: string
    password: string
}

export interface AuthResponse {
    success: boolean
    message: string
    data?: {
        idToken: string
        accessToken: string
        refreshToken: string
        expiresIn: number
        user: {
            cognitoId: string
            email: string
            username: string
            emailVerified: boolean
        }
    }
}

export interface RegisterResponse {
    success: boolean
    message: string
    data?: {
        cognitoId: string
        username: string
        email: string
        userConfirmed: boolean
    }
}

export interface Ticket {
    id: string
    eventId: string
    userId: string
    status: string
    pricePerSeat: number
    takenSeats: number[]
    purchaseDate: string
    createdAt: string
    updatedAt: string
    name?: string
    email?: string
    phone?: string
    event?: {
        id: string
        title: string
        description: string
        date: string
        location: string
        venue: string
        pricePerSeat: number
        imageUrl?: string
    } | null
}

export interface UserProfile {
    cognitoId: string
    username: string
    email: string
    name: string
    phoneNumber: string | null
    role: string
    tickets: Ticket[]
    createdAt: string
    updatedAt: string
}
