'use client';

import useSWR from "swr";
import { useEffect, useState, useRef } from 'react';
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';
import styles from './rank.module.css';
import { z } from 'zod';
import Image from 'next/image';
import { BooksRow, BooksRowSchema, BooksRowRank } from "@/types/schemas";
import { useRankCalc, } from "@/hook/hook";
import Genre from "@/components/genre/genre";
import { useRouter } from 'next/navigation';

export default function Page() {



    const rankGet = async (genre: string): Promise<BooksRow[]> => {
        try {

            const res = await fetch(`/api/rank?g=${genre}`);

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

            const item = data.data;
            const zodResult = z.array(BooksRowSchema).safeParse(item);
            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error("유효성 검사 실패");
            }

            return zodResult.data;
        } catch (error: any) {
            throw error;
        }

    }

    const handleChildClick = (g: string) => {
        setGenre(g);
        rankGet(g);
    }

    const [genre, setGenre] = useState<string>('전체');
    const { data: item, error, isLoading } = useSWR<BooksRow[]>(`/api/rank?g=${genre}`, () => rankGet(genre));
    const [items, setItems] = useState<BooksRowRank[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (item) {
            (async () => {
                setItems(item);
                useRankCalc(setItems, genre);
            })();
        }
    }, [item]);



    if (error) return <p>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</p>;

    return (
        <>
            <div className={styles.con}>
                <h1>인기순</h1>
                <Genre onChildClick={handleChildClick} />
                <div style={{ minHeight: '400px' }}>
                    {items.length !== 0 && (
                        <>
                            <SwiperComponent
                                spaceBetween={0}
                                slidesPerView="auto"
                                navigation={false}
                                loop={false}
                                breakpoints={{
                                    0: { enabled: true },
                                    1360: { enabled: false },
                                }}
                                className={styles.swiperCon}
                            >
                                {Array.from({ length: 4 }).map((none, i) => (
                                    <SwiperSlide style={{ width: 'auto' }}>
                                        {items.slice((3 * i), (3 * (i + 1))).map((el, index) => {
                                            if (!el.img_path) return;
                                            return (
                                                <div className={styles.slideLi} key={el.id ?? index} onClick={() => { router.push(`/bookDetail/${el.uuid}`) }}>
                                                    <Image
                                                        className="bookCoverShadow"
                                                        src={`/img/book_covers/${el.img_path}`}
                                                        alt="북커버"
                                                        width={80}
                                                        height={120}
                                                    />
                                                    <h1>{(3 * i + 1) + index}</h1>
                                                    <div>
                                                        <span className={el.rankCalc?.state}>
                                                            {el.rankCalc?.state === 'rank_up' && (
                                                                <>
                                                                    <i>↑</i>
                                                                    {el.rankCalc?.calc}
                                                                </>
                                                            )}
                                                            {el.rankCalc?.state === 'rank_down' && (
                                                                <>
                                                                    <i>↓</i>
                                                                    {el.rankCalc?.calc}
                                                                </>
                                                            )}
                                                            {el.rankCalc?.state === 'rank_same' && (<i>–</i>)}
                                                            {el.rankCalc?.state === 'rank_new' && (<>new</>)}
                                                        </span>
                                                        <h1>{el.title}</h1>
                                                        <p>{el.author}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </SwiperSlide>
                                ))}
                            </SwiperComponent>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
