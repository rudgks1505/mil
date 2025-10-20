import { NextResponse, NextRequest } from 'next/server'
import { publicUserBooksRowSchema } from "@/types/zodSchemas";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import crypto from 'node:crypto';

const CACHE_CTRL = 'public, max-age=3600, stale-while-revalidate=3600';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('user null');
            return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
        }

        const body = await req.json();

        const zodItems = publicUserBooksRowSchema.omit({ id: true, user_id: true }).transform((data) => ({
            ...data,
            user_id: user.id
        })).safeParse(body);

        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const items = zodItems.data;

        const { data: select_data, error: select_err } = await supabase
            .from('user_books')
            .select('book_uuid')
            .eq('book_uuid', zodItems.data.book_uuid)
            .eq('user_id', zodItems.data.user_id)
            .maybeSingle();

        if (select_err) {
            console.error(select_err.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }

        let query;

        if (select_data === null) {
            query = await supabase
                .from('user_books')
                .insert(items)
        } else {
            query = await supabase
                .from('user_books')
                .update(items)
                .eq('book_uuid', select_data.book_uuid)
                .eq('user_id', zodItems.data.user_id)
        }

        const { error } = query;

        if (error) {
            console.error(error.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }


        return NextResponse.json({ status: 200 });
    } catch (err: unknown) {
        if (err instanceof Error) console.error(err.message);
        else console.error(err);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const uuid = req.nextUrl.searchParams.get("id");
        if (!uuid) {
            console.error('params null');
            return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('user null');
            return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
        }

        const { data: select_data, error: select_err } = await supabase
            .from('user_books')
            .select('background_color,book_uuid, cfi, font_color, font_height, font_size, font_weight, spread')
            .eq('book_uuid', uuid)
            .maybeSingle();

        if (select_err) {
            console.error(select_err.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }

        let zodItems;

        if (select_data !== null) {
            zodItems = publicUserBooksRowSchema.omit({ id: true, user_id: true }).safeParse(select_data);
            if (!zodItems.success) {
                console.error(zodItems.error.issues);
                return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
            }
        }


        const payload = { data: select_data === null ? null : zodItems?.data };
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
