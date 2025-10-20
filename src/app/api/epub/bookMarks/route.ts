import { NextResponse, NextRequest } from 'next/server'
import { publicBookMarksRowSchema, publicBookMarksInsertSchema } from "@/types/zodSchemas";
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

        const zodItems = publicBookMarksInsertSchema.pick({ book_uuid: true }).safeParse(body);
        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const { data: select_data, error: select_err } = await supabase
            .from('book_marks')
            .select('book_uuid')
            .eq('book_uuid', zodItems.data.book_uuid)
            .eq('user_id', user.id)
            .maybeSingle();

        if (select_err) {
            console.error(select_err.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }

        if (select_data !== null) return NextResponse.json({ message: '이미 즐겨찾기에 추가된 항목입니다.', data: null }, { status: 200 });


        const { error } = await supabase
            .from('book_marks')
            .insert({
                user_id: user.id,
                book_uuid: zodItems.data.book_uuid,
            });

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
            .from('book_marks')
            .select('*')
            .eq('user_id', user.id)
            .eq('book_uuid', uuid)
            .maybeSingle();

        if (select_err) {
            console.error(select_err.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }
        if (select_data === null) {
            console.error('select_data null');
            return NextResponse.json({ data: null }, { status: 200 });
        }


        const zodItems = publicBookMarksRowSchema.safeParse(select_data);
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
    } catch (err: unknown) {
        if (err instanceof Error) console.error(err.message);
        else console.error(err);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
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
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const { error: delete_err } = await supabase
            .from('book_marks')
            .delete()
            .eq('user_id', user.id)
            .eq('book_uuid', uuid)

        if (delete_err) {
            console.error(delete_err.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }

        return NextResponse.json({ data: null }, { status: 200 });
    } catch (err: unknown) {
        if (err instanceof Error) console.error(err.message);
        else console.error(err);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}
