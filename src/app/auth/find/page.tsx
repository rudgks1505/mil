'use client';

import styles from "../page.module.css";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinSchema } from "@/types/schemas";

export default function Page() {

    const router = useRouter();
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const memberFind = async (
    ) => {
        try {

            const findData = {
                phone: phone,
                email: email,
            }

            const zodResult = joinSchema.pick({ phone: true, email: true }).safeParse(findData);
            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error('유효성 검사 실패');
            }

            const res = await fetch('/api/auth/find', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(zodResult.data),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

            router.push(`/auth/find/${data.data.uuid}`);

        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
        };
    }



    return (
        <>
            <span className={styles.back} onClick={() => router.back()}>‹</span>
            <h1>아이디 조회</h1>
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

            <div className={styles.btnCon}>
                {(!email) && (
                    <div></div>
                )}
                <button onClick={memberFind}>확인</button>
            </div>
        </>
    )
};