const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

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

export interface UserProfile {
    cognitoId: string
    username: string
    email: string
    name: string
    phoneNumber: string | null
    role: string
    tickets: string[]
    createdAt: string
    updatedAt: string
}

class AuthService {
    private getAuthHeader(): HeadersInit {
        const token = localStorage.getItem("accessToken")
        return token
            ? {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
              }
            : {
                  "Content-Type": "application/json",
              }
    }

    async register(data: RegisterData): Promise<RegisterResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Registration failed")
        }

        return response.json()
    }

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Login failed")
        }

        const result = await response.json()

        // Store tokens in localStorage
        if (result.success && result.data) {
            localStorage.setItem("accessToken", result.data.accessToken)
            localStorage.setItem("idToken", result.data.idToken)
            localStorage.setItem("refreshToken", result.data.refreshToken)
            localStorage.setItem("user", JSON.stringify(result.data.user))
        }

        return result
    }

    async confirmSignUp(username: string, code: string) {
        const response = await fetch(`${API_BASE_URL}/auth/confirm`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, code }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Verification failed")
        }

        return response.json()
    }

    async resendCode(username: string) {
        const response = await fetch(`${API_BASE_URL}/auth/resend-code`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to resend code")
        }

        return response.json()
    }

    async forgotPassword(username: string) {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(
                error.message || "Failed to initiate password reset"
            )
        }

        return response.json()
    }

    async resetPassword(username: string, code: string, newPassword: string) {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, code, newPassword }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Password reset failed")
        }

        return response.json()
    }

    async getProfile(): Promise<{ success: boolean; data: UserProfile }> {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: "GET",
            headers: this.getAuthHeader(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to get profile")
        }

        return response.json()
    }

    async getCurrentUser() {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: "GET",
            headers: this.getAuthHeader(),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to get user info")
        }

        return response.json()
    }

    logout() {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("idToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem("accessToken")
    }

    getStoredUser() {
        const userStr = localStorage.getItem("user")
        return userStr ? JSON.parse(userStr) : null
    }
}

export const authService = new AuthService()
