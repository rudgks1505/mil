'use client'

import Mainvisual from '@/components/adm/mainvisual/mainvisual';
import styles from "../page.module.css";
import { useState, useCallback } from 'react';
import { mutate } from "swr";
import type { TablesInsert } from "@/types/helper";
import { fileSet } from "@/lib/adm/utils";
import { publicMainvisualInsertSchema } from "@/types/zodSchemas";
import { slide_order, upload } from "@/types/schemas";

type MainvisualInsert = TablesInsert<"mainvisual">;

export default function Page() {

    const mainvisualUpdate = async (
    ) => {
        try {
            if (!confirm('등록하시겠습니까?')) {
                return false
            }

            //슬라이더 순서 디폴트0, 0제외 순서중복 확인.
            const zodResult = publicMainvisualInsertSchema.superRefine((val, ctx) => {
                const issues = (field: string, i: number) => {
                    ctx.addIssue({
                        code: "custom",
                        message: `${field}을 입력해주세요`,
                        path: [i, `${field}`],
                    });
                }
                val.title.trim() == "" && (issues('title', 0));
                if (val.slide_order !== 0) {
                    if (slide_order_props.some(el => el.slide_order == val.slide_order)) {
                        ctx.addIssue({
                            code: "custom",
                            message: `0 제외, 슬라이더 순서 중복`,
                            path: [0, `slide_order`],
                        });
                    };
                };
                if (!(uploadstate[0].file instanceof File && uploadstate[0].m?.file instanceof File)) issues('file', 0);
            }).safeParse(inp);

            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error(JSON.stringify(zodResult.error.issues.map(issue => issue.message).join(', ')));
            }

            const fd = new FormData();
            if (uploadstate[0].file && uploadstate[0].m) {
                fd.append('id', "0");
                fd.append('file', uploadstate[0].file);
                fd.append('m', uploadstate[0].m.file);
            }
            fd.append("items", JSON.stringify(zodResult.data));

            const res = await fetch('/api/adm/mainvisual', {
                method: 'POST',
                body: fd,
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
            mutate("/api/adm/mainvisual");
            alert('등록 완료');

        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
        };
    }

    const send_slide_order = useCallback((data: slide_order) => {
        set_slide_order_props(data.map(el => ({ ...el })));
    }, []);
    const [slide_order_props, set_slide_order_props] = useState<slide_order>([]);
    const [inp, setInp] = useState<MainvisualInsert>({
        agree: false,
        slide_order: 0,
        title: '',
        sub_title: '',
        book_link: '',
    });

    const [uploadstate, setUploadstate] = useState<upload[]>([{
        file: null,
        id: 0,
        m: null,
    }]);


    return (
        <>
            <div className={styles.con}>
                <div className={styles.btn_con}>
                    <button onClick={mainvisualUpdate}>슬라이더 등록</button>
                </div>
                <div className={styles.scroll_con}>
                    <table className={styles.con_table}>
                        <thead>
                            <tr>
                                <th className={styles.th1_sticky}>슬라이더 순서</th>
                                <th>제목</th>
                                <th>요약</th>
                                <th>링크</th>
                                <th>pc 이미지 업로드 (10MB 제한)</th>
                                <th>모바일이미지 업로드 (10MB 제한)</th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr>
                                <td className={styles.th1_sticky}>
                                    <input onChange={(event) => {
                                        setInp((prev) => {
                                            const copy = { ...prev };
                                            copy.slide_order = Number(event.target.value);
                                            return copy
                                        });
                                    }}
                                        value={inp.slide_order}
                                    ></input>
                                </td>
                                <td>
                                    <input onChange={(event) => {
                                        setInp((prev) => {
                                            const copy = { ...prev };
                                            copy.title = event.target.value;
                                            return copy
                                        });
                                    }}
                                        value={inp.title}
                                    ></input>
                                </td>
                                <td>
                                    <input onChange={(event) => {
                                        setInp((prev) => {
                                            const copy = { ...prev };
                                            copy.sub_title = event.target.value;
                                            return copy
                                        });
                                    }}
                                        value={inp.sub_title == null ? '' : inp.sub_title}
                                    ></input>
                                </td>
                                <td>
                                    <input onChange={(event) => {
                                        setInp((prev) => {
                                            const copy = { ...prev };
                                            copy.book_link = event.target.value;
                                            return copy
                                        });
                                    }}
                                        value={inp.book_link == null ? '' : inp.book_link}
                                    ></input>
                                </td>
                                <td>
                                    <input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => fileSet(e, 0, 0, setUploadstate, null)} />
                                </td>
                                <td>
                                    <input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        fileSet(e, 0, 0, setUploadstate, f ? { file: f } : null)
                                    }} />
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>
            <Mainvisual onDataSent={send_slide_order} ></Mainvisual>
        </>
    )
};