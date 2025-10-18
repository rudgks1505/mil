'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation';

export default function Page() {

    const supabase = createClientComponentClient();
    const router = useRouter();
    const [getSession, setgetSession] = useState<boolean>(false);

    const logoutF = async () => {
        if (confirm('로그아웃하시겠습니까?')) {
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error(error);
                alert('로그아웃 중 오류가 발생했습니다.');
            } else {
                console.log('로그아웃 성공');
            }
        }
    };

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setgetSession(true);
            } else {
                setgetSession(false);
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <>
            {getSession == true ? (
                <>
                    <li><button onClick={() => { router.push('/adm') }}>관리자페이지</button></li>
                    <li><button onClick={logoutF}>로그아웃</button></li>
                </>
            ) : (
                <li><button onClick={() => { router.push('/auth/login') }}>로그인</button></li>
            )
            }
        </>
    );
}
