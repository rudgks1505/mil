import { createClient } from '@supabase/supabase-js';
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL 또는 AnonKey가 설정되지 않았습니다.');
}


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);