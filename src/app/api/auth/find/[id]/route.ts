import { NextResponse } from 'next/server'
import { supabaseAdm } from '@/lib/supabaseAdm';
import { joinSchema } from "@/types/schemas";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const resolvedParams = await params;
        const params_id = resolvedParams.id;

        if (!params_id) {
            console.error('params null');
            return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
        }

        const { data, error } = await supabaseAdm
            .from('member')
            .select('email')
            .eq('uuid', params_id)
            .maybeSingle();

        if (error) {
            console.error(error.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }

        if (data === null) {
            console.error('email null');
            return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
        }

        const zodselect = joinSchema.pick({ email: true }).safeParse(data);
        if (!zodselect.success) {
            console.error(zodselect.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        return NextResponse.json({ data: { email: zodselect.data.email, id: params_id } }, { status: 200 });
    } catch (err: any) {
        console.error(err.message);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}
