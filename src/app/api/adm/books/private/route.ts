import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod';
import { publicBooksInsertSchema, publicBooksRowSchema } from "@/types/zodSchemas";
import { deleteItemsSchema, deleteItems, BooksRow, BooksRowSchema } from "@/types/schemas";
import type { Tables, TablesUpdate } from "@/types/helper";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import crypto from 'node:crypto';

export async function GET(_req: NextRequest) {
    try {

        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const { data, error } = await supabase
            .from('books')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error(error.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }


        const zodItems = z.array(publicBooksRowSchema).safeParse(data);
        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        return NextResponse.json({ data: zodItems.data }, { status: 200 });
    } catch (err: any) {
        console.error(err.message);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const body: TablesUpdate<"books"> = await req.json();
        const zodItems = z.array(publicBooksInsertSchema).safeParse(body);

        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const items = zodItems.data;

        const { error } = await supabase
            .from('books')
            .upsert(items);

        if (error) {
            console.error(error.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }

        return NextResponse.json({ status: 200 });
    } catch (err: any) {
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}





export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const body: deleteItems = await req.json();
        const zodItems = deleteItemsSchema.safeParse(body);

        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const { error } = await supabase
            .from('books')
            .delete()
            .in('id', body);
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