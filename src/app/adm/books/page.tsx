'use client';

import Select, { type StylesConfig } from "react-select";
import styles from "../page.module.css";
import { useState } from 'react';
import { InpBookSchema, ReactSelect } from "@/types/schemas";
import { useAppDispatch, useAppSelector } from "@/hook/hook";
import { on, off } from "@/store/loaderSlice";
import Books from "@/components/adm/books/books";

export default function Page() {

    const createBook = async (
    ) => {
        try {
            if (!inpBook) {
                alert('장르를 선택해주세요.');
                return
            }

            if (!confirm('생성하시겠습니까?')) {
                return
            }
            dispatch(on());
            const zodResult = InpBookSchema.safeParse(inpBook);
            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error("유효성 검사 실패");
            }

            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(zodResult.data),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

            dispatch(off());
            alert('생성 완료');
        } catch (err: unknown) {
            dispatch(off());
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
        };
    }
    const dispatch = useAppDispatch();
    const genres = useAppSelector((state) => state.genre.genres);
    const [inpBook, setInpBook] = useState<ReactSelect | null>(null);

    const reactSelectStyles: StylesConfig<ReactSelect, false> = {
        container: (base) => ({
            ...base,
            width: 400,
            padding: 10,
        }),
        control: (base, _state) => ({
            ...base,
            boxShadow: "none",
            borderColor: "#ccc",
            ":hover": { borderColor: "#ccc" },
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "transparent"
                : state.isFocused
                    ? "transparent"
                    : base.backgroundColor,
            color: "black",
        }),
        menuPortal: (base) => ({ ...base, zIndex: 300 }),
    };



    return (
        <>
            <div className={styles.con}>
                <div className={styles.btn_con}>
                    <button onClick={createBook}>책 생성</button>
                </div>
                <div className={styles.scroll_con}>
                    <table className={styles.con_table}>
                        <thead>
                            <tr>
                                <th>장르</th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr>
                                <td className={styles.th1_sticky}>
                                    <Select
                                        instanceId="genre-select"
                                        options={genres}
                                        styles={reactSelectStyles}
                                        value={inpBook}
                                        isSearchable={false}
                                        placeholder="장르를 선택하세요"
                                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                        onChange={(opt) => setInpBook(opt)}
                                    />
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>
            <Books></Books>
        </>
    );
}
