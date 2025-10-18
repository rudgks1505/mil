'use client';

import styles from "./genre.module.css";
import { useAppSelector } from "@/hook/hook";
import { useState } from "react";
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';

type ChildProps = {
    onChildClick: (value: string) => void;
};

export default function Page({ onChildClick }: ChildProps) {

    const genres = useAppSelector((state) => state.genre.genres);
    const [toggle, setToggle] = useState<string>('전체');

    return (
        <SwiperComponent
            spaceBetween={0}
            slidesPerView="auto"
            navigation={false}
            loop={false}
            breakpoints={{
                0: { enabled: true },
                1360: { enabled: false },
            }}
            className={styles.con}
        >
            <SwiperSlide style={{ width: 'auto' }}>
                <button
                    className={`${styles.genrebtn} ${toggle === '전체' && styles.on}`}
                    onClick={() => {
                        setToggle('전체');
                        onChildClick('전체');
                    }}
                >
                    전체
                </button>
            </SwiperSlide>

            {genres.map((el, index) => {
                return (
                    <SwiperSlide style={{ width: 'auto' }}>
                        <button className={`${styles.genrebtn} ${toggle === el.value && styles.on}`}
                            key={index}
                            onClick={() => {
                                setToggle(el.value);
                                onChildClick(el.value)
                            }}>
                            {el.label}
                        </button>
                    </SwiperSlide>
                )
            })}
        </SwiperComponent>

    );
}
