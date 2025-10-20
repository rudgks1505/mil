'use client';

import styles from "./mainvisual.module.css";
import useSWR from "swr";
import { useEffect, useState, useRef } from 'react';
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import Link from "next/link";
import { Mainvisual } from "@/types/schemas";
import { mainvisualGet } from "@/lib/adm/utils";
import { debounce } from "lodash";
import Image from 'next/image';
import type { Swiper as SwiperType } from 'swiper';

export default function Page() {


    const { data: item, error } = useSWR<Mainvisual[]>("/api/mainvisual", mainvisualGet);
    const swiperRef = useRef<SwiperType | null>(null);
    const [swipeIndex, setSwipeIndex] = useState<number>(0);
    const [swipePause, setSwipePause] = useState<boolean>(false);
    const [userSize, setUserSize] = useState<number>(0)


    useEffect(() => {
        const update = debounce(() => {
            setUserSize(window.innerWidth);
        }, 500);

        window.addEventListener("resize", update);
        update();

        return () => {
            window.removeEventListener("resize", update);
            update.cancel();
        }
    }, []);


    if (error) return <p>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</p>;

    return (
        <>
            <div className={styles.con}>
                <SwiperComponent
                    onSwiper={(swiper) => swiperRef.current = swiper}
                    modules={[Navigation, Autoplay]}
                    onSlideChange={(swiper) => setSwipeIndex(swiper.realIndex)}
                    effect="slide"
                    centeredSlides={true}
                    slidesPerView={1}
                    spaceBetween={100}
                    fadeEffect={{ crossFade: true }}
                    autoplay={{ delay: 6000, disableOnInteraction: false }}
                    navigation={{
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    }}
                    onAutoplayResume={() => setSwipePause(false)}
                    className={styles.swiper}
                    loop={false}
                >
                    {item && (
                        item.map((el, index) => {
                            return (
                                <SwiperSlide key={index}
                                    className={styles.swiperSlide}
                                >
                                    <Image
                                        src={userSize >= 600 ? `/img/mainvisual/${el.img_path}` : `/img/mainvisual/${el.img_path_m}`}
                                        alt="슬라이더 이미지"
                                        fill
                                    />
                                    <Link href={el.book_link || '#'}
                                        target={el.book_link ? '_blank' : '_self'}
                                        rel="noopener noreferrer">
                                        <div>
                                            <h1><pre>{userSize >= 600 ? el.title.replace(/15051505/g, '\t') : el.title.replace(/15051505/g, '\n')}</pre></h1>
                                            <p>{el.sub_title}</p>
                                        </div>
                                    </Link>
                                </SwiperSlide>
                            )
                        })
                    )}
                    <ul className={styles.couter}>
                        <li onClick={() => {
                            swipePause ? swiperRef.current?.autoplay.resume()
                                : swiperRef.current?.autoplay.pause();

                            setSwipePause((prev) => !prev);
                        }}>
                            {swipePause ? (<p>▶</p>) : (<p style={{ fontSize: '17px', marginTop: '-5px' }}>⏸</p>)}
                        </li>
                        <li>
                            <p>{swipeIndex + 1}</p>
                            <p>/</p>
                            <p>{item?.length}</p>
                        </li>
                    </ul>
                    <div className={`swiper-button-prev ${styles.prev}`}></div>
                    <div className={`swiper-button-next ${styles.next}`}></div>
                </SwiperComponent>
            </div >
        </>
    );
}
