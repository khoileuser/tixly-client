"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { authService } from "@/lib/auth"
import { AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState<"request" | "reset">("request")
    const [identifier, setIdentifier] = useState("")
    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (!identifier) {
            setError("Please enter your username or email")
            return
        }

        setIsLoading(true)

        try {
            const result = await authService.forgotPassword(identifier)

            if (result.success) {
                setSuccess("Password reset code sent to your email!")
                setTimeout(() => {
                    setStep("reset")
                    setSuccess("")
                }, 2000)
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to send reset code"
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (!code || !newPassword || !confirmPassword) {
            setError("Please fill in all fields")
            return
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {
            const result = await authService.resetPassword(
                identifier,
                code,
                newPassword
            )

            if (result.success) {
                setSuccess(
                    "Password reset successfully! Redirecting to login..."
                )
                setTimeout(() => {
                    router.push("/login")
                }, 2000)
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to reset password"
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async () => {
        setError("")
        setSuccess("")

        try {
            const result = await authService.forgotPassword(identifier)
            if (result.success) {
                setSuccess("Code resent successfully!")
                setTimeout(() => setSuccess(""), 3000)
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to resend code"
            )
        }
    }

    if (step === "reset") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Reset Password</CardTitle>
                        <CardDescription>
                            Enter the code sent to your email and your new
                            password
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleResetPassword}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>{success}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="code">Verification Code</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={code}
                                    onChange={(e) => {
                                        setCode(
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 6)
                                        )
                                        setError("")
                                    }}
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">
                                    New Password
                                </Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value)
                                        setError("")
                                    }}
                                    required
                                />
                                <p className="text-xs text-gray-500">
                                    At least 8 characters with uppercase,
                                    lowercase, number, and special character
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirm New Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value)
                                        setError("")
                                    }}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 mt-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting Password...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={handleResendCode}
                                disabled={isLoading}
                            >
                                Resend Code
                            </Button>
                            <Button
                                type="button"
                                variant="link"
                                className="w-full"
                                onClick={() => setStep("request")}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Forgot Password</CardTitle>
                    <CardDescription>
                        Enter your username or email to receive a password reset
                        code
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleRequestReset}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>{success}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="identifier">
                                Username or Email
                            </Label>
                            <Input
                                id="identifier"
                                type="text"
                                placeholder="johndoe or john@example.com"
                                value={identifier}
                                onChange={(e) => {
                                    setIdentifier(e.target.value)
                                    setError("")
                                }}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 mt-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending Code...
                                </>
                            ) : (
                                "Send Reset Code"
                            )}
                        </Button>
                        <Link
                            href="/login"
                            className="text-center text-sm text-gray-600 hover:underline"
                        >
                            Back to Login
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
