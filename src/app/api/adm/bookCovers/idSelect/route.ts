import { NextResponse, NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { BooksRowSchema } from "@/types/schemas";
import crypto from 'node:crypto';

const CACHE_CTRL = 'public, no-cache';

export async function GET(req: NextRequest) {
    try {

        const uuid = req.nextUrl.searchParams.get("id");

        if (!uuid) {
            console.error('params null');
            return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('uuid', uuid)
            .single();

        if (error) {
            console.error(error.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }

        const zodItems = BooksRowSchema.safeParse(data); //추가 키 제외

        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
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
    } catch (err: unknown) {
        if (err instanceof Error) console.error(err.message);
        else console.error(err);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}