import { NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { supabaseAdm } from "@/lib/supabaseAdm";


const CACHE_CTRL = 'public, max-age=3600, stale-while-revalidate=3600';

export async function GET(
    req: NextRequest,
    ctx: { params: { bucket: string; path: string[] } }
) {
    const { bucket, path } = await ctx.params;
    const filePath = path.join('/');

    try {

        const { data, error } = await supabaseAdm.storage.from(bucket).download(filePath);
        if (error || !data) {
            return new Response('Not Found', { status: 404 });
        }

        const buffer = Buffer.from(await data.arrayBuffer()) as any;
        const contentType = data.type ?? 'image/webp';

        const etag = `W/"${crypto.createHash('sha1').update(buffer).digest('hex')}"`;

        const ifNoneMatch = req.headers.get('if-none-match');
        if (ifNoneMatch && ifNoneMatch === etag) {
            return new Response(null, {
                status: 304,
                headers: {
                    'Cache-Control': CACHE_CTRL,
                    ETag: etag,
                },
            });
        }

        return new Response(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': CACHE_CTRL,
                ETag: etag,
            },
        });
    } catch (e) {
        console.error(e);
        return new Response('Internal Error', { status: 500 });
    }
}
