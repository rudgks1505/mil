import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod';
import { publicBookMarksRowSchema } from "@/types/zodSchemas";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { BooksRowSchema } from "@/types/schemas";
import omit from 'lodash/omit';
import crypto from 'node:crypto';

const CACHE_CTRL = 'public, no-cache';

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
            .from('book_marks')
            .select('book_uuid')
            .eq('user_id', user.id)
            .order("created_at", { ascending: false })

        if (select_err) {
            console.error(select_err.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }


        if (select_data.length >= 10) {
            for (let index = 10; index < select_data.length; index++) {
                const { error: delete_err } = await supabase
                    .from('book_marks')
                    .delete()
                    .eq('book_uuid', select_data[index].book_uuid);
                if (delete_err) {
                    console.error(delete_err.message);
                    return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
                }
            }
        };

        const zodSelect = z.array(publicBookMarksRowSchema.pick({ book_uuid: true })).safeParse(select_data);
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


        const zodItems = z.array(BooksRowSchema).safeParse(signItems);
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
