"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import BookingClient from "./BookingClient"

function BookingPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const eventId = searchParams?.get("id")

    // If no event ID, redirect to events page
    if (!eventId) {
        router.push("/events")
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Redirecting...</div>
            </div>
        )
    }

    return <BookingClient eventId={eventId} />
}

export default function BookingPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-lg">Loading...</div>
                </div>
            }
        >
            <BookingPageContent />
        </Suspense>
    )
}
