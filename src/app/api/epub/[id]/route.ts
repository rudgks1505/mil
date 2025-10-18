import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Epub, EpubSchema } from "@/types/schemas";
import crypto from 'node:crypto';

const CACHE_CTRL = 'public, max-age=3600, stale-while-revalidate=3600';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const resolvedParams = await params;
        const params_id = resolvedParams.id;

        if (!params_id) {
            console.error('params null');
            return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
        }

        const epub: Epub = {
            metadata: { title: '', author: '', identifier: '' },
            chapters: [{
                book_id: 0,
                created_at: '',
                id: 0,
                img_path: '',
                seq: 0,
                title: '',
                xhtml: ''
            }],
        };

        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('uuid', params_id)
            .single();

        if (error) {
            console.error(error.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }

        const { data: chapter_data, error: chapter_err } = await supabase
            .from('chapters')
            .select('book_id, created_at, id, img_path, seq, title, xhtml')
            .eq('book_id', data.id);

        if (chapter_err) {
            console.error(chapter_err.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }

        const zodItems = EpubSchema.pick({ chapters: true }).safeParse({ chapters: chapter_data });

        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        epub.metadata.author = data.author;
        epub.metadata.title = data.title;
        epub.chapters = zodItems.data.chapters;


        const payload = { data: epub };
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