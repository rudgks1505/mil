'use client';

import styles from "@/app/adm/page.module.css";
import useSWR from "swr";
import { useEffect, useState } from 'react';
import { useToken } from "@/hook/hook";
import { z } from 'zod';
import { Member, memberSchema, AdmMember, admMemberSchema } from "@/types/schemas";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Page() {

    const memberGet = async (): Promise<Member[] | AdmMember[]> => {
        try {
            const res = await fetch('/api/adm/member');

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

            const item = data.data;

            const { data: { session } } = await supabase.auth.getSession();
            let zodquery;

            if (session?.user.email === 'rudgks1505@gmail.com') {
                zodquery = z.array(admMemberSchema).safeParse(item);
            } else {
                zodquery = z.array(memberSchema).safeParse(item);
            };

            const zodResult = zodquery;
            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error('유효성 검사 실패');
            }


            return zodResult.data;
        } catch (error: any) {
            throw error;
        }

    }

    const supabase = createClientComponentClient();
    const token = useToken();
    const { data: item, error, isLoading } = useSWR<Member[] | AdmMember[]>(token ? "/api/adm/member" : null, memberGet);

    const [items, setItems] = useState<Member[] | AdmMember[]>([]);

    useEffect(() => {
        if (item) {
            setItems(item.map(el => ({ ...el })));
        }
    }, [item])

    if (isLoading) return <p>로딩 중...</p>;
    if (error) return <p>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</p>;

    return (
        <>
            <div className={styles.con}>
                <div className={styles.scroll_con}>
                    <table className={styles.con_table}>
                        <thead>
                            <tr>
                                <th>이메일</th>
                                <th>핸드폰</th>
                                <th>권한</th>
                                <th>최근 접속일</th>
                                <th>가입 날짜</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items && (
                                items.map((el, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>
                                                {"email" in el ? (
                                                    <p>{el.email}</p>
                                                ) : (
                                                    <p style={{ filter: "blur(5px)" }}>abc@abc.com</p>
                                                )}
                                            </td>
                                            <td>
                                                {"user_phone" in el ? (
                                                    <p>{el.user_phone}</p>
                                                ) : (
                                                    <p style={{ filter: "blur(5px)" }}>010-0000-0000</p>
                                                )}
                                            </td>
                                            <td>
                                                <p>{el.user_role}</p>
                                            </td>
                                            <td>
                                                <p>{el.last_sign && el.last_sign.split(".")[0]}</p>
                                            </td>
                                            <td>
                                                <p>{el.created_at.split("T")[0]}</p>
                                            </td>
                                        </tr>

                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
