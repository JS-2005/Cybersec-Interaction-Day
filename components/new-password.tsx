'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function NewPassword({ className, ...props }: React.ComponentProps<"div">) {
    const [newPassword, setNewPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [password, setPassword] = useState('')
    const router = useRouter()

    const handleNewPassword = async (e: any) => {
        e.preventDefault()
        const supabase = createClient()
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            })
            if (error) {
                throw error
            }
            router.replace('/login')
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-center p-6">
                        <div className="rounded-xl overflow-hidden">
                            <Image src="/cybersec_icon.png" alt="cybersec-icon" loading="eager" width={150} height={150} />
                        </div>
                    </div>
                    <CardTitle>Reset Your Password</CardTitle>
                    <CardDescription>
                        Enter a new password for your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleNewPassword}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                                <Input id="newPassword" type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </Field>
                            {error &&
                                <Alert variant="destructive">
                                    <AlertCircleIcon />
                                    <AlertDescription> {error} </AlertDescription>
                                </Alert>
                            }
                            <Field>
                                <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save New Password'}</Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}