'use client';

import styles from "../page.module.css";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { joinSchema } from "@/types/schemas";

export default function Page() {

    const supabase = createClientComponentClient();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const reset = async (
    ) => {
        try {

            const resetData = {
                password: password,
                passwordConfirm: passwordConfirm
            }
            const zodResult = joinSchema.pick({ password: true, passwordConfirm: true }).superRefine((val, ctx) => {
                if (val.password !== val.passwordConfirm) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["passwordConfirm"],
                        message: "비밀번호가 일치하지 않습니다.",
                    });
                }
            }).safeParse(resetData);

            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error('유효성 검사 실패');
            }

            const { data, error } = await supabase.auth.updateUser({
                password: zodResult.data.passwordConfirm
            });

            if (error) {
                console.error(error.message);
                throw new Error('알 수 없는 오류가 발생했습니다.');
            }

            if (data) {
                alert('비밀번호 재설정 완료하였습니다.');
                router.push('/');
            }
        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
        };
    }


    return (
        <>
            <span className={styles.back} onClick={() => router.back()}>‹</span>
            <h1>새 비밀번호 입력해주세요</h1>
            <p></p>
            <div className={styles.loginInp} data-label="비밀번호">
                <input type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호 입력" />
            </div>
            <div className={styles.loginInp} data-label="비밀번호 확인">
                <input type="password" value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="비밀번호 확인" />
            </div>
            <div className={styles.btnCon}>
                {(!password || !passwordConfirm) && (
                    <div></div>
                )}
                <button onClick={reset}>확인</button>
            </div>
        </>
    )
};