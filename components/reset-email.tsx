"use client"

import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useState } from "react"

export function ResetEmail({ className, ...props }: React.ComponentProps<"div">) {
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleResetEmail = async (e: any) => {
        e.preventDefault();
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password/new-password`,
            })
            setSuccess(true)
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
                        <p className="text-sm text-muted-foreground">
                            If you registered using your email and password, you will receive a password reset
                            email.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
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
                                <Field>
                                    {error && <p className="text-sm text-red-500">{error}</p>}
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