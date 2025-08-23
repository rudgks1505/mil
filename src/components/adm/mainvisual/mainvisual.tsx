'use client'

import { useEffect, useState } from 'react';
import styles from "@/app/adm/page.module.css";
import useSWR, { mutate } from "swr";

export default function Page(): React.ReactElement {

    const [order, setOrder] = useState<number>(0);
    const [bookId, setBookId] = useState<number>(0);
    const [title, setTitle] = useState<string>('');
    const [summation, setSummation] = useState<string>('');
    const [bookLink, setBooklink] = useState<string>('');


    const mainvisualGet = async (
    ) => {
        const res = await fetch('/api/adm/mainvisual');
        const data = await res.json();
        if (!res.ok) {
            alert(`패치 오류`);
            return false;
        }
        console.log(data);
        return data;
    }

    const { data: swrData, error, isLoading } = useSWR("/api/adm/mainvisual", mainvisualGet);

    useEffect(() => {

    }, []);

    if (isLoading) return <p>로딩 중...</p>;
    if (error) return <p>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</p>;


    return (
        <>
            {swrData && (
                <>
                    <button>수정</button>
                    <table className={styles.con_table}>
                        <thead>
                            <tr>
                                <th>슬라이더 순서 (유니크 키)</th>
                                <th>참조 BookId</th>
                                <th>제목</th>
                                <th>요약</th>
                                <th>링크</th>
                                <th>이미지 업로드</th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr>
                                <td>
                                    <input onBlur={(event) => {
                                        setOrder(Number(event.target.value));
                                    }}></input>
                                    <span></span>
                                </td>
                                <td>
                                    <input onBlur={(event) => {
                                        setBookId(Number(event.target.value));
                                    }}></input>
                                    <span></span>
                                </td>
                                <td>
                                    <input onBlur={(event) => {
                                        setTitle(event.target.value);

                                    }} ></input>

                                    <span></span>
                                </td>
                                <td>
                                    <input onBlur={(event) => {
                                        setSummation(event.target.value);

                                    }}></input>

                                    <span></span>
                                </td>
                                <td>
                                    <input onBlur={(event) => {
                                        setBooklink(event.target.value);

                                    }} ></input>
                                </td>
                                <td>
                                    <button>aa</button>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </>
            )}

        </>
    )
};