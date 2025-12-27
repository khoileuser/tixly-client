"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import BookingTimer from "@/components/booking-timer"
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Loader2,
    AlertCircle,
    CreditCard,
    User,
    MapPin,
} from "lucide-react"
import { bookingService } from "@/lib/booking"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Event } from "@/interfaces"

type BookingStep = "seats" | "payment" | "info" | "confirmation"

export default function BookingPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id: eventId } = use(params)
    const router = useRouter()

    // Event data
    const [event, setEvent] = useState<Event | null>(null)
    const [isLoadingEvent, setIsLoadingEvent] = useState(true)

    // Booking state
    const [currentStep, setCurrentStep] = useState<BookingStep>("seats")
    const [bookingId, setBookingId] = useState<string | null>(null)
    const [expiresAt, setExpiresAt] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    // Seat selection
    const [bookedSeats, setBookedSeats] = useState<number[]>([])
    const [selectedSeats, setSelectedSeats] = useState<number[]>([])

    // Payment info
    const [paymentData, setPaymentData] = useState({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
    })
    const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>(
        {}
    )

    // Customer info
    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        email: "",
        phone: "",
    })
    const [useRegisteredInfo, setUseRegisteredInfo] = useState(true)

    // Restore booking state from sessionStorage on mount
    useEffect(() => {
        const savedBookingState = sessionStorage.getItem(`booking_${eventId}`)
        if (savedBookingState) {
            try {
                const state = JSON.parse(savedBookingState)

                // Check if the booking hasn't expired
                if (state.expiresAt) {
                    const expiryTime = new Date(state.expiresAt).getTime()
                    const now = Date.now()

                    if (now < expiryTime) {
                        // Restore the booking state
                        setCurrentStep(state.currentStep || "seats")
                        setBookingId(state.bookingId || null)
                        setExpiresAt(state.expiresAt || null)
                        setSelectedSeats(state.selectedSeats || [])
                        if (state.customerInfo) {
                            setCustomerInfo(state.customerInfo)
                        }
                    } else {
                        // Booking expired, clear it
                        sessionStorage.removeItem(`booking_${eventId}`)
                    }
                }
            } catch (error) {
                console.error("Error restoring booking state:", error)
                sessionStorage.removeItem(`booking_${eventId}`)
            }
        }
    }, [eventId])

    // Save booking state to sessionStorage whenever it changes
    useEffect(() => {
        if (bookingId) {
            const bookingState = {
                currentStep,
                bookingId,
                expiresAt,
                selectedSeats,
                customerInfo,
            }
            sessionStorage.setItem(
                `booking_${eventId}`,
                JSON.stringify(bookingState)
            )
        }
    }, [
        currentStep,
        bookingId,
        expiresAt,
        selectedSeats,
        customerInfo,
        eventId,
    ])

    // Fetch event details
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`
                )
                const result = await response.json()
                if (result.success) {
                    setEvent(result.data)
                }
            } catch (err) {
                console.error("Error fetching event:", err)
            } finally {
                setIsLoadingEvent(false)
            }
        }
        fetchEvent()
    }, [eventId])

    // Fetch booked seats
    useEffect(() => {
        const fetchBookedSeats = async () => {
            try {
                const seats = await bookingService.getBookedSeats(eventId)
                setBookedSeats(seats)
            } catch (err) {
                console.error("Error fetching booked seats:", err)
            }
        }
        fetchBookedSeats()
    }, [eventId])

    // Load user info from localStorage and fetch full profile
    useEffect(() => {
        const loadUserInfo = async () => {
            const token = localStorage.getItem("accessToken")

            if (!token) {
                console.warn("No access token found, redirecting to login")
                router.push("/login")
                return
            }

            try {
                // Fetch full user profile from API to get complete info
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (response.ok) {
                    const result = await response.json()
                    if (result.success && result.data) {
                        setCustomerInfo({
                            name:
                                result.data.name || result.data.username || "",
                            email: result.data.email || "",
                            phone: result.data.phoneNumber || "",
                        })
                    }
                } else {
                    // Fallback to localStorage if API fails
                    const user = localStorage.getItem("user")
                    if (user) {
                        const userData = JSON.parse(user)
                        setCustomerInfo({
                            name: userData.name || userData.username || "",
                            email: userData.email || "",
                            phone: userData.phoneNumber || "",
                        })
                    }
                }
            } catch (error) {
                console.error("Error loading user profile:", error)
                // Fallback to localStorage
                const user = localStorage.getItem("user")
                if (user) {
                    const userData = JSON.parse(user)
                    setCustomerInfo({
                        name: userData.name || userData.username || "",
                        email: userData.email || "",
                        phone: userData.phoneNumber || "",
                    })
                }
            }
        }

        loadUserInfo()
    }, [router])

    const handleBookingExpired = async () => {
        if (bookingId) {
            try {
                await bookingService.cancelBooking(bookingId)
                // Booking successfully cancelled (or already deleted)
            } catch (err) {
                // Only log unexpected errors (not 404s, which are handled in the service)
                console.error("Error cancelling expired booking:", err)
            }
        }
        // Clear the saved booking state
        sessionStorage.removeItem(`booking_${eventId}`)
        router.push(`/events/${eventId}`)
    }

    const handleSeatToggle = (seat: number) => {
        setSelectedSeats((prev) =>
            prev.includes(seat)
                ? prev.filter((s) => s !== seat)
                : [...prev, seat]
        )
    }

    const handleCreateBooking = async () => {
        if (selectedSeats.length === 0) {
            setError("Please select at least one seat")
            return
        }

        // Check if user is authenticated
        const token = localStorage.getItem("accessToken")
        if (!token) {
            setError("Please log in to continue booking")
            router.push("/login")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const result = await bookingService.createBooking({
                eventId,
                seats: selectedSeats,
                pricePerSeat: event?.pricePerSeat || 0,
                ...customerInfo,
            })

            setBookingId(result.data.id)
            setExpiresAt(result.data.expiresAt)
            setCurrentStep("payment")
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to create booking"

            // If authentication error, redirect to login
            if (
                errorMessage.includes("token") ||
                errorMessage.includes("auth") ||
                errorMessage.includes("Unauthorized")
            ) {
                setError("Your session has expired. Please log in again.")
                setTimeout(() => {
                    router.push("/login")
                }, 2000)
            } else {
                setError(errorMessage)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const validatePayment = () => {
        const errors: Record<string, string> = {}

        // Validate card number (Visa or Mastercard)
        const cardNumber = paymentData.cardNumber.replace(/\s/g, "")
        if (!cardNumber) {
            errors.cardNumber = "Card number is required"
        } else if (!/^\d{16}$/.test(cardNumber)) {
            errors.cardNumber = "Card number must be 16 digits"
        } else if (!cardNumber.startsWith("4") && !cardNumber.startsWith("5")) {
            errors.cardNumber = "Only Visa (4) or Mastercard (5) accepted"
        }

        // Validate expiry date (MM/YY)
        if (!paymentData.expiryDate) {
            errors.expiryDate = "Expiry date is required"
        } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
            errors.expiryDate = "Format must be MM/YY"
        } else {
            const [month, year] = paymentData.expiryDate.split("/")
            const currentDate = new Date()
            const currentYear = currentDate.getFullYear() % 100
            const currentMonth = currentDate.getMonth() + 1

            if (
                parseInt(month) < 1 ||
                parseInt(month) > 12 ||
                parseInt(year) < currentYear ||
                (parseInt(year) === currentYear &&
                    parseInt(month) < currentMonth)
            ) {
                errors.expiryDate = "Card has expired or invalid date"
            }
        }

        // Validate CVV
        if (!paymentData.cvv) {
            errors.cvv = "CVV is required"
        } else if (!/^\d{3,4}$/.test(paymentData.cvv)) {
            errors.cvv = "CVV must be 3 or 4 digits"
        }

        // Validate cardholder name
        if (!paymentData.cardholderName.trim()) {
            errors.cardholderName = "Cardholder name is required"
        }

        setPaymentErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleConfirmPayment = async () => {
        if (!validatePayment() || !bookingId) return

        setIsLoading(true)
        setError("")

        try {
            await bookingService.confirmBooking(bookingId, paymentData)
            // Clear the timer since payment is confirmed
            setExpiresAt(null)
            setCurrentStep("info")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Payment failed")
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateCustomerInfo = async () => {
        if (!bookingId) return

        setIsLoading(true)
        setError("")

        try {
            if (!useRegisteredInfo) {
                await bookingService.updateCustomerInfo(bookingId, customerInfo)
            }
            setCurrentStep("confirmation")
            // Clear the saved booking state on successful completion
            sessionStorage.removeItem(`booking_${eventId}`)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update customer info"
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancelBooking = async () => {
        if (!bookingId) return

        // Confirm cancellation with user
        if (!confirm("Are you sure you want to cancel this booking? Your seat selection will be released.")) {
            return
        }

        setIsLoading(true)
        setError("")

        try {
            await bookingService.cancelBooking(bookingId)
            // Clear the saved booking state
            sessionStorage.removeItem(`booking_${eventId}`)
            // Redirect back to event page
            router.push(`/events/${eventId}`)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to cancel booking"
            )
        } finally {
            setIsLoading(false)
        }
    }

    const generateSeats = () => {
        if (!event) return []

        const totalSeats = event.totalSeats
        const seats: number[] = []

        // Generate seats as sequential numbers from 1 to totalSeats
        for (let i = 1; i <= totalSeats; i++) {
            seats.push(i)
        }

        return seats
    }

    const getSeatsPerRow = () => {
        if (!event) return 10

        // Use seatsPerRow from the event if available
        if (event.seatsPerRow) return event.seatsPerRow

        const totalSeats = event.totalSeats
        let seatsPerRow = Math.ceil(Math.sqrt(totalSeats))

        if (seatsPerRow < 8) seatsPerRow = Math.min(8, totalSeats)
        if (seatsPerRow > 20) seatsPerRow = 20

        return seatsPerRow
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price)
    }

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, "")
        const groups = cleaned.match(/.{1,4}/g) || []
        return groups.join(" ")
    }

    if (isLoadingEvent) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card>
                    <CardContent className="pt-6">
                        <p>Event not found</p>
                        <Link href="/events">
                            <Button className="mt-4">Back to Events</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const totalPrice = (event.pricePerSeat || 0) * selectedSeats.length

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-3 pt-8">
                <Link
                    href="/events"
                    className="text-sm text-gray-600 hover:text-blue-600 inline-flex items-center"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Events
                </Link>
            </div>

            <div className="container mx-auto px-4 py-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                    <p className="text-gray-600">{event.location}</p>
                </div>

                {/* Timer */}
                {expiresAt && (
                    <BookingTimer
                        expiresAt={expiresAt}
                        onExpired={handleBookingExpired}
                    />
                )}

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[
                            { key: "seats", label: "Select Seats" },
                            { key: "payment", label: "Payment" },
                            { key: "info", label: "Your Info" },
                            { key: "confirmation", label: "Confirmation" },
                        ].map((step, index) => (
                            <div
                                key={step.key}
                                className="flex items-center flex-1"
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                        currentStep === step.key
                                            ? "bg-blue-600 text-white"
                                            : index <
                                              [
                                                  "seats",
                                                  "payment",
                                                  "info",
                                                  "confirmation",
                                              ].indexOf(currentStep)
                                            ? "bg-green-600 text-white"
                                            : "bg-gray-300 text-gray-600"
                                    }`}
                                >
                                    {index <
                                    [
                                        "seats",
                                        "payment",
                                        "info",
                                        "confirmation",
                                    ].indexOf(currentStep) ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <span className="ml-2 text-sm font-medium hidden md:inline">
                                    {step.label}
                                </span>
                                {index < 3 && (
                                    <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {/* Step 1: Seat Selection */}
                        {currentStep === "seats" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Select Your Seats</CardTitle>
                                    <CardDescription>
                                        Choose one or more seats for the event (
                                        {event.totalSeats} total seats
                                        available)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-6">
                                        <div className="flex gap-4 text-sm mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                                                <span>Available</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-blue-600 border-2 border-blue-700 rounded"></div>
                                                <span>Selected</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-gray-300 border-2 border-gray-400 rounded"></div>
                                                <span>Booked</span>
                                            </div>
                                        </div>

                                        {/* Venue size indicator */}
                                        <div className="text-center text-sm text-gray-600 mb-3">
                                            {event.totalSeats <= 100 &&
                                                "Intimate Venue"}
                                            {event.totalSeats > 100 &&
                                                event.totalSeats <= 500 &&
                                                "Small Venue"}
                                            {event.totalSeats > 500 &&
                                                event.totalSeats <= 2000 &&
                                                "Medium Venue"}
                                            {event.totalSeats > 2000 &&
                                                "Large Venue"}
                                            {" • "}
                                            {getSeatsPerRow()} seats per row
                                        </div>

                                        <div className="text-center mb-4 py-2 bg-gray-200 rounded">
                                            <MapPin className="inline h-4 w-4 mr-1" />
                                            STAGE
                                        </div>

                                        <div className="overflow-x-auto">
                                            <div
                                                className="grid gap-2"
                                                style={{
                                                    gridTemplateColumns: `repeat(${getSeatsPerRow()}, minmax(48px, 1fr))`,
                                                    minWidth: "min-content",
                                                }}
                                            >
                                                {generateSeats().map((seat) => {
                                                    const isBooked =
                                                        bookedSeats.includes(
                                                            seat
                                                        )
                                                    const isSelected =
                                                        selectedSeats.includes(
                                                            seat
                                                        )

                                                    return (
                                                        <button
                                                            key={seat}
                                                            onClick={() =>
                                                                !isBooked &&
                                                                handleSeatToggle(
                                                                    seat
                                                                )
                                                            }
                                                            disabled={isBooked}
                                                            className={`aspect-square min-w-12 min-h-12 text-xs font-medium rounded border-2 transition-all ${
                                                                isBooked
                                                                    ? "bg-gray-300 border-gray-400 cursor-not-allowed text-gray-500"
                                                                    : isSelected
                                                                    ? "bg-blue-600 border-blue-700 text-white"
                                                                    : "bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                                                            }`}
                                                        >
                                                            {seat}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 2: Payment */}
                        {currentStep === "payment" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Information</CardTitle>
                                    <CardDescription>
                                        Enter your card details (Visa or
                                        Mastercard only)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cardNumber">
                                            Card Number
                                        </Label>
                                        <Input
                                            id="cardNumber"
                                            placeholder="4111 1111 1111 1111"
                                            value={paymentData.cardNumber}
                                            onChange={(e) => {
                                                const formatted =
                                                    formatCardNumber(
                                                        e.target.value
                                                            .replace(/\D/g, "")
                                                            .slice(0, 16)
                                                    )
                                                setPaymentData({
                                                    ...paymentData,
                                                    cardNumber: formatted,
                                                })
                                            }}
                                            className={
                                                paymentErrors.cardNumber
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        {paymentErrors.cardNumber && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {paymentErrors.cardNumber}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="expiryDate">
                                                Expiry Date
                                            </Label>
                                            <Input
                                                id="expiryDate"
                                                placeholder="MM/YY"
                                                value={paymentData.expiryDate}
                                                onChange={(e) => {
                                                    let value =
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            ""
                                                        )
                                                    if (value.length >= 2) {
                                                        value =
                                                            value.slice(0, 2) +
                                                            "/" +
                                                            value.slice(2, 4)
                                                    }
                                                    setPaymentData({
                                                        ...paymentData,
                                                        expiryDate: value,
                                                    })
                                                }}
                                                maxLength={5}
                                                className={
                                                    paymentErrors.expiryDate
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            />
                                            {paymentErrors.expiryDate && (
                                                <p className="text-sm text-red-500 mt-1">
                                                    {paymentErrors.expiryDate}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="cvv">CVV</Label>
                                            <Input
                                                id="cvv"
                                                placeholder="123"
                                                type="password"
                                                value={paymentData.cvv}
                                                onChange={(e) =>
                                                    setPaymentData({
                                                        ...paymentData,
                                                        cvv: e.target.value
                                                            .replace(/\D/g, "")
                                                            .slice(0, 4),
                                                    })
                                                }
                                                maxLength={4}
                                                className={
                                                    paymentErrors.cvv
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            />
                                            {paymentErrors.cvv && (
                                                <p className="text-sm text-red-500 mt-1">
                                                    {paymentErrors.cvv}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cardholderName">
                                            Cardholder Name
                                        </Label>
                                        <Input
                                            id="cardholderName"
                                            placeholder="John Doe"
                                            value={paymentData.cardholderName}
                                            onChange={(e) =>
                                                setPaymentData({
                                                    ...paymentData,
                                                    cardholderName:
                                                        e.target.value,
                                                })
                                            }
                                            className={
                                                paymentErrors.cardholderName
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        {paymentErrors.cardholderName && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {paymentErrors.cardholderName}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Customer Info */}
                        {currentStep === "info" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ticket Information</CardTitle>
                                    <CardDescription>
                                        Confirm or update the information for
                                        your ticket
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <input
                                            type="checkbox"
                                            id="useRegistered"
                                            checked={useRegisteredInfo}
                                            onChange={(e) =>
                                                setUseRegisteredInfo(
                                                    e.target.checked
                                                )
                                            }
                                            className="w-4 h-4"
                                        />
                                        <Label
                                            htmlFor="useRegistered"
                                            className="cursor-pointer"
                                        >
                                            Use my registered information
                                        </Label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customerName">
                                            Full Name
                                        </Label>
                                        <Input
                                            id="customerName"
                                            value={customerInfo.name}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    name: e.target.value,
                                                })
                                            }
                                            disabled={useRegisteredInfo}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customerEmail">
                                            Email
                                        </Label>
                                        <Input
                                            id="customerEmail"
                                            type="email"
                                            value={customerInfo.email}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    email: e.target.value,
                                                })
                                            }
                                            disabled={useRegisteredInfo}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customerPhone">
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="customerPhone"
                                            type="tel"
                                            value={customerInfo.phone}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    phone: e.target.value,
                                                })
                                            }
                                            disabled={useRegisteredInfo}
                                            placeholder="+1234567890"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 4: Confirmation */}
                        {currentStep === "confirmation" && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <Check className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <CardTitle>
                                                Booking Confirmed!
                                            </CardTitle>
                                            <CardDescription>
                                                Your tickets have been
                                                successfully booked
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="font-semibold mb-2">
                                            Booking ID:
                                        </p>
                                        <p className="font-mono text-sm">
                                            {bookingId}
                                        </p>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <strong>Event:</strong>{" "}
                                            {event.title}
                                        </p>
                                        <p>
                                            <strong>Seats:</strong>{" "}
                                            {selectedSeats.join(", ")}
                                        </p>
                                        <p>
                                            <strong>Total Paid:</strong>{" "}
                                            {formatPrice(totalPrice)}
                                        </p>
                                    </div>

                                    <p className="text-sm text-gray-600">
                                        A confirmation email has been sent to{" "}
                                        {customerInfo.email}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Sidebar - Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Event
                                    </p>
                                    <p className="font-semibold">
                                        {event.title}
                                    </p>
                                </div>

                                {selectedSeats.length > 0 && (
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Selected Seats
                                            </p>
                                            <p className="font-semibold">
                                                {selectedSeats.join(", ")}
                                            </p>
                                        </div>

                                        <div className="border-t pt-4">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-gray-600">
                                                    Price (
                                                    {selectedSeats.length}{" "}
                                                    ticket
                                                    {selectedSeats.length > 1
                                                        ? "s"
                                                        : ""}
                                                    )
                                                </span>
                                                <span>
                                                    {formatPrice(totalPrice)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total</span>
                                                <span>
                                                    {formatPrice(totalPrice)}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>

                            {/* Action Buttons */}
                            <CardContent className="pt-0">
                                {/* Step 1: Seat Selection Button */}
                                {currentStep === "seats" && (
                                    <Button
                                        onClick={handleCreateBooking}
                                        disabled={
                                            selectedSeats.length === 0 ||
                                            isLoading
                                        }
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Continue to Payment
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                )}

                                {/* Step 2: Payment Button */}
                                {currentStep === "payment" && (
                                    <>
                                        <Button
                                            onClick={handleConfirmPayment}
                                            disabled={isLoading}
                                            className="w-full"
                                            size="lg"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Processing Payment...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Confirm Payment
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={handleCancelBooking}
                                            disabled={isLoading}
                                            variant="outline"
                                            className="w-full mt-2"
                                            size="lg"
                                        >
                                            Cancel Booking
                                        </Button>
                                    </>
                                )}

                                {/* Step 3: Customer Info Button */}
                                {currentStep === "info" && (
                                    <Button
                                        onClick={handleUpdateCustomerInfo}
                                        disabled={isLoading}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                Continue
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                )}

                                {/* Step 4: Confirmation Buttons */}
                                {currentStep === "confirmation" && (
                                    <div>
                                        <Link href="/events">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                size="lg"
                                            >
                                                Browse More Events
                                            </Button>
                                        </Link>
                                        <Link href="/profile">
                                            <Button
                                                className="w-full mt-2"
                                                size="lg"
                                            >
                                                <User className="mr-2 h-4 w-4" />
                                                View My Bookings
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
