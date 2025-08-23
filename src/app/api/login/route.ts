import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase';


export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log(body);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: body.email,
            password: body.password,
        });

        if (error) {
            return NextResponse.json({ message: '로그인 실패', error: error.message }, { status: 400 });
        }

        if (data.user && data.session) {
            return NextResponse.json({ message: '로그인 성공', session: data.session }, { status: 200 });
        }

    } catch (err) {
        if (err instanceof Error) {
            return NextResponse.json({ message: '요청 처리 중 오류.', error: err.message }, { status: 500 });
        } else {
            return NextResponse.json({ message: '알 수 없는 에러.' }, { status: 500 });
        }

    }
}