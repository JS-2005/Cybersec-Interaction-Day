'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogoutButton } from '@/components/logout-button'
import { FieldGroup, Field, FieldLabel, FieldLegend } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function Profile() {

    const router = useRouter()

    // Get user info from Supabase
    const supabase = createClient()

    const [username, setUserName] = useState<string | null>(null)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [role, setRole] = useState<string | null>(null)

    useEffect(() => {

        // Get User Info
        const userInfo = async () => {

            // Get Supabase Claims
            const { data: userClaims } = await supabase.auth.getClaims();

            console.log(userClaims)

            const { data, error } = await supabase
                .from('user_info')
                .select('user_name, user_email, user_role')
                .eq('id', userClaims?.claims.sub)
                .single()

            setUserName(data?.user_name)
            setUserEmail(data?.user_email)
            setRole(data?.user_role)

            // Check User Claims Whether Expired
            if (!userClaims) {
                router.push('/')
            }

        }
        userInfo();

    }, [router]);

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <h1 className="text-center text-4xl font-extrabold tracking-tight text-balance">PROFILE</h1>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Registered Email</FieldLabel>
                                <Input id="email" type="text" value={userEmail || ''} readOnly />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="username">Username</FieldLabel>
                                <Input id="username" type="text" value={username || ''} readOnly />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="role">Role</FieldLabel>
                                <Input id="role" type="text" value={role || ''} readOnly />
                            </Field>
                            <Field>
                                <LogoutButton />
                            </Field>
                        </FieldGroup>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}