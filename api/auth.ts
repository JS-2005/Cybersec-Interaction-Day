import { createClient } from "@supabase/supabase-js"

export default async function Auth(email: string, password: string) {

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!);

    const { data: signedInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    })

    return { signedInData, signInError }
}