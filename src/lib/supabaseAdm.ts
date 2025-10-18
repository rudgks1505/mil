import 'server-only'
import { createClient } from '@supabase/supabase-js';
import type { Database } from "@/types/supabase";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseRoleKey) {
    throw new Error('Supabase URL 또는 Service Key가 설정되지 않았습니다.');
}
export const supabaseAdm = createClient<Database>(supabaseUrl, supabaseRoleKey);