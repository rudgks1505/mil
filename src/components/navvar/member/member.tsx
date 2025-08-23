'use client';

import Link from 'next/link';
import styles from "./member.module.css";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'

export default function Page() {

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
                <li onClick={logoutF}>로그아웃</li>
            ) : (
                <li><Link href="/login">로그인</Link></li>
            )
            }
        </>
    );
}
