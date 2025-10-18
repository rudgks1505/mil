import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod';
import { publicHistoryRowSchema, } from "@/types/zodSchemas";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { BooksRowSchema } from "@/types/schemas";
import omit from 'lodash/omit';
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
        const zodItems = publicHistoryRowSchema.pick({ book_uuid: true }).safeParse(body);


        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const { data: select_data, error: select_err } = await supabase
            .from('history')
            .select('book_uuid')
            .eq('book_uuid', zodItems.data.book_uuid)
            .eq('user_id', user.id)
            .maybeSingle();

        if (select_err) {
            console.error(select_err.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }

        let query;

        //upsert() eq사용불가, 기본키를 봄
        if (select_data === null) {
            query = await supabase
                .from('history')
                .insert({
                    user_id: user.id,
                    book_uuid: zodItems.data.book_uuid,
                    visited_at: new Date().toISOString()
                })
        } else {
            query = await supabase
                .from('history')
                .update({ visited_at: new Date().toISOString() })
                .eq('book_uuid', zodItems.data.book_uuid)
                .eq('user_id', user.id)
        }
        const { error } = query;
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

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('user null');
            return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
        }

        const { data: select_data, error: select_err } = await supabase
            .from('history')
            .select('*')
            .eq('user_id', user.id)
            .order("visited_at", { ascending: false })
            .limit(10);

        if (select_err) {
            console.error(select_err.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }

        if (select_data.length >= 10) {
            for (let index = 10; index < select_data.length; index++) {
                const { error: delete_err } = await supabase
                    .from('history')
                    .delete()
                    .eq('book_uuid', select_data[index].book_uuid);
                if (delete_err) {
                    console.error(delete_err.message);
                    return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
                }
            }
        };



        const zodSelect = z.array(publicHistoryRowSchema).safeParse(select_data);
        if (!zodSelect.success) {
            console.error(zodSelect.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const results = await Promise.allSettled(select_data.map(async (el) => {
            const { data, error } = await supabase
                .from("books")
                .select('*')
                .not('img_path', 'eq', '')
                .eq('uuid', el.book_uuid)
                .single();
            if (error) console.error(error);
            return { ...data }
        }));


        const signItems = results.filter((row) => row.status == 'fulfilled').map((row, i) => {
            const success = row.value;
            const set_obj = omit(success, ['owner']);
            return { ...set_obj };
        })

        const signItems_reject = results.filter((row) => row.status == 'rejected')
        if (signItems_reject.length) console.error(signItems_reject);

        const zodItems = z.array(BooksRowSchema)
            .transform(arr =>
                arr.map((el, index) =>
                    el.uuid === select_data[index].book_uuid
                        ? { ...el, visited_at: select_data[index].visited_at }
                        : el
                )
            ).safeParse(signItems);


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
