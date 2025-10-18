import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const url = req.nextUrl;
    const proto = req.headers.get('x-forwarded-proto') ?? 'http';
    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
    const origin = `${proto}://${host}`;
    const home = new URL('/', origin).toString();

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

    if (pathname.startsWith('/auth/resetComplete')) {
        const uuid = url.searchParams.get('id');
        if (!uuid) return NextResponse.redirect(home);

        const AbsolutPath = new URL('/api/auth/resetComplete', origin);
        AbsolutPath.searchParams.set('id', uuid);

        const res = await fetch(AbsolutPath.toString()); // 절대경로로 요청해야함
        const data = await res.json();

        if (!res.ok) {
            console.log(data.error);
            return NextResponse.redirect(home);
        }
        return NextResponse.next();
    }

    if (pathname.startsWith('/auth') && !pathname.startsWith('/auth/resetComplete') && !pathname.startsWith('/auth/complete')) {

        if (pathname === "/auth") {
            const move = new URL('/', origin).toString();
            return NextResponse.redirect(move);
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (session !== null) return NextResponse.redirect(home);
        return NextResponse.next();
    }

    if (pathname === "/adm") {
        const move = new URL('/adm/mainvisual', origin).toString();
        return NextResponse.redirect(move);
    }

    return NextResponse.next();
}

// ~/:path* 하위경로
export const config = {
    matcher: [
        '/auth/:path*',
        '/adm/:path*',
    ],
}