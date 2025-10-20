'use client';

import styles from "./page.module.css";
import useSWR from "swr";
import { useEffect, useState, useRef, memo, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { BooksRow, BooksRowSchema, BooksRowRank } from "@/types/schemas";
import Search from "@/components/search/search";
import Genre from "@/components/genre/genre";
import { RankCalc } from "@/lib/adm/utils";
import { debounce } from "lodash";

const Limemo = memo(function Limemo({
    id, uuid, img_path, title, author, index, rankCalc
}: Pick<BooksRowRank, 'id' | 'uuid' | 'img_path' | 'title' | 'author' | 'rankCalc'> & { index: number }) {
    const router = useRouter();
    if (!img_path) return null;
    return (
        <li>
            <Image
                className="bookCoverShadow"
                src={`/img/book_covers/${img_path}`}
                alt="북커버"
                width={80}
                height={120}
                quality={75}
                onClick={() => router.push(`/bookDetail/${uuid}`)}
            />


            <div className={styles.bookRank}>
                <h1>{index + 1}</h1>

                <span className={rankCalc?.state}>
                    {rankCalc?.state === 'rank_up' && (
                        <>
                            <i>↑</i>
                            {rankCalc?.calc}
                        </>
                    )}
                    {rankCalc?.state === 'rank_down' && (
                        <>
                            <i>↓</i>
                            {rankCalc?.calc}
                        </>
                    )}
                    {rankCalc?.state === 'rank_same' && (<i>–</i>)}
                    {rankCalc?.state === 'rank_new' && (<>new</>)}
                </span>

            </div>

            <div className={styles.bookMeta}>
                <h1 onClick={() => router.push(`/bookDetail/${uuid}`)}>{title}</h1>
                <p onClick={() => router.push(`/bookDetail/${uuid}`)}>{author}</p>
            </div>
        </li>
    );
},
    (prev, next) =>
        prev.id === next.id &&
        prev.uuid === next.uuid &&
        prev.img_path === next.img_path &&
        prev.title === next.title &&
        prev.author === next.author &&
        prev.index === next.index &&
        prev.rankCalc?.calc === next.rankCalc?.calc &&
        prev.rankCalc?.state === next.rankCalc?.state
);


export default function Page() {

    const [amount, setAmount] = useState<number>(0);
    const [count, setCount] = useState<number>(0);
    const ref = useRef<HTMLUListElement>(null);
    const [genre, setGenre] = useState<string>('전체');
    const [searchVal, setsearchVal] = useState<string>('');
    const [key, setKey] = useState<string>('');
    const [items, setItems] = useState<BooksRowRank[]>([]);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const { data: item, error } = useSWR<BooksRow[]>(key,
        async (url: string): Promise<BooksRow[]> => {
            try {
                const res = await fetch(url);
                const data = await res.json();
                console.log(data);
                if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

                const zodResult = z.array(BooksRowSchema).safeParse(data.data);
                if (!zodResult.success) {
                    console.error(zodResult.error.issues);
                    throw new Error('유효성 검사 실패');
                }

                return zodResult.data;
            } catch (error: unknown) {
                throw error;
            }
        }
    );


    const handleChildSearch = (val: string) => {
        setGenre('전체');
        setItems([]);
        setCount(0);
        setsearchVal(val);
    }
    const handleChildClick = (g: string) => {
        setGenre(g);
        setItems([]);
        setCount(0);
        setsearchVal('');
    }



    const obSet = useCallback(() => {
        if (!ref.current) return;
        if (!sentinelRef.current) return

        const rect = ref.current.getBoundingClientRect();
        const rectTop = Math.floor(rect.top);
        const li_h = 150;

        const update = () => {
            const user_h = Math.floor(window.visualViewport?.height ?? window.innerHeight);
            const user_w = Math.floor(window.visualViewport?.width ?? window.innerWidth);
            const row_col = (user_w < 599 ? 1 : (user_w < 1099 && user_w > 599) ? 2 : 3);
            setAmount(Math.ceil(((user_h - rectTop) / li_h)) * row_col);
        };
        update();

        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some(e => e.isIntersecting)) {
                    setCount((prev) => prev + 1);
                }
            },
            {
                root: null,
                rootMargin: "0px 0px 200px 0px",
                threshold: 0
            }
        );

        const target = sentinelRef.current;
        io.observe(target);


        return () => {
            io.disconnect();
        }
    }, []);

    const debouncedSetKey = useMemo(
        () => debounce((g, a, c, s) => setKey(`/api/search?g=${g}&a=${a}&c=${c}&s=${s}`), 300),
        []
    );

    useEffect(() => {
        if (!amount) return
        debouncedSetKey(genre, amount, count, searchVal);
        return () => debouncedSetKey.cancel();
    }, [genre, amount, count, searchVal, debouncedSetKey]);

    useEffect(() => {
        if (item) {
            setItems((prev) => [...prev, ...item])
        }
    }, [item]);

    useEffect(() => {
        if (item) {
            if (searchVal === '') RankCalc(setItems, genre);
        }
    }, [item, genre, searchVal]);

    useEffect(() => {
        const cleanup = obSet();
        return cleanup;
    }, [obSet, genre]);


    if (error) return <p>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</p>;

    return (
        <>
            <div className={styles.con}>
                <Search onChildSearch={handleChildSearch} holder='책 제목을 입력해주세요'></Search>
                <div style={{ margin: '30px 0' }}>
                    <Genre onChildClick={handleChildClick} />
                </div>
                <ul className={styles.bookUl} ref={ref}>
                    {items.length !== 0 ?
                        items.map((el, index) => {
                            return (
                                <Limemo
                                    key={el.id}
                                    id={el.id}
                                    uuid={el.uuid}
                                    img_path={el.img_path}
                                    title={el.title}
                                    author={el.author}
                                    index={index}
                                    rankCalc={el.rankCalc}
                                />

                            )
                        })
                        : (<li><p>검색 결과가 없습니다.</p></li>)}
                </ul>
            </div>
            <div ref={sentinelRef} style={{ height: '1px' }}></div>
        </>
    );
}
