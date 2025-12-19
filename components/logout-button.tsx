'use client'

import { Button } from "./ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function LogoutButton() {
    const router = useRouter()
    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.replace('/login')
    }

    return (
        <Button onClick={handleLogout}>Logout</Button>
    )
}