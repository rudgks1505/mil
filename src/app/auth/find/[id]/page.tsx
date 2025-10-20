'use client';

import styles from "../../page.module.css";
import { useEffect, useRef, useCallback } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Page({ params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const useParams = use(params);
    const didRun = useRef(false);

    const emailSend = useCallback(async (
    ) => {
        try {
            const res = await fetch(`/api/auth/find/${useParams.id}`);

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
            const item = data.data;


            const { error } = await supabase.auth.resetPasswordForEmail(item.email, {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/resetComplete?id=${item.id}`
            });

            if (error) {
                console.error(error.message);
                throw new Error('알 수 없는 오류가 발생했습니다.');
            }

            alert('이메일로 발송된 재설정 링크를 클릭해 주세요.\n스팸함에 도착한 경우 링크가 잘릴 수 있으니, 받은편지함으로 이동해 확인해 주세요.');

        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
        };
    }, [supabase, useParams.id]
    );

    useEffect(() => {
        if (didRun.current) return;
        didRun.current = true; // 개발환경 마운트 시 effect 2번 돌아감. 메일 2번 연속 작동하면 에러남.

        (async () => {
            await emailSend();
        })()
    }, [emailSend])


    return (
        <>
            <span className={styles.back} onClick={() => router.back()}>‹</span>
            <h1>비밀번호 변경진행</h1>
            <p>스팸함에 도착한 경우 링크가 잘릴 수 있으니,<br />받은편지함으로 이동해 확인해 주세요.</p>
        </>
    );
}
