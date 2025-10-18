import { NextResponse, NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import crypto from 'node:crypto';


const CACHE_CTRL = 'public, max-age=3600, stale-while-revalidate=3600';

export async function GET(req: NextRequest) {
    try {
        const uuid = req.nextUrl.searchParams.get("id");
        if (!uuid) {
            console.error('params null');
            return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const { data: select_data, error: select_error } = await supabase
            .from('books')
            .select('uuid')
            .eq('id', uuid)
            .single();

        if (select_error) {
            console.error(select_error.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }



        const payload = { data: select_data.uuid };
        const hash = crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');
        const etag = `W/"${hash}"`;

        const ifNoneMatch = req.headers.get('if-none-match');
        if (ifNoneMatch && ifNoneMatch === etag) {
            return new Response(null, {
                status: 304,
                headers: {
                    'ETag': etag,
                    'Cache-Control': CACHE_CTRL,
                },
            });
        }

        const res = NextResponse.json(payload, { status: 200 });
        res.headers.set('ETag', etag);
        res.headers.set('Cache-Control', CACHE_CTRL);
        return res;
    } catch (err: any) {
        console.error(err.message);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }

}