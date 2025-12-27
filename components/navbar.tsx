"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Ticket, Menu, X, User, LogOut } from "lucide-react"
import { useState, useEffect } from "react"

export default function Navbar() {
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [authState, setAuthState] = useState<{
        isLoggedIn: boolean
        userName: string
        userRole: string
    }>({
        isLoggedIn: false,
        userName: "",
        userRole: "user",
    })

    // Function to check auth state
    const checkAuthState = () => {
        const token = localStorage.getItem("accessToken")
        const userName = localStorage.getItem("userName")
        const userRole = localStorage.getItem("userRole") || "user"

        setAuthState({
            isLoggedIn: !!token,
            userName: userName || "User",
            userRole,
        })
    }

    useEffect(() => {
        // Check auth state on mount (async to avoid cascading renders)
        setTimeout(() => checkAuthState(), 0)

        // Listen for storage changes (when user logs in/out in another tab)
        const handleStorageChange = () => {
            checkAuthState()
        }

        window.addEventListener("storage", handleStorageChange)

        // Also listen for custom auth event (for same-tab login)
        window.addEventListener("authStateChanged", handleStorageChange)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
            window.removeEventListener("authStateChanged", handleStorageChange)
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("idToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("userName")
        localStorage.removeItem("userRole")
        setAuthState({ isLoggedIn: false, userName: "", userRole: "user" })
        window.location.href = "/"
    }

    const isActive = (path: string) => {
        return pathname === path
    }

    return (
        <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex items-center h-16">
                    {/* Logo */}
                    <div className="flex-1">
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-bold text-xl w-fit"
                        >
                            <Ticket className="h-6 w-6 text-blue-600" />
                            <span className="text-gray-900">Tixly</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation - Centered */}
                    <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
                        <Link
                            href="/"
                            className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1 ${
                                isActive("/") || pathname === "/"
                                    ? "text-blue-600"
                                    : "text-gray-700"
                            }`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/events"
                            className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                                isActive("/events") ||
                                pathname.startsWith("/events")
                                    ? "text-blue-600"
                                    : "text-gray-700"
                            }`}
                        >
                            Events
                        </Link>
                        {authState.userRole === "admin" && (
                            <Link
                                href="/analytics"
                                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                                    isActive("/analytics") ||
                                    pathname.startsWith("/analytics")
                                        ? "text-blue-600"
                                        : "text-gray-700"
                                }`}
                            >
                                Analytics
                            </Link>
                        )}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
                        {authState.isLoggedIn ? (
                            <>
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    <User className="h-4 w-4" />
                                    <span>{authState.userName}</span>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Sign Up</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <div className="flex flex-col gap-4">
                            <Link
                                href="/"
                                className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-2 ${
                                    isActive("/") || pathname === "/"
                                        ? "text-blue-600"
                                        : "text-gray-700"
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/events"
                                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                                    isActive("/events") ||
                                    pathname.startsWith("/events")
                                        ? "text-blue-600"
                                        : "text-gray-700"
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Events
                            </Link>
                            {authState.userRole === "admin" && (
                                <Link
                                    href="/analytics"
                                    className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                                        isActive("/analytics") ||
                                        pathname.startsWith("/analytics")
                                            ? "text-blue-600"
                                            : "text-gray-700"
                                    }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Analytics
                                </Link>
                            )}

                            <div className="pt-4 border-t flex flex-col gap-3">
                                {authState.isLoggedIn ? (
                                    <>
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <User className="h-4 w-4" />
                                            <span>{authState.userName}</span>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleLogout}
                                            className="w-full"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full"
                                            >
                                                Login
                                            </Button>
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Button
                                                size="sm"
                                                className="w-full"
                                            >
                                                Sign Up
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
