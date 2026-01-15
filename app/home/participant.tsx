'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { LogoutButton } from '@/components/logout-button'
import { FieldGroup, Field, FieldLabel, FieldLegend } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function ParticipantPage({ user }: { user: User | null }) {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [username, setUserName] = useState<string | null>(null)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [role, setRole] = useState<string | null>(null)

    const getUserInfo = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.from('user_info').select(`user_email, user_name, user_role`).eq('id', user?.id).single()
            if (error) {
                throw error
            }
            if (data) {
                setUserName(data.user_name)
                setUserEmail(data.user_email)
                setRole(data.user_role)

                const user_information = {
                    username: data.user_name,
                    userRole: "participant"
                }

                if(typeof(Storage) != "undefined"){
                    localStorage.setItem("user", JSON.stringify(user_information));
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }, [user, supabase])

    useEffect(() => { getUserInfo() }, [getUserInfo])

    const router = useRouter()
    const directing = () =>{
        router.push("/participant")
    }

    return (
        <div className={"p-6"}>
            <FieldGroup>
                <FieldLegend><h1 className="text-center text-4xl font-extrabold tracking-tight text-balance">Participant Page</h1></FieldLegend>
                <Field>
                    <FieldLabel htmlFor="email">Registered Email</FieldLabel>
                    <Input id="email" type="text" value={user?.email} readOnly />
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
                    <Button onClick={directing} className='font-bold text-white bg-green-600'> Direct to participant page </Button>

                    <LogoutButton />
                </Field>
            </FieldGroup>
        </div>
    )
}