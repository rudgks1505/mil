'use client';

import useSWR, { mutate } from "swr";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { booksGet } from "@/lib/adm/utils";
import { BooksRow } from "@/types/schemas";
import styles from "@/components/bookDetail/top.module.css"
import { publicBookMarksRowSchema } from "@/types/zodSchemas";
import type { Tables } from "@/types/helper";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type BookMarksRow = Tables<"book_marks">;
type Props = { uuid: string, epubRead: () => void };

export default function Page({ uuid, epubRead }: Props) {

    const [key, setKey] = useState<string | null>(null);

    const hitUpdate = async (
    ) => {
        try {
            const res = await fetch('/api/adm/books/top', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uuid }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
        } catch (error: any) {
            alert(error.message);
            return
        };
    }

    const marksUpdate = async (
    ) => {
        try {
            if (!key) return
            let api;
            if (bookMarks === null) {
                if (!confirm('즐겨찾기 추가하시겠습니까?')) return
                api = await fetch(key, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ book_uuid: uuid }),
                });
            } else {
                if (!confirm('즐겨찾기 삭제하시겠습니까?')) return
                api = await fetch(key, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ book_uuid: uuid }),
                });
            }
            const res = api;
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
            mutate(key);

        } catch (error: any) {
            alert(error.message);
            return
        };
    }

    const marksGet = async (): Promise<BookMarksRow | null> => {
        try {
            if (!key) return null
            const res = await fetch(key);
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

            const zodResult = publicBookMarksRowSchema.nullable().safeParse(data.data);
            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error("유효성 검사 실패");
            }

            return zodResult.data;
        } catch (error: any) {
            throw error;
        }
    }
    const supabase = createClientComponentClient();
    const { data: bookMarks, error: bookMarks_err } = useSWR<BookMarksRow | null>(key, marksGet);
    const { data: item, error } = useSWR<BooksRow[]>(`/api/adm/books?qu=${uuid}`, () => booksGet(uuid));
    const [items, setItems] = useState<BooksRow>();
    const [reviewBoolean, setReviewBoolean] = useState<boolean>(false);

    useEffect(() => {
        if (items) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                try {
                    session && setKey(`/api/epub/bookMarks?id=${uuid}`);
                } catch (err: any) {
                    console.error(err);
                    alert('요청 처리 중 오류.');
                    return
                }
            })

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [items]);


    useEffect(() => {
        if (item) {
            setItems(() => {
                const copy = { ...item[0] };
                return copy
            });
        }
    }, [item]);



    useEffect(() => {
        (async () => {
            await hitUpdate();
        })();
    }, []);


    if (error || bookMarks_err) return <p>데이터를 불러오는 중 오류가 발생했습니다: {error?.message || bookMarks_err?.message}</p>;

    return (
        <>
            {(items) && (
                <div className={styles.con}>
                    <div className={styles.con_l}>
                        <div className={styles.cover_bak}>
                            <Image
                                src={`/img/book_covers/${items.img_path}`}
                                alt="북커버"
                                fill
                                className="bookCoverShadow"
                            />
                        </div>
                        <Image
                            src={`/img/book_covers/${items.img_path}`}
                            alt="북커버"
                            width={190}//메인 384사이즈 캐시
                            height={300}
                            className="bookCoverShadow"
                        />
                    </div>

                    <div className={styles.con_r}>
                        {reviewBoolean ? (
                            <div className={styles.con_review}>
                                <p>{items.book_review}</p>
                            </div>
                        ) : (
                            <div className={styles.con_r_top}>
                                <div className={styles.con_r_top_meta}>
                                    <h1>{items.title}</h1>
                                    <p>{items.author}</p>
                                    <ul>
                                        <li>{items.symbol}</li>
                                        <li>{items.genre}</li>
                                        <li>{items.created_at.split("T")[0]}</li>
                                    </ul>
                                </div>

                                <div className={styles.con_r_top_hit}>
                                    <p>조회수 {items.hit}</p>
                                    <span onClick={marksUpdate}>
                                        {key && (bookMarks === null ? (<span>★</span>) : <span style={{ color: '#FFD700' }}>★</span>)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className={styles.con_r_bottom}>
                            <button onClick={epubRead}>바로읽기</button>
                            <button onClick={() => { setReviewBoolean((prev) => prev ? false : true) }}>
                                {reviewBoolean ? (
                                    <span>메타데이터 읽기</span>
                                ) : (
                                    <span>Ai 서평 읽기</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
