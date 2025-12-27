"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BookingTimerProps {
    expiresAt: string
    onExpired: () => void
}

export default function BookingTimer({
    expiresAt,
    onExpired,
}: BookingTimerProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0)

    useEffect(() => {
        const calculateTimeLeft = () => {
            const expiry = new Date(expiresAt).getTime()
            const now = new Date().getTime()
            const diff = expiry - now

            if (diff <= 0) {
                setTimeLeft(0)
                onExpired()
                return 0
            }

            return Math.floor(diff / 1000) // Convert to seconds
        }

        // Calculate initial time (async to avoid cascading renders)
        setTimeout(() => setTimeLeft(calculateTimeLeft()), 0)

        // Update every second
        const interval = setInterval(() => {
            const remaining = calculateTimeLeft()
            setTimeLeft(remaining)
        }, 1000)

        return () => clearInterval(interval)
    }, [expiresAt, onExpired])

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    const isLowTime = minutes < 5

    return (
        <Alert
            variant={isLowTime ? "destructive" : "default"}
            className="mb-6 items-baseline"
        >
            <Clock className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
                <span className="font-medium">
                    {timeLeft > 0 ? (
                        <>
                            Time remaining to complete your booking:{" "}
                            <span className="text-md font-bold">
                                {minutes.toString().padStart(2, "0")}:
                                {seconds.toString().padStart(2, "0")}
                            </span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="inline h-4 w-4 mr-1" />
                            Your booking has expired
                        </>
                    )}
                </span>
            </AlertDescription>
        </Alert>
    )
}
