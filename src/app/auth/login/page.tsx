'use client';

import styles from "../page.module.css";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { joinSchema } from "@/types/schemas";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Page(): React.ReactElement {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const supabase = createClientComponentClient();


    const loginF = async () => {
        try {
            const zodResult = joinSchema.pick({ email: true, password: true }).safeParse({ email, password });
            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error('유효성 검사 실패');
            };
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    alert('이메일 또는 비밀번호가 일치하지 않습니다.');
                } else {
                    console.error(error.message);
                    alert('로그인 중 문제가 발생했습니다. 다시 시도해 주세요.');
                }
                return;
            }
            if (data) router.replace('/');

        } catch (err: any) {
            alert(err.message);
            return;
        }
    };



    return (
        <>
            <span className={styles.back} onClick={() => router.back()}>‹</span>
            <h1>독서와 무제한 친해지리</h1>
            <p>AI가 만들어낸 책 속에서 인생책을 찾아보세요</p>
            <div className={styles.loginInp} data-label="이메일">
                <input type="text" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일 입력" />
            </div>
            <div className={styles.loginInp} data-label="비밀번호">
                <input type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호 입력" />
            </div>
            <div className={styles.btnCon}>
                {(!email || !password) && (
                    <div></div>
                )}
                <button onClick={loginF}>로그인</button>
            </div>
            <ul>
                <li><Link href="/auth/join">회원가입</Link></li>
                <li><Link href="/auth/find">PW 찾기</Link></li>
            </ul>
        </>
    )
};