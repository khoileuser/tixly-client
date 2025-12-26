import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Ticket, Calendar, Shield, Zap } from "lucide-react"

export default function Home() {
    return (
        <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center max-w-3xl mx-auto">
                    <div className="flex justify-center mb-6">
                        <Ticket className="h-16 w-16 text-blue-600" />
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Welcome to Tixly
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Your premier event ticketing platform. Discover and
                        attend amazing events happening near you.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/events">
                            <Button size="lg" className="w-full sm:w-auto">
                                <Calendar className="mr-2 h-5 w-5" />
                                Browse Events
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="text-center p-6">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            Wide Selection
                        </h3>
                        <p className="text-gray-600">
                            Discover events across music, sports, theater,
                            comedy, and more.
                        </p>
                    </div>
                    <div className="text-center p-6">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Shield className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            Secure Booking
                        </h3>
                        <p className="text-gray-600">
                            Safe and secure ticket purchasing with instant
                            confirmation.
                        </p>
                    </div>
                    <div className="text-center p-6">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Zap className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            Instant Access
                        </h3>
                        <p className="text-gray-600">
                            Get your tickets instantly with mobile-friendly QR
                            codes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
