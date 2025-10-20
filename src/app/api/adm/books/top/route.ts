import { NextResponse } from 'next/server'
import { supabaseAdm } from "@/lib/supabaseAdm";
import z from 'zod';


export async function POST(req: Request) {
    try {

        const body: { uuid: string } = await req.json();
        const zodItems = z.object({ uuid: z.string() }).safeParse(body);

        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }


        // 쿼리빌더 업데이트 수식 지원안함. 셀렉 뒤, const hit = 셀렉 값 + 1;  hit 업데이트 할 경우 원자성 보장 안되기에 db함수 이용.
        const { error } = await supabaseAdm.rpc("increment_book_hit", { book_uuid: zodItems.data.uuid });

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