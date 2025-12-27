"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { authService, UserProfile, Ticket } from "@/lib/auth"
import {
    Loader2,
    User,
    Mail,
    Phone,
    Shield,
    Calendar,
    MapPin,
    CreditCard,
    Ticket as TicketIcon,
} from "lucide-react"

export default function ProfilePage() {
    const router = useRouter()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        const loadProfile = async () => {
            try {
                if (!authService.isAuthenticated()) {
                    router.push("/login")
                    return
                }

                const result = await authService.getProfile()
                if (result.success) {
                    setProfile(result.data)
                }
            } catch (error) {
                console.error("Failed to load profile:", error)
                authService.logout()
                router.push("/login")
            } finally {
                setIsLoading(false)
            }
        }

        loadProfile()
    }, [router])

    const handleTicketClick = (ticket: Ticket) => {
        setSelectedTicket(ticket)
        setIsDialogOpen(true)
    }

    const handleContinueBooking = () => {
        if (selectedTicket && selectedTicket.eventId) {
            setIsDialogOpen(false)
            router.push(`/booking/${selectedTicket.eventId}`)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!profile) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-12">
            <div className="mx-auto max-w-4xl">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Your account details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Full Name
                                    </p>
                                    <p className="font-medium">
                                        {profile.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Username
                                    </p>
                                    <p className="font-medium">
                                        {profile.username}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Email
                                    </p>
                                    <p className="font-medium">
                                        {profile.email}
                                    </p>
                                </div>
                            </div>

                            {profile.phoneNumber && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Phone
                                        </p>
                                        <p className="font-medium">
                                            {profile.phoneNumber}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Role
                                    </p>
                                    <p className="font-medium capitalize">
                                        {profile.role}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    Cognito ID:
                                </span>
                                <span className="font-mono text-xs">
                                    {profile.cognitoId}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    Account Created:
                                </span>
                                <span>
                                    {new Date(
                                        profile.createdAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    Last Updated:
                                </span>
                                <span>
                                    {new Date(
                                        profile.updatedAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>My Tickets</CardTitle>
                            <CardDescription>
                                Your purchased tickets
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {profile.tickets.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    <p className="mb-4">No tickets yet</p>
                                    <Link href="/events">
                                        <Button>Browse Events</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {profile.tickets.map((ticket) => (
                                        <button
                                            key={ticket.id}
                                            onClick={() =>
                                                handleTicketClick(ticket)
                                            }
                                            className="w-full text-left rounded-lg border p-4 hover:border-blue-400 hover:shadow-md transition-all"
                                        >
                                            {ticket.event ? (
                                                <>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-lg">
                                                                {
                                                                    ticket.event
                                                                        .title
                                                                }
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {
                                                                    ticket.event
                                                                        .location
                                                                }
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                                ticket.status ===
                                                                "CONFIRMED"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : ticket.status ===
                                                                      "PENDING"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            {ticket.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm space-y-1">
                                                        <p className="text-gray-600">
                                                            <strong>
                                                                Date:
                                                            </strong>{" "}
                                                            {new Date(
                                                                ticket.event.date
                                                            ).toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    weekday:
                                                                        "short",
                                                                    year: "numeric",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                }
                                                            )}
                                                        </p>
                                                        <p className="text-gray-600">
                                                            <strong>
                                                                Seats:
                                                            </strong>{" "}
                                                            {ticket.takenSeats.join(
                                                                ", "
                                                            )}
                                                        </p>
                                                        <p className="text-gray-600">
                                                            <strong>
                                                                Total:
                                                            </strong>{" "}
                                                            $
                                                            {(
                                                                ticket.pricePerSeat *
                                                                ticket
                                                                    .takenSeats
                                                                    .length
                                                            ).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-sm text-gray-500">
                                                    <p className="font-medium">
                                                        Ticket ID: {ticket.id}
                                                    </p>
                                                    <p>
                                                        Event information not
                                                        available
                                                    </p>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Ticket Details Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <TicketIcon className="h-5 w-5" />
                                Ticket Details
                            </DialogTitle>
                            <DialogDescription>
                                Complete information about your ticket
                            </DialogDescription>
                        </DialogHeader>

                        {selectedTicket && (
                            <div className="space-y-6">
                                {/* Status Badge */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        Status
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            selectedTicket.status ===
                                            "CONFIRMED"
                                                ? "bg-green-100 text-green-800"
                                                : selectedTicket.status ===
                                                  "PENDING"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                        {selectedTicket.status}
                                    </span>
                                </div>

                                {/* Event Information */}
                                {selectedTicket.event && (
                                    <div className="space-y-4">
                                        <div className="border-b pb-3">
                                            <h3 className="font-semibold text-lg mb-1">
                                                {selectedTicket.event.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {
                                                    selectedTicket.event
                                                        .description
                                                }
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-5 gap-4">
                                            <div className="flex items-start gap-3 col-span-2">
                                                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Event Date
                                                    </p>
                                                    <p className="font-medium">
                                                        {new Date(
                                                            selectedTicket.event.date
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                weekday: "long",
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 col-span-3">
                                                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Location
                                                    </p>
                                                    <p className="font-medium">
                                                        {
                                                            selectedTicket.event
                                                                .location
                                                        }
                                                    </p>
                                                    {selectedTicket.event
                                                        .venue && (
                                                        <p className="text-sm text-gray-600">
                                                            {
                                                                selectedTicket
                                                                    .event.venue
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Ticket Information */}
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            Ticket ID
                                        </span>
                                        <span className="font-mono text-sm">
                                            {selectedTicket.id}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            Seats
                                        </span>
                                        <span className="font-medium">
                                            {selectedTicket.takenSeats.join(
                                                ", "
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            Price per Seat
                                        </span>
                                        <span className="font-medium">
                                            $
                                            {selectedTicket.pricePerSeat.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-t pt-3">
                                        <span className="font-semibold">
                                            Total Amount
                                        </span>
                                        <span className="font-bold text-lg">
                                            $
                                            {(
                                                selectedTicket.pricePerSeat *
                                                selectedTicket.takenSeats.length
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                {(selectedTicket.name ||
                                    selectedTicket.email ||
                                    selectedTicket.phone) && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm text-gray-700">
                                            Customer Information
                                        </h4>
                                        {selectedTicket.name && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Name
                                                </span>
                                                <span className="font-medium">
                                                    {selectedTicket.name}
                                                </span>
                                            </div>
                                        )}
                                        {selectedTicket.email && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Email
                                                </span>
                                                <span className="font-medium">
                                                    {selectedTicket.email}
                                                </span>
                                            </div>
                                        )}
                                        {selectedTicket.phone && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Phone
                                                </span>
                                                <span className="font-medium">
                                                    {selectedTicket.phone}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Purchase Date */}
                                <div className="text-xs text-gray-500 text-center pt-2 border-t">
                                    Purchased on{" "}
                                    {new Date(
                                        selectedTicket.purchaseDate ||
                                            selectedTicket.createdAt
                                    ).toLocaleString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    {selectedTicket.status === "PENDING" && (
                                        <Button
                                            onClick={handleContinueBooking}
                                            className="flex-1"
                                        >
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Continue Booking
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => setIsDialogOpen(false)}
                                        variant="outline"
                                        className={
                                            selectedTicket.status === "PENDING"
                                                ? "flex-1"
                                                : "w-full"
                                        }
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
