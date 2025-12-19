import { AdminPage } from '@/app/home/admin'
import { ParticipantPage } from '@/app/home/participant'
import { createClient } from '@/lib/supabase/server'
export default async function HomePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: user_info, error } = await supabase.from('user_info').select('user_role').limit(1).single()
    if (error) {
        console.log(error)
    }
    if (user_info != null) {
        if (user_info.user_role == 'admin') {
            return <AdminPage user={user} />
        } else if (user_info.user_role == 'participant') {
            return <ParticipantPage user={user} />
        }
    }
}