'use client'

import { use } from 'react';
import ePub, { Rendition } from 'epubjs';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { buildEpubArrayBuffer } from "@/lib/epub/jsZip";
import Top from '@/components/bookDetail/top';
import styles from "./page.module.css";
import Select, { type StylesConfig } from "react-select";
import { ReactSelect } from "@/types/schemas";
import { publicUserBooksInsertSchema, publicUserBooksRowSchema, publicHistoryInsertSchema } from "@/types/zodSchemas";
import type { TablesInsert } from "@/types/helper";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { debounce } from "lodash";

type PublicUserBooksInsert = TablesInsert<"user_books">;

export default function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const useParams = use(params);
    const [userOption, setUserOption] = useState<Omit<PublicUserBooksInsert, 'user_id'>>(
        {
            background_color: '#ffffff',
            book_uuid: useParams.id,
            cfi: '',
            font_color: '#111111',
            font_height: '1.5',
            font_size: '16px',
            font_weight: '500',
            spread: 'none',
        }
    );

    const user_books_get = useCallback(async (
    ) => {
        try {
            const res = await fetch(`/api/epub/userBooks?id=${useParams.id}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

            if (data.data !== null) {
                const zodResult = publicUserBooksRowSchema.omit({ id: true, user_id: true }).safeParse(data.data);
                if (!zodResult.success) {
                    console.error(zodResult.error.issues);
                    throw new Error('유효성 검사 실패');
                }
                setUserOption(zodResult.data);
            }
            return
        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
        };
    }, [useParams.id]);

    const user_books_post = useCallback(async (
    ) => {
        try {
            if (!userOption.cfi) return
            const zodResult = publicUserBooksInsertSchema.omit({ user_id: true }).safeParse(userOption);
            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error('유효성 검사 실패');
            }
            const res = await fetch(`/api/epub/userBooks?id=${useParams.id}`, { //get과 캐시 맞춰야하기에 파람
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(zodResult.data),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
        };
    }, [userOption, useParams.id]);


    const history_post = useCallback(async (
    ) => {
        try {
            const zodResult = publicHistoryInsertSchema.pick({ book_uuid: true }).safeParse({ book_uuid: useParams.id });
            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error('유효성 검사 실패');
            }

            const res = await fetch('/api/epub/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ book_uuid: useParams.id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
        };
    }, [useParams.id]);
    const supabase = createClientComponentClient();
    const didRun = useRef(false);
    const ref = useRef<HTMLDivElement | null>(null);
    const rendRef = useRef<Rendition | null>(null);
    const [ready, setReady] = useState(false);

    const user_books_post_memo = useMemo(() => debounce(user_books_post, 3000), [user_books_post]);


    const [colorArr, _setColorArr] = useState<string[]>([
        '#ffffff',
        '#FAF9F6',
        '#F5F5DC',
        '#2E2E2E',
        '#121212',
    ]);

    const [fontColorArr, _setFontColorArr] = useState<string[]>([
        '#FAF9F6',
        '#E0E0E0',
        '#F5F5DC',
        '#3E3E3C',
        '#111111',
    ]);

    const [fontSizeArr, _setFontSizeArr] = useState<string[]>([
        '14px',
        '16px',
        '18px',
        '20px',
        '22px',
    ]);

    const [fontWeightArr, _setFontWeightArr] = useState<string[]>([
        '300',
        '400',
        '500',
        '600',
        '700',
    ]);

    const [fontHeightArr, _setFontHeightArr] = useState<string[]>([
        '1.3',
        '1.4',
        '1.5',
        '1.6',
        '1.7',
    ]);

    const [pageProgress, SetPageProgress] = useState<number>(0);

    type NaviArr = {
        id: string;
        href: string;
        label: string;
        [key: string]: any;
    };

    const [naviLabel, setReactNaviLabel] = useState<ReactSelect | null>(null);
    const [naviArr, SetNaviArr] = useState<NaviArr[]>([]);
    const goNext = () => rendRef.current?.next();
    const goPrev = () => rendRef.current?.prev();



    const epubBackColor = (color: string) => {
        setUserOption((prev) => {
            return { ...prev, background_color: color }
        })
        rendRef.current?.themes.override("background", `${color}`);
        if (ref.current) ref.current.style.backgroundColor = `${color}`; //배경 깜빡임 방지
    }

    const epubFontColor = (color: string) => {
        setUserOption((prev) => {
            return { ...prev, font_color: color }
        })
        rendRef.current?.themes.override("color", `${color}`);
    }
    const epubFontSize = (size: string) => {
        setUserOption((prev) => {
            return { ...prev, font_size: size }
        })
        rendRef.current?.themes.override("font-size", `${size}`);
    }
    const epubFontWeight = (weight: string) => {
        setUserOption((prev) => {
            return { ...prev, font_weight: weight }
        })
        rendRef.current?.themes.override("font-weight", `${weight}`);
    }
    const epubFontHeight = (height: string) => {
        setUserOption((prev) => {
            return { ...prev, font_height: height }
        })
        rendRef.current?.themes.override("line-height", `${height}`);
    }
    const epubChapterMove = (chapter: string) => {
        rendRef.current?.display(chapter);
    }
    const epubSpread = (spread: string) => {
        setUserOption((prev) => {
            return { ...prev, spread: spread }
        })
        rendRef.current?.spread(spread);
    }



    const options = {
        selectChapter: naviArr.map((el) => ({
            value: el.href,
            label: el.label,
        })),
    };

    const reactSelectStyles: StylesConfig<ReactSelect, false> = {
        container: (base) => ({
            ...base,
            display: 'inline-block',
        }),
        control: (base, _state) => ({
            ...base,
            boxShadow: "none",
            width: 120,
            whiteSpace: "nowrap",
            overflow: 'hidden',
            textOverflow: "ellipsis",
            borderColor: "#ccc",
            ":hover": { borderColor: "#ccc" },
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "transparent"
                : state.isFocused
                    ? "transparent"
                    : base.backgroundColor,
            color: "black",
        }),
        menu: (base, _state) => ({
            ...base,
            width: 300,
        }),
        menuList: (base, _state) => ({
            ...base,
            whiteSpace: "nowrap",
        }),
        menuPortal: (base) => ({ ...base, zIndex: 200 }),
    };


    const epubRead = async () => {
        const epubSet = async () => {
            const res = await fetch(`/api/epub/${useParams.id}`);
            const { data, message } = await res.json();
            if (!res.ok) console.error(message);

            const ab = await buildEpubArrayBuffer(data);

            if (!ref.current) return;

            const book = ePub(ab);
            return book;
        }

        const book = await epubSet();
        if (!book) return;

        book.loaded.navigation.then((nav) => {
            SetNaviArr(nav.toc);
        });

        const el = ref.current; //div 노드
        if (!el) return;

        const rendition = book.renderTo(el, {
            width: '100%',
            height: '100%',
            spread: 'auto',
            flow: "paginated",
        });
        rendRef.current = rendition;


        await book.ready;
        const chars = window.innerWidth < 640 ? 1200 : 1600;
        await book.locations.generate(chars);

        //display시 1회 발생
        rendRef.current?.on("relocated", (location: any) => {
            SetPageProgress(Math.floor(Number(book.locations.percentageFromCfi(location.start.cfi)) * 100));

            setUserOption((prev) => {
                return { ...prev, cfi: location.start.cfi }
            })
        });

        rendition.themes.register("custom", "/epubThemes/rendition.css"); //css파일 퍼블릭 폴더에 둬야함.
        rendition.themes.select("custom");

        epubBackColor(userOption.background_color);
        epubFontColor(userOption.font_color);
        epubFontSize(userOption.font_size);
        epubFontWeight(userOption.font_weight);
        epubFontHeight(userOption.font_height);
        epubSpread(userOption.spread);

        await rendition.display(userOption.cfi || undefined);
        setReady(true);
    };



    useEffect(() => {
        if (didRun.current) return;
        didRun.current = true;

        (async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return
                await user_books_get();
                await history_post();
            } catch (err) {
                console.error(err);
            }
        })()

        return () => {
            rendRef.current?.destroy();
            rendRef.current = null;
        };
    }, [supabase, user_books_get, history_post]);

    useEffect(() => {

        if (ready) {
            (async () => {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) return
                    await user_books_post_memo();
                } catch (err) {
                    console.error(err);
                }
            })()
        }

        return () => user_books_post_memo.cancel();

    }, [ready, supabase, user_books_post_memo]);

    return (
        <>
            <Top uuid={useParams.id} epubRead={() => epubRead()}></Top>

            <div className={styles.option_con}>

                <ul className={styles.option_color}>
                    {colorArr.map((el, index) => {
                        return (<li key={index} onClick={() => { epubBackColor(el) }}><span style={{ background: el }}></span></li>)
                    })}
                </ul>

                <ul className={styles.option_fontColor}>
                    {fontColorArr.map((el, index) => {
                        return (<li key={index} onClick={() => { epubFontColor(el) }}>
                            <span style={{ color: el }}>T</span>
                        </li>)
                    })}
                </ul>

                <ul className={styles.option_fontSize}>
                    {fontSizeArr.map((el, index) => {
                        return (<li key={index} onClick={() => { epubFontSize(el) }}>
                            <span style={{ fontSize: el }}>T</span>
                        </li>)
                    })}
                </ul>

                <ul className={styles.option_fontWeight}>
                    {fontWeightArr.map((el, index) => {
                        return (<li key={index} onClick={() => { epubFontWeight(el) }}>
                            <span style={{ fontWeight: el }}>T</span>
                        </li>)
                    })}
                </ul>

                <ul>
                    {fontHeightArr.map((el, index) => {
                        return (<li key={index} onClick={() => { epubFontHeight(el) }}>
                            <span style={{ lineHeight: el }}>{el}</span>
                        </li>)
                    })}
                </ul>

            </div>

            <div className={styles.con}>
                <ul>
                    <li>
                        <button onClick={() => { epubSpread('none') }}>단일 페이지 보기</button>
                        <button onClick={() => { epubSpread('always') }}>양쪽 펼쳐 보기</button>
                    </li>
                    <li>
                        <span>{pageProgress} %</span>
                        <Select
                            instanceId={"chapter-select"}
                            options={options.selectChapter}
                            isSearchable={false}
                            placeholder="챕터 이동"
                            value={naviLabel}
                            styles={reactSelectStyles}
                            onChange={(opt) => {
                                setReactNaviLabel(opt);
                                if (opt) epubChapterMove(opt.value);
                            }}
                        />
                        <button onClick={goPrev} disabled={!ready}>이전</button>
                        <button onClick={goNext} disabled={!ready}>다음</button>

                    </li>
                </ul>

                <div className={styles.rendition_wrap} ref={ref}>
                    {!ready && <p style={{ padding: '10px' }}>‘바로 읽기’를 눌러 책을 불러와주세요.</p>}
                </div>
            </div>


            <div style={{ height: '100dvh' }}></div>
        </>

    );
};