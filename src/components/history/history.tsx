'use client';

import styles from "./history.module.css";
import useSWR from "swr";
import { useEffect, useState } from 'react';
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { BooksRow, BooksRowSchema } from "@/types/schemas";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'



export default function Page() {

    const historyGet = async (): Promise<BooksRow[] & { visited_at?: string }> => {
        try {
            const res = await fetch('/api/epub/history');
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
            const Items = data.data;

            const zodItems = z.array(BooksRowSchema.extend({ visited_at: z.string().optional() })).safeParse(Items);
            if (!zodItems.success) {
                console.error(zodItems.error.issues);
                throw new Error("유효성 검사 실패");
            }
            return zodItems.data;
        } catch (error: any) {
            throw error;
        }

    }
    const supabase = createClientComponentClient();
    const [ment, setMent] = useState<string>('');
    const [key, setKey] = useState<string | null>(null);
    const { data: item, error, isLoading } = useSWR<(BooksRow & { visited_at?: string })[]>(key, historyGet);
    const [items, setItems] = useState<(BooksRow & { visited_at?: string })[]>([]);
    const router = useRouter();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            try {
                setKey(!session ? null : '/api/epub/history');
                setMent(!session ? '로그인 후 이용 가능합니다.' : '방문 기록이 없습니다.');
            } catch (err: any) {
                console.error(err);
                alert('요청 처리 중 오류.');
                return
            }
        })

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (item) {
            setItems(item);
        }
    }, [item]);



    if (error) return <p>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</p>;

    return (
        <>

            <div className={styles.con}>
                <h1>최근 읽은 책</h1>
                {items.length == 0 ? (
                    <p>{ment}</p>
                ) : (
                    <SwiperComponent
                        slidesPerView="auto"
                        navigation={false}
                        loop={false}
                        className={styles.Swiper}
                    >
                        {items.map((el, index) => {
                            if (!el.img_path) return;
                            return (
                                <SwiperSlide key={el.id ?? index} className={styles.Swiper_slide} onClick={() => { router.push(`/bookDetail/${el.uuid}`); }}>
                                    <Image
                                        className="bookCoverShadow"
                                        src={`/img/book_covers/${el.img_path}`}
                                        alt="북커버"
                                        width={145}
                                        height={217.5}
                                    />
                                    <h1>{el.title}</h1>
                                    <h2>{el.author}</h2>
                                    <p>{el.visited_at?.split("T")[0]}</p>
                                    <p>{el.visited_at?.split("T")[1].split(".")[0]}</p>
                                </SwiperSlide>
                            )
                        })}
                    </SwiperComponent>
                )}
            </div>
        </>
    );
}
