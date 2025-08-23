'use client'

import Mainvisual from '@/components/adm/mainvisual/mainvisual';
import styles from "../page.module.css";
import { useEffect, useState } from 'react';
import useSWR, { mutate } from "swr";

export default function Page(): React.ReactElement {

    const [order, setOrder] = useState<number>(0);
    const [bookId, setBookId] = useState<number>(0);
    const [title, setTitle] = useState<string>('');
    const [summation, setSummation] = useState<string>('');
    const [bookLink, setBooklink] = useState<string>('');

    const mainvisualUpdate = async (
    ) => {
        const sendData = {
            order: order,
            bookId: bookId,
            title: title,
            summation: summation,
            bookLink: bookLink
        }

        const res = await fetch('/api/adm/mainvisual', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendData),
        });

        if (!res.ok) {
            const data = await res.json();
            const error = new Error(`api오류 : ${data.error}`);
            throw error;
        }

        mutate("/api/adm/mainvisual");
        return res.json();
    }


    useEffect(() => {

    }, []);

    return (
        <>
            <div className={styles.con}>
                <button onClick={mainvisualUpdate}>슬라이더 추가 등록</button>
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

                <Mainvisual></Mainvisual>
            </div>
        </>
    )
};