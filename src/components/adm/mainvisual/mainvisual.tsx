'use client'

import { useEffect, useState, useMemo, useCallback } from 'react';
import styles from "@/app/adm/page.module.css";
import useSWR, { mutate } from "swr";
import { z } from 'zod';
import { publicMainvisualInsertSchema } from "@/types/zodSchemas";
import { deleteItemsSchema, slide_order, upload } from "@/types/schemas";
import { useDelete } from "@/hook/hook";
import { fileSet, ContentChage, mainvisualGet, Toggle, } from "@/lib/adm/utils";
import { Mainvisual } from "@/types/schemas";
import omit from 'lodash/omit';

interface ChildProps {
    onDataSent: (data: slide_order) => void;
}

export default function Page({ onDataSent }: ChildProps) {

    const mainvisualUpdate = async (
    ) => {
        try {
            if (!confirm('수정하시겠습니까?')) return false;

            const updateItem = items.map((el) => omit(el, ["img_path", "img_path_m"]))

            const zodResult = z.array(publicMainvisualInsertSchema).superRefine((val, ctx) => {

                const issues = (field: string, i: number) => {
                    ctx.addIssue({
                        code: "custom",
                        message: `${field}을 입력해주세요`,
                        path: [i, `${field}`],
                    });
                }
                val.forEach((el, i) => {
                    if (el.slide_order !== 0) {
                        val.forEach((other, j) => {
                            if (other.slide_order !== 0) {
                                if (i !== j && el.slide_order === other.slide_order) {
                                    ctx.addIssue({
                                        code: "custom",
                                        message: `슬라이더 순서 ${el.slide_order} 중복`,
                                        path: [i, "slide_order"],
                                    });
                                }
                            }
                        })
                    }
                    if (el.title.trim() == "") (issues('title', i));
                    if ((uploadstate[i].file instanceof File && !(uploadstate[i].m?.file instanceof File)) ||
                        (!(uploadstate[i].file instanceof File) && uploadstate[i].m?.file instanceof File)
                    ) {
                        issues('같은 행의 PC용·모바일용 이미지를 모두', i);
                    }
                });


            }).safeParse(updateItem);

            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error(JSON.stringify(zodResult.error.issues.map(issue => issue.message).join(', ')));
            }

            const fd = new FormData();
            uploadstate.forEach((el) => {
                fd.append('id', String(el.id));
                fd.append('file', el.file ? el.file : 'null');
                fd.append('m', el.m ? el.m.file : 'null');
            });
            fd.append("items", JSON.stringify(items));

            const res = await fetch('/api/adm/mainvisual', {
                method: 'PUT',
                body: fd,
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
            mutate("/api/adm/mainvisual");
            alert('업데이트 완료');
        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
        };
    }

    const mainvisualDelete = async (
    ) => {
        try {
            if (!confirm('삭제하시겠습니까?')) {
                return false
            }
            const zodResult = deleteItemsSchema.safeParse([...deleteItems]);
            if (!zodResult.success) throw new Error("유효성 검사 실패");

            const res = await fetch('/api/adm/mainvisual', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(zodResult.data),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
            mutate("/api/adm/mainvisual");
            alert('삭제 완료');
        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
        };
    }

    const { data: item, error } = useSWR<Mainvisual[]>("/api/adm/mainvisual", mainvisualGet);
    const [items, setItems] = useState<Mainvisual[]>([]);
    const [originItems, setOriginItems] = useState<Mainvisual[]>([]);
    const { deleteItems, setDeleteItems } = useDelete();
    const [allToggle, setAllToggle] = useState<Set<number>>(new Set());

    const [uploadstate, setUploadstate] = useState<upload[]>([{
        file: null,
        id: 0,
        m: null,
    }]);

    const send_slide_order = useMemo<slide_order>(() => {
        if (!item) return [];
        return item.map(el => ({ id: el.id, slide_order: el.slide_order }));
    }, [item]);

    const setUploadstateCall = useCallback(() => {
        if (!item) return
        setUploadstate((prev) => {
            const copy = structuredClone(prev);
            for (let i = 0; i < item.length; i++) {
                copy[i] = { ...copy[0] };
            }
            return copy
        })
    }, [item])



    useEffect(() => {
        if (item) {
            onDataSent(send_slide_order);
            setItems(item.map(el => ({ ...el })));
            setOriginItems(item.map(el => ({ ...el })));
            setAllToggle(new Set(item.map(el => el.id)));
            setUploadstateCall()
        }
    }, [item, setUploadstateCall, onDataSent, send_slide_order]);

    if (error) return <p>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</p>;


    return (
        <div className={styles.con}>
            <div className={styles.btn_con}>
                <button onClick={mainvisualUpdate}>수정</button>
                <button onClick={mainvisualDelete}>삭제</button>
            </div>
            {(items && originItems) && (
                <div className={styles.scroll_con}>
                    <table className={styles.con_table}>
                        <thead>
                            <tr>
                                <th className={styles.th1_sticky}>
                                    <div>활성화<input type="checkbox" onChange={(e) => {
                                        setItems(items.map((el) => {
                                            return { ...el, agree: e.target.checked }
                                        }));
                                    }} /></div>
                                </th>
                                <th className={styles.th2_sticky} style={{ left: "90px" }}>슬라이더 순서</th>
                                <th>
                                    <div>삭제<input type="checkbox" onChange={(e) => {
                                        Toggle(e.target.checked, [...allToggle], setDeleteItems);
                                    }} /></div>
                                </th>
                                <th>제목</th>
                                <th>요약</th>
                                <th>링크</th>
                                <th>pc 이미지 업로드 (10MB 제한)</th>
                                <th>pc 등록된 이미지</th>
                                <th>m 이미지 업로드 (10MB 제한)</th>
                                <th>m 등록된 이미지</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((el, index) => {
                                return (
                                    <tr key={index}>
                                        <td className={styles.th1_sticky}>
                                            <input type="checkbox"
                                                onChange={(e) => {
                                                    setItems((prev) => {
                                                        const copy = [...prev];
                                                        copy[index].agree = e.target.checked;
                                                        return copy;
                                                    })
                                                }}
                                                checked={el.agree ?? false}
                                            />
                                        </td>
                                        <td className={styles.th2_sticky} style={{ left: "90px" }}>
                                            <input type="number"
                                                onChange={(event) => {
                                                    setItems((prev) => {
                                                        const copy = [...prev];
                                                        copy[index].slide_order = Number(event.target.value);
                                                        return copy;
                                                    })
                                                }}
                                                className={
                                                    ContentChage(Number(items[index].slide_order), Number(originItems[index].slide_order)) ?
                                                        styles.inactive :
                                                        styles.active
                                                }
                                                value={el.slide_order}
                                            ></input>
                                        </td>
                                        <td>
                                            <input type="checkbox"
                                                onChange={(e) => {
                                                    Toggle(e.target.checked, [el.id], setDeleteItems);
                                                }}
                                                checked={deleteItems.has(el.id) ?? false}
                                            />
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
                                                    copy[index].sub_title = event.target.value;
                                                    return copy;
                                                })
                                            }}
                                                className={
                                                    ContentChage(items[index].sub_title, originItems[index].sub_title) ?
                                                        styles.inactive :
                                                        styles.active
                                                }
                                                value={el.sub_title == null ? '' : el.sub_title}
                                            ></input>
                                        </td>
                                        <td>
                                            <input onChange={(event) => {
                                                setItems((prev) => {
                                                    const copy = [...prev];
                                                    copy[index].book_link = event.target.value;
                                                    return copy;
                                                })
                                            }}
                                                className={
                                                    ContentChage(items[index].book_link, originItems[index].book_link) ?
                                                        styles.inactive :
                                                        styles.active
                                                }
                                                value={el.book_link == null ? '' : el.book_link}
                                            ></input>
                                        </td>
                                        <td>
                                            <input type="file" accept="mage/png, image/jpeg, image/webp" onChange={(e) => fileSet(e, el.id, index, setUploadstate, null)} />
                                        </td>
                                        <td>
                                            <button onClick={() => {
                                                window.open(`/img/mainvisual/${el.img_path}`, "_blank", "noopener,noreferrer");
                                            }}>보기</button>
                                        </td>
                                        <td>
                                            <input type="file" accept="mage/png, image/jpeg, image/webp" onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                fileSet(e, el.id, index, setUploadstate, f ? { file: f } : null)
                                            }} />
                                        </td>
                                        <td>
                                            <button onClick={() => {
                                                window.open(`/img/mainvisual/${el.img_path_m}`, "_blank", "noopener,noreferrer");
                                            }}>보기</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
};