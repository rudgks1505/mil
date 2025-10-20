'use client';

import styles from "./newBooks.module.css";
import useSWR from "swr";
import { useEffect, useState } from 'react';
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import Image from 'next/image';
import { booksGet, } from "@/lib/adm/utils";
import { BooksRow, } from "@/types/schemas";
import { useRouter } from 'next/navigation';


export default function Page() {

    const router = useRouter();
    const { data: item, error } = useSWR<BooksRow[]>("/api/adm/books?qu=''", () => booksGet(""));
    const [items, setItems] = useState<BooksRow[]>([]);

    useEffect(() => {
        if (item) setItems(item);
    }, [item]);


    if (error) return <p>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</p>;

    return (
        <>
            <div className={styles.con}>
                <h1>따끈따끈 새로 들어온 책</h1>
                {items.length !== 0 && (
                    <SwiperComponent
                        spaceBetween={10}
                        slidesPerView="auto"
                        navigation={false}
                        modules={[Navigation, Autoplay]}
                        autoplay={{ delay: 6000, disableOnInteraction: false }}
                        loop={false}
                        className={styles.topSwiper}
                    >

                        {items.map((el, index) => {
                            if (!el.img_path) return;
                            return (
                                <SwiperSlide key={el.id ?? index} className={styles.topSwiper_slide} onClick={() => { router.push(`/bookDetail/${el.uuid}`) }}>
                                    <Image
                                        className="bookCoverShadow"
                                        src={`/img/book_covers/${el.img_path}`}
                                        alt="북커버"
                                        width={125}
                                        height={187.5}
                                    />
                                    <h1>{el.title}</h1>
                                    <p>{el.author}</p>
                                </SwiperSlide>
                            )
                        })}
                    </SwiperComponent>
                )}
            </div>
        </>
    );
}
