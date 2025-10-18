import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdm } from '@/lib/supabaseAdm';

export async function GET(req: NextRequest) {
    try {

        const uuid = req.nextUrl.searchParams.get("id");
        if (!uuid) {
            console.error('params null');
            return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
        }

        const { error } = await supabaseAdm
            .from('member')
            .update({ uuid_close: new Date(Date.now() + 5 * 60 * 1000).toISOString() }) //UTC
            .eq('uuid', uuid);

        if (error) {
            console.error(error.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }


        return NextResponse.json({ status: 200 });
    } catch (err: any) {
        console.error(err.message);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}
