
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export async function authCreateClient(auth: string) {

    if (!auth.startsWith("Bearer ")) {
        return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    }
    const token = auth.slice(7);

    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false },
        }
    );
}