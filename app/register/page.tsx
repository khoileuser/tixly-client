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
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        phoneNumber: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [needsVerification, setNeedsVerification] = useState(false)
    const [verificationCode, setVerificationCode] = useState("")
    const [verifyingCode, setVerifyingCode] = useState(false)
    const [fieldErrors, setFieldErrors] = useState({
        email: "",
        phoneNumber: "",
        password: "",
    })

    const validateEmail = (email: string) => {
        if (!email) return ""
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email) ? "" : "Invalid email format"
    }

    const validatePhoneNumber = (phone: string) => {
        if (!phone) return "Phone number is required"
        const phoneRegex = /^\+[1-9]\d{1,14}$/
        return phoneRegex.test(phone)
            ? ""
            : "Must start with + and country code"
    }

    const validatePassword = (password: string) => {
        if (!password) return ""
        if (password.length < 8) return "At least 8 characters required"
        if (!/[A-Z]/.test(password))
            return "Include at least one uppercase letter"
        if (!/[a-z]/.test(password))
            return "Include at least one lowercase letter"
        if (!/[0-9]/.test(password)) return "Include at least one number"
        if (!/[^A-Za-z0-9]/.test(password))
            return "Include at least one special character"
        return ""
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError("")

        // Real-time validation
        if (name === "email") {
            setFieldErrors((prev) => ({
                ...prev,
                email: validateEmail(value),
            }))
        } else if (name === "phoneNumber") {
            setFieldErrors((prev) => ({
                ...prev,
                phoneNumber: validatePhoneNumber(value),
            }))
        } else if (name === "password") {
            setFieldErrors((prev) => ({
                ...prev,
                password: validatePassword(value),
            }))
        }
    }

    const validateForm = () => {
        if (
            !formData.username ||
            !formData.email ||
            !formData.password ||
            !formData.name ||
            !formData.phoneNumber
        ) {
            setError("Please fill in all required fields")
            return false
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters")
            return false
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return false
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address")
            return false
        }

        // Validate phone number format (E.164 format)
        const phoneRegex = /^\+[1-9]\d{1,14}$/
        if (!phoneRegex.test(formData.phoneNumber)) {
            setError(
                "Phone number must be in international format (e.g., +1234567890)"
            )
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...registerData } = formData
            const result = await authService.register(registerData)

            if (result.success) {
                setSuccess(true)
                setNeedsVerification(true)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed")
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!verificationCode || verificationCode.length !== 6) {
            setError("Please enter a valid 6-digit code")
            return
        }

        setVerifyingCode(true)

        try {
            const result = await authService.confirmSignUp(
                formData.username,
                verificationCode
            )

            if (result.success) {
                // Redirect to login after successful verification
                setTimeout(() => {
                    router.push("/login?verified=true")
                }, 1500)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Verification failed")
        } finally {
            setVerifyingCode(false)
        }
    }

    const handleResendCode = async () => {
        setError("")
        try {
            await authService.resendCode(formData.username)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to resend code"
            )
        }
    }

    if (needsVerification) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Verify Your Email</CardTitle>
                        <CardDescription>
                            We&apos;ve sent a verification code to{" "}
                            <strong>{formData.email}</strong>
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleVerifyCode}>
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
                                    <span>
                                        Verification code resent successfully!
                                    </span>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="code">Verification Code</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={verificationCode}
                                    onChange={(e) => {
                                        setVerificationCode(
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
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 mt-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={verifyingCode}
                            >
                                {verifyingCode ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify Email"
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={handleResendCode}
                                disabled={verifyingCode}
                            >
                                Resend Code
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
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                        Sign up to get started with Tixly
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="username">
                                Username <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Full Name{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={
                                    fieldErrors.email ? "border-red-500" : ""
                                }
                            />
                            {fieldErrors.email && (
                                <p className="text-xs text-red-500">
                                    {fieldErrors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">
                                Phone Number{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                placeholder="+1234567890"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                                className={
                                    fieldErrors.phoneNumber
                                        ? "border-red-500"
                                        : ""
                                }
                            />
                            {fieldErrors.phoneNumber ? (
                                <p className="text-xs text-red-500">
                                    {fieldErrors.phoneNumber}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500">
                                    Must start with + and country code (e.g., +1
                                    for US, +84 for Vietnam)
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className={
                                    fieldErrors.password ? "border-red-500" : ""
                                }
                            />
                            {fieldErrors.password ? (
                                <p className="text-xs text-red-500">
                                    {fieldErrors.password}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500">
                                    At least 8 characters with uppercase,
                                    lowercase, number, and special character
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                Confirm Password{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
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
                                    Creating Account...
                                </>
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-blue-600 hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
