import NavigationBar from "@/components/navigation-bar"
import { createClient } from "@/lib/supabase/server"

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getClaims()

    return (
        <div>
            <NavigationBar>
                {children}
            </NavigationBar>
        </div>
    )
}