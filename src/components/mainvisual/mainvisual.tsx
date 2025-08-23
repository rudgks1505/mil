'use client';

import styles from "./mainvisual.module.css";
import useSWR from "swr";
import { useEffect, useState } from 'react';
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import Link from "next/link";
import type { Swiper } from 'swiper';


export default function Page() {
    return (
        <>
            <div className={styles.con}>
                <SwiperComponent
                    spaceBetween={0}
                    slidesPerView={1}
                    navigation={true}
                    modules={[Navigation, Autoplay]}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    className={styles.swiper}
                    loop={true}
                >

                    <SwiperSlide className={styles.swiperSlide}>
                        asd
                    </SwiperSlide>


                </SwiperComponent>
            </div>
        </>
    );
}
