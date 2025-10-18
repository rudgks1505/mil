import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod';
import { BooksRowSchema } from "@/types/schemas";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import crypto from 'node:crypto';

const CACHE_CTRL = 'public, no-cache';

export async function GET(req: NextRequest) {
    try {

        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const uuid = req.nextUrl.searchParams.get("qu");
        let book_query;

        if (uuid) {//detail
            book_query = await supabase
                .from('books')
                .select('*')
                .not('img_path', 'eq', '')
                .eq('uuid', uuid);
        } else {//new
            book_query = await supabase
                .from('books')
                .select('*')
                .not('img_path', 'eq', '')
                .order('id', { ascending: false })
                .limit(10);
        }
        const { data, error } = book_query;

        if (error) {
            console.error(error.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }


        const zodItems = z.array(BooksRowSchema).safeParse(data);
        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const payload = { data: zodItems.data };
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