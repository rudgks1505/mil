'use client';

import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const loginSchema = z.object({
    email: z
        .string(),
    password: z
        .string()
});

export default function Page(): React.ReactElement {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const loginF = async () => {
        try {
            const result = loginSchema.safeParse({ email, password });
            if (!result.success) {
                console.log('로그인 스키마 불일치');
                return false
            };
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    alert('이메일 또는 비밀번호가 일치하지 않습니다.');
                } else {
                    alert('로그인 중 문제가 발생했습니다. 다시 시도해 주세요.');
                }
                return false;
            }
            if (data) {
                router.replace('/');
            }

        } catch (err: any) {
            alert(err.message);
            return false;
        }
    };

    return (
        <>
            <div>
                <div>
                    <p>이메일 :</p>
                    <input type="text" value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div >
                    <p>비밀번호 :</p>
                    <input type="text" value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div>
                    <button onClick={loginF}>제출</button>
                </div>
            </div>
        </>
    )
};