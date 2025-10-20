'use client';

import styles from "../page.module.css";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinSchema } from "@/types/schemas";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Page() {

    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const router = useRouter();
    const supabase = createClientComponentClient();

    const memberJoin = async (
    ) => {
        try {

            const joinData = {
                phone: phone,
                email: email,
                password: password,
                passwordConfirm: passwordConfirm
            }

            const zodResult = joinSchema.superRefine((val, ctx) => {
                if (val.password !== val.passwordConfirm) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["passwordConfirm"],
                        message: "비밀번호가 일치하지 않습니다.",
                    });
                }
            }).safeParse(joinData);

            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error('유효성 검사 실패');
            }

            //로컬은 54324, 링크 안누르고 가입완료됨.
            const { data: signUp, error } = await supabase.auth.signUp({
                email: zodResult.data.email,
                password: zodResult.data.passwordConfirm,
                options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/complete`,
                    data: { phone: zodResult.data.phone } // signUp: email, phone 둘 다 사용할 경우 phone은 무시됨. 메타로 폰 넘기기. 
                },
            });

            if (error) {
                console.error(error);
                let em = '알 수 없는 오류가 발생했습니다.'
                if (error.code === 'user_already_exists') em = '이미 존재하는 이메일입니다.';
                if (error.message === 'Database error saving new user') em = '이미 존재하는 번호입니다.';
                throw new Error(em);
            }

            if (!signUp.session) {
                alert('이메일로 발송된 인증 링크를 클릭해 주세요.');
                return;
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
            <h1>회원가입</h1>
            <p></p>
            <div className={styles.loginInp} data-label="전화번호">
                <input type="text" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010으로 시작하는 11자리 숫자만 입력해주세요." />
            </div>
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
            <div className={styles.loginInp} data-label="비밀번호 확인">
                <input type="password" value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="비밀번호 확인" />
            </div>

            <div className={styles.btnCon}>
                {(!phone || !email || !password || !passwordConfirm) && (
                    <div></div>
                )}
                <button onClick={memberJoin}>확인</button>
            </div>
        </>
    )
};