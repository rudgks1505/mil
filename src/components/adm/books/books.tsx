'use client';

import styles from "@/app/adm/page.module.css";
import useSWR, { mutate } from "swr";
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { ContentChage, Toggle } from "@/lib/adm/utils";
import { deleteItemsSchema } from "@/types/schemas";
import { publicBooksInsertSchema, publicBooksRowSchema } from "@/types/zodSchemas";
import { useDelete } from "@/hook/hook";
import { useRouter } from 'next/navigation';
import type { Tables } from "@/types/helper";

export default function Page() {


    const booksGet = async (): Promise<Tables<"books">[]> => {
        try {
            const res = await fetch(`/api/adm/books/private`);
            const data = await res.json();

            if (!res.ok) throw new Error(`데이터 처리 중 오류가 발생했습니다.`);
            const item = data.data;

            const zodResult = z.array(publicBooksRowSchema).safeParse(item);
            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error("유효성 검사 실패");
            }
            return zodResult.data;
        } catch (error: unknown) {
            throw error;
        }

    }

    const booksDelete = async (
    ) => {
        try {
            if (!confirm('삭제하시겠습니까?')) {
                return false
            }
            const zodResult = deleteItemsSchema.safeParse([...deleteItems]);
            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error("유효성 검사 실패");
            }

            const res = await fetch('/api/adm/books/private', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(zodResult.data),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

            mutate("/api/adm/books?qu=''&main?=false");
            alert('삭제 완료');
        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
        };
    }


    const booksUpdate = async (
    ) => {
        try {
            if (!confirm('수정하시겠습니까?')) {
                return false
            }
            const zodResult = z.array(publicBooksInsertSchema).safeParse(items);
            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error("유효성 검사 실패");
            }

            const res = await fetch('/api/adm/books/private', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(zodResult.data),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

            mutate("/api/adm/books/private");
            alert('수정 완료');
        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
        };
    }

    const router = useRouter();
    const { data: item, error } = useSWR<Tables<"books">[]>(`/api/adm/books/private`, booksGet);

    const [items, setItems] = useState<Tables<"books">[]>([]);
    const [originItems, setOriginItems] = useState<Tables<"books">[]>([]);
    const { deleteItems, setDeleteItems } = useDelete();
    const [allToggle, setAllToggle] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (item) {
            setItems(item.map(el => ({ ...el })));
            setOriginItems(item.map(el => ({ ...el })));
            setAllToggle(new Set(item.map(el => el.id)));
        }
    }, [item])

    if (error) return <p>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</p>;

    return (
        <>
            <div className={styles.con}>
                <div className={styles.btn_con}>
                    <button onClick={booksDelete}>책 삭제</button>
                    <button onClick={booksUpdate}>메타데이터 수정</button>
                </div>
                <div className={styles.scroll_con}>
                    <table className={styles.con_table}>
                        <thead>
                            <tr>
                                <th><div><input type="checkbox" onChange={(e) => {
                                    Toggle(e.target.checked, [...allToggle], setDeleteItems);
                                }} /></div></th>
                                <th>책 고유번호</th>
                                <th>장르</th>
                                <th>제목</th>
                                <th>작가</th>
                                <th>챕터 보기</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(items && originItems) && (
                                items.map((el, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className={styles.th1_sticky}>
                                                <input type="checkbox"
                                                    onChange={(e) => {
                                                        Toggle(e.target.checked, [el.id], setDeleteItems);
                                                    }}
                                                    checked={deleteItems.has(el.id) ?? false}
                                                />
                                            </td>
                                            <td>
                                                <p>{el.id}</p>
                                            </td>
                                            <td>
                                                <p>{el.genre}</p>
                                            </td>
                                            <td>
                                                <input onChange={(event) => {
                                                    setItems((prev) => {
                                                        const copy = [...prev];
                                                        copy[index].title = event.target.value;
                                                        return copy;
                                                    })
                                                }}
                                                    className={
                                                        ContentChage(items[index].title, originItems[index].title) ?
                                                            styles.inactive :
                                                            styles.active
                                                    }
                                                    value={el.title}
                                                ></input>
                                            </td>
                                            <td>
                                                <input onChange={(event) => {
                                                    setItems((prev) => {
                                                        const copy = [...prev];
                                                        copy[index].author = event.target.value;
                                                        return copy;
                                                    })
                                                }}
                                                    className={
                                                        ContentChage(items[index].author, originItems[index].author) ?
                                                            styles.inactive :
                                                            styles.active
                                                    }
                                                    value={el.author}
                                                ></input>
                                            </td>
                                            <td>
                                                <button onClick={() => { router.push(`/adm/chapters/${el.uuid}`) }}>보기</button>
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
