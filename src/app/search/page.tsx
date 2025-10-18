'use client';

import styles from "./page.module.css";
import useSWR, { mutate } from "swr";
import { useEffect, useState, useRef, memo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { BooksRow, BooksRowSchema, BooksRowRank } from "@/types/schemas";
import Search from "@/components/search/search";
import Genre from "@/components/genre/genre";
import { debounce } from "lodash";
import { useRankCalc } from "@/hook/hook";

export default function Page() {

    const didRun = useRef<boolean>(false);
    const [amount, setAmount] = useState<number>(0);
    const [count, setCount] = useState<number>(0);
    const ref = useRef<HTMLUListElement>(null);
    const router = useRouter();
    const [genre, setGenre] = useState<string>('전체');
    const [seachVal, setSeachVal] = useState<string>('');
    const [key, setKey] = useState<string>('');
    const [refreshKey, setRefreshKey] = useState(0);

    const { data: item, error, isLoading } = useSWR<BooksRow[]>(key,
        async (url: string): Promise<BooksRow[]> => {
            try {
                const res = await fetch(url);
                const data = await res.json();

                if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

                const zodResult = z.array(BooksRowSchema).safeParse(data.data);
                if (!zodResult.success) {
                    console.error(zodResult.error.issues);
                    throw new Error('유효성 검사 실패');
                }

                return zodResult.data;
            } catch (error: any) {
                throw error;
            }
        }
    );

    const [items, setItems] = useState<BooksRowRank[]>([]);

    const handleChildSearch = (val: string) => {
        setRefreshKey(v => v + 1);
        setItems([]);
        setCount(0);
        setSeachVal(val);
        setGenre('전체');
    }
    const handleChildClick = (g: string) => {
        setRefreshKey(v => v + 1);
        setItems([]);
        setCount(0);
        setSeachVal('');
        setGenre(g);
    }

    const Limemo = memo(function ({
        id, uuid, img_path, title, author, index, rankCalc, refreshKey
    }: Pick<BooksRowRank, 'uuid' | 'img_path' | 'title' | 'author' | 'rankCalc'> & { id: number, index: number, refreshKey: number }) {
        if (!img_path) return;
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
            prev.rankCalc === next.rankCalc &&
            prev.refreshKey === next.refreshKey
    );

    useEffect(() => {
        if (!amount) return
        setKey(`/api/search?g=${genre}&a=${amount}&c=${count}&s=${seachVal}`);
    }, [amount, count]);

    useEffect(() => {
        if (item) {
            setItems((prev) => [...prev, ...item]);
            useRankCalc(setItems, genre);
        }
    }, [item]);




    useEffect(() => {
        if (!ref.current) return;
        if (seachVal) return
        if (!didRun.current) {
            //row 열 갯수 구하기
            const rect = ref.current.getBoundingClientRect();
            const rectTop = Math.floor(rect.top);
            const li_h = 150;
            const update = debounce(() => {
                const user_h = Math.floor(window.visualViewport?.height ?? window.innerHeight);
                const user_w = Math.floor(window.visualViewport?.width ?? window.innerWidth);
                const row_col = (user_w < 599 ? 1 : (user_w < 1099 && user_w > 599) ? 2 : 3);
                setAmount(Math.ceil(((user_h - rectTop) / li_h)) * row_col);

            }, 500);
            update();
            didRun.current = true;
        }


        //좌표리스너
        if (item?.length === 0) {
            if (count === 0) {
                return setCount(1);
            } else {
                return
            }
        }
        const sentinel = document.getElementById("sentinel")!;
        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some(e => e.isIntersecting)) {
                    setCount((prev) => prev + 1);
                    io.disconnect();
                    // 다음 페이지 로드 등 트리거
                }
            },
            {
                root: null,                // 뷰포트 기준. 특정 스크롤 컨테이너면 그 엘리먼트를 넣기
                rootMargin: "0px 0px 200px 0px", // 미리 200px 위에서 감지(프리페치/무한스크롤에 좋음)
                threshold: 0
            }
        );
        io.observe(sentinel);


        return () => {
            io.disconnect();
        }

    }, [items]);


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
                                    key={index}
                                    id={el.id}
                                    uuid={el.uuid}
                                    img_path={el.img_path}
                                    title={el.title}
                                    author={el.author}
                                    index={index}
                                    rankCalc={el.rankCalc}
                                    refreshKey={refreshKey}
                                />
                            )
                        })
                        : (<li><p>검색 결과가 없습니다.</p></li>)}
                </ul>
            </div>
            <div id="sentinel" style={{ height: '1px' }}></div>
        </>
    );
}
