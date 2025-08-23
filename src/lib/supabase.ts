import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL 또는 Service Key가 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);