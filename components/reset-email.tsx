"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AlertCircleIcon, CornerUpLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function ResetEmail({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleResetEmail = async (e: any) => {
        e.preventDefault()
        const supabase = createClient()
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password/new-password`,
            })
            if (!error) {
                setSuccess(true)
            }
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            {success ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Check Your Email</CardTitle>
                        <CardDescription>Password reset instructions sent</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>
                            You may close this window.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <Button variant="ghost" className="w-16" onClick={() => router.back()}><CornerUpLeft />Back</Button>
                        <div className="flex items-center justify-center p-6">
                            <div className="rounded-xl overflow-hidden">
                                <Image src="/cybersec_icon.png" alt="cybersec-icon" loading="eager" width={150} height={150} />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Reset Your Password</CardTitle>
                        <CardDescription>
                            Type in your email and we&apos;ll send you a link to reset your password
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleResetEmail}>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Field>
                                {error &&
                                    <Alert variant="destructive">
                                        <AlertCircleIcon />
                                        <AlertDescription> {error} </AlertDescription>
                                    </Alert>
                                }
                                <Field>
                                    <Button type="submit" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send Reset Email'}</Button>
                                </Field>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}