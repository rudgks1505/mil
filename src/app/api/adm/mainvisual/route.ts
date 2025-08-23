import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase';


export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log(body);
        const { order, bookId, title, summation, bookLink } = body;

        const { data, error } = await supabase
            .from('Mainvisual')
            .insert([
                { order: order, book_id: bookId, title: title, summation: summation, book_link: bookLink }
            ])

        if (error) {
            return NextResponse.json({ message: '메인비쥬얼 업데이트 실패', error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: '메인비쥬얼 업데이트 성공' }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ message: '요청 처리 중 오류.', error: err.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { data, error } = await supabase
            .from('Mainvisual')
            .select('*')
            .order('order', { ascending: true });

        if (error) {
            return NextResponse.json({ message: '메인비쥬얼 겟 실패', error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: '메인비쥬얼 겟 성공', data: data }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ message: '요청 처리 중 오류.', error: err.message }, { status: 500 });
    }
}