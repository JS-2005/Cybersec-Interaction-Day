'use client'

import { Button } from "./ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function LogoutButton() {
    const router = useRouter()
    const handleLogout = async () => {
        if (typeof(Storage) != "undefined"){
            localStorage.removeItem("user");
        }

        const supabase = createClient()
        await supabase.auth.signOut()
        router.replace('/login')
    }

    return (
        <Button onClick={handleLogout} className="bg-red-500 text-white font-bold hover:bg-red-700">Logout</Button>
    )
}