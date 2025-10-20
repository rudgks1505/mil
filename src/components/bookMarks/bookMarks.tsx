'use client';

import styles from "./bookMarks.module.css";
import useSWR from "swr";
import { useEffect, useState } from 'react';
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { BooksRow, BooksRowSchema } from "@/types/schemas";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'


export default function Page() {

    const bookMarksGet = async (): Promise<BooksRow[]> => {
        try {
            const res = await fetch('/api/bookMarks');
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
            const Items = data.data;

            const zodItems = z.array(BooksRowSchema).safeParse(Items);
            if (!zodItems.success) {
                console.error(zodItems.error.issues);
                throw new Error("유효성 검사 실패");
            }
            return zodItems.data;
        } catch (err: unknown) {
            throw err;
        }

    }
    const supabase = createClientComponentClient();

    const [key, setKey] = useState<string | null>(null);
    const { data: item, error } = useSWR<BooksRow[]>(key, bookMarksGet);
    const [items, setItems] = useState<BooksRow[]>([]);
    const [ment, setMent] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setKey(!session ? null : '/api/bookMarks');
            setMent(!session ? '로그인 후 이용 가능합니다.' : '즐겨찾기한 책이 없습니다.');
        })

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    useEffect(() => {
        if (item) setItems(item)
    }, [item]);



    if (error) return <p>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</p>;

    return (
        <>

            <div className={styles.con}>
                <h1>즐겨찾기에 추가한 책</h1>
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
                                </SwiperSlide>
                            )
                        })}
                    </SwiperComponent>
                )}
            </div>
        </>
    );
}
