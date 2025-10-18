'use client';

import styles from "../../page.module.css";
import useSWR from "swr";
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { publicChaptersRowSchema } from "@/types/zodSchemas";
import type { Tables } from "@/types/helper";
import { use } from 'react';


export default function Page({ params }: {
    params: Promise<{
        id: string;
    }>;
}) {


    const chaptersGet = async (
    ) => {
        try {
            const res = await fetch(`/api/adm/chapters/${useParams.id}`);

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

            const item = data.data;
            const zodResult = z.array(publicChaptersRowSchema).safeParse(item);
            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error('유효성 검사 실패');
            }
            return zodResult.data;
        } catch (error: any) {
            throw error;
        }

    }


    type ChaptersRow = Tables<"chapters">;
    const useParams = use(params);
    const [items, setItems] = useState<ChaptersRow[]>([]);

    const { data: item, error, isLoading } = useSWR<ChaptersRow[]>(`/api/adm/chapters/${useParams.id}`, chaptersGet);

    useEffect(() => {
        if (item) {
            setItems(item.map(el => ({ ...el })));
        }
    }, [item])

    useEffect(() => {
        if (items) {
            console.log(items);
        }
    }, [items]);

    if (isLoading) return <p>로딩 중...</p>;
    if (error) return <p>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</p>;



    return (
        <>
            <div className={styles.con}>
                <div className={styles.btn_con}>
                </div>

                <div className={styles.scroll_con}>
                    <table className={styles.con_table}>
                        <thead>
                            <tr>
                                <th className={styles.th1_sticky}>챕터 제목</th>
                                <th>챕터 장</th>
                                <th>xhtml</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(items) && (
                                items.map((el, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className={styles.th1_sticky}>
                                                <input onChange={(event) => {
                                                    setItems((prev) => {
                                                        const copy = [...prev];
                                                        copy[index].title = event.target.value;
                                                        return copy;
                                                    });
                                                }}
                                                    value={el.title}
                                                ></input>
                                            </td>
                                            <td>
                                                <p>{el.seq}</p>
                                            </td>
                                            <td>
                                                <textarea onChange={(event) => {
                                                    setItems((prev) => {
                                                        const copy = [...prev];
                                                        copy[index].xhtml = event.target.value;
                                                        return copy;
                                                    });
                                                }}
                                                    value={el.xhtml}
                                                ></textarea>
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
