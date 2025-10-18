import { NextResponse } from 'next/server'
import { supabaseAdm } from '@/lib/supabaseAdm';
import { v4 as uuidv4 } from 'uuid'
import { joinSchema } from "@/types/schemas";


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const zodItems = joinSchema.pick({ phone: true, email: true }).safeParse(body);

        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const uuid_v4 = uuidv4();

        const { data, error } = await supabaseAdm
            .from("member")
            .update({ uuid: uuid_v4 })
            .eq('user_phone', zodItems.data.phone)
            .eq('email', zodItems.data.email)
            .select()
            .maybeSingle(); //sing일 경우, 없을 경우도 에러로 빠짐. maybeSingle 0건 null, 여러건 err,

        if (error) {
            console.error(error.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }
        if (data === null) {
            return NextResponse.json({ message: '전화번호, 이메일을 다시 확인해주세요.' }, { status: 400 });
        }

        return NextResponse.json({ data: { uuid: data.uuid } }, { status: 200 });

    } catch (err: any) {
        console.error(err.message);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }

}