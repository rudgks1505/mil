import { NextResponse } from 'next/server'
import { supabaseAdm } from '@/lib/supabaseAdm';
import { memberSchema, AdmMember, admMemberSchema } from "@/types/schemas";
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'


export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.error('user null');
            return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
        }

        const user = session.user;
        let query;

        if (user?.email === 'rudgks1505@gmail.com') {
            query = await supabaseAdm
                .from('member')
                .select('created_at, email, last_sign, user_role, user_phone');
        } else {
            query = await supabaseAdm
                .from('member')
                .select('created_at, last_sign, user_role');
        };

        const { data, error } = query;
        if (error) {
            console.error(error.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }


        let zodquery;
        if (user?.email === 'rudgks1505@gmail.com') {
            zodquery = z.array(admMemberSchema).safeParse(data);
        } else {
            zodquery = z.array(memberSchema).safeParse(data);
        };

        const zodItems = zodquery
        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        return NextResponse.json({ data: zodItems.data }, { status: 200 });
    } catch (err: any) {
        console.error(err.message);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}
