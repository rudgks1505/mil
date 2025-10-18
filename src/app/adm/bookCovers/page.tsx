'use client';

import styles from "../page.module.css";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAppDispatch, useUuidUpdate } from "@/hook/hook";
import { on, off } from "@/store/loaderSlice";
import Select, { type StylesConfig } from "react-select";
import { BookCoverSelectOption, BookCoverSelectOptionSchema, ReactSelect, BooksRow, BooksRowSchema } from "@/types/schemas";
import Search from "@/components/search/search";
import useSWR, { mutate } from "swr";

export default function Page() {

    const bookMetadataGet = async (
    ) => {
        try {
            const res = await fetch(`/api/adm/bookCovers/idSelect?id=${book_uuid}`);

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

            const zodItems = BooksRowSchema.safeParse(data.data);
            if (!zodItems.success) {
                console.error(zodItems.error.issues);
                throw new Error("유효성 검사 실패");
            }

            setSelectOption((prev) => {
                const copy = { ...prev };
                copy.id = zodItems.data.id;
                copy.title = zodItems.data.title;
                copy.genre = zodItems.data.genre;
                copy.symbol = zodItems.data.symbol;
                return copy
            });

            return zodItems.data
        } catch (error: any) {
            alert(error.message);
            return
        };
    }


    const createBookCovers = async (
    ) => {
        try {
            if (!confirm('생성하시겠습니까?')) {
                return false
            }
            dispatch(on());

            const zodResult = BookCoverSelectOptionSchema.safeParse(selectOption);

            if (!zodResult.success) {
                console.error(zodResult.error.issues);
                throw new Error("유효성 검사 실패");
            }

            const res = await fetch('/api/adm/bookCovers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(zodResult.data),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

            mutate(`/api/adm/bookCovers/idSelect?id=${book_uuid}`);
            dispatch(off());
            alert('생성완료');

        } catch (error: any) {
            dispatch(off());
            alert(error.message);
            return
        };
    }



    const handleChildSearch = (val: string) => {
        if (!val) {
            alert('검색어를 입력해주세요');
            return
        }
        if (!Number(val)) {
            alert('숫자를 입력해주세요');
            return
        }
        setSearchBook(Number(val));
    }



    const setAuthorCheck = (authorCheck: boolean) => {
        console.log(authorCheck);

        let author;
        if (authorCheck) {
            author = `- Author ${items?.author} should be styled in a typography that harmonizes with the title, using a similar visual tone and complementary design, 
        ensuring consistency across the cover.`;
        } else {
            author = '- Do not include any author name on the cover.';
        }

        setSelectOption((prev) => {
            const copy = { ...prev };
            copy.author = author;
            return copy
        })

    };

    //커버 목록 프롬포트 
    const [selectOption, setSelectOption] = useState<BookCoverSelectOption>({
        id: 0,
        genre: '',
        title: '',
        symbol: '',
        author: '- Do not include any author name on the cover.',
        typography: '',
        layout: '',
        texture: '',
    })

    const [selectTypography, SetselectTypography] = useState<BookCoverSelectOption['typography'][]>(['']);
    const [selectLayout, SetselectLayout] = useState<BookCoverSelectOption['layout'][]>([
        "clean editorial grid.",
        "wide margins, balanced white space.",
        "natural and harmonious placement of text.",
    ]);

    const [selectTexture, SetselectTexture] = useState<BookCoverSelectOption['texture'][]>([
        "subtle paper grain texture.",
        "matte paper finish.",
        "recycled paper texture.",
        "vellum finish.",
        "embossed title lettering.",
        "debossed symbol motif.",
        "foil stamping in gold.",
        "silver foil emboss.",
        "smooth matte lamination.",
        "soft-touch finish.",
        "spot UV gloss highlights.",
        "linen texture overlays.",
        "rough parchment texture.",
        "aged leather-like finish.",
        "canvas painting texture.",
        "handmade paper grain.",
    ]);

    const { uuidUpdate } = useUuidUpdate();
    const [items, setItems] = useState<BooksRow>()
    const dispatch = useAppDispatch();
    const [searchBook, setSearchBook] = useState<number>(0);
    const [key, setKey] = useState<boolean>(false);
    const [book_uuid, setBook_uuid] = useState<string>('');
    const [reactSelect_typo, setReactSelect_typo] = useState<ReactSelect | null>(null);
    const [reactSelect_layout, setReactSelect_layout] = useState<ReactSelect | null>(null);
    const [reactSelect_texture, setReactSelect_texture] = useState<ReactSelect | null>(null);

    const { data: item, error, isLoading } = useSWR(key ? `/api/adm/bookCovers/idSelect?id=${book_uuid}` : null, bookMetadataGet);

    const options = {
        selectTypography: selectTypography.map((el) => ({
            value: el,
            label: el,
        })),
        selectLayout: selectLayout.map((el) => ({
            value: el,
            label: el,
        })),
        selectTexture: selectTexture.map((el) => ({
            value: el,
            label: el,
        })),
    }

    const reactSelectStyles: StylesConfig<ReactSelect, false> = {
        // 전체 Select 컨테이너 너비
        container: (base) => ({
            ...base,
            width: 400,
        }),
        // 상단 입력/박스(포커스 테두리/그림자 제거)
        control: (base, state) => ({
            ...base,
            boxShadow: "none",
            borderColor: "#ccc",
            ":hover": { borderColor: "#ccc" },
        }),
        // 옵션(선택/호버 배경 제거)
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "transparent"
                : state.isFocused
                    ? "transparent"
                    : base.backgroundColor,
            color: "black",
        }),
        //부모 바깥도 보이게
        menuPortal: (base) => ({ ...base, zIndex: 200 }),
    };

    useEffect(() => {
        setItems(item);
    }, [item]);

    useEffect(() => {
        if (items) {
            SetselectTypography([
                `Korean title ${items.title} in elegant serif style (Mincho-inspired), perfectly legible Korean text, no distortions.`,
                `Korean title ${items.title} in bold sans-serif (Gothic style), professional book typography, clean and perfectly legible Korean letters.`,
            ]);
        }
    }, [items]);

    useEffect(() => {
        if (!searchBook) return
        (async () => {
            const uuid = await uuidUpdate(searchBook);
            setBook_uuid(uuid);
            setKey(true);
        })()
    }, [searchBook])

    if (isLoading) return <p>로딩 중...</p>;
    if (error) return <p>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</p>;

    return (
        <>
            <div className={styles.con}>
                <Search onChildSearch={handleChildSearch} holder='책 고유번호를 입력해주세요'></Search>
            </div>

            <div className={styles.con}>
                <div className={styles.btn_con}>
                    <button onClick={createBookCovers}>이미지 생성</button>
                </div>
                <div className={styles.scroll_con} style={{ height: "120px" }}>
                    <table className={styles.con_table}>
                        <thead>
                            <tr>
                                <th className={styles.th1_sticky}>책 고유번호</th>
                                <th className={styles.th3_sticky} style={{ left: '99px' }}>책 장르</th>
                                <th className={styles.th2_sticky} style={{ left: '172px' }}>책 제목</th>
                                <th>심볼</th>
                                <th>저자 포함</th>
                                <th>타이포그래피</th>
                                <th>레이아웃</th>
                                <th>질감</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items && (
                                <tr>
                                    <td className={styles.th1_sticky}><p>{items.id}</p></td>
                                    <td className={styles.th3_sticky} style={{ left: '99px' }}><p>{items.genre}</p></td>
                                    <td className={styles.th2_sticky} style={{ left: '172px' }}><p>{items.title}</p></td>
                                    <td><p>{items.symbol}</p></td>
                                    <td><input type="checkbox" onChange={(e) => { setAuthorCheck(e.target.checked) }} /></td>
                                    <td>
                                        <Select
                                            className={styles.reactSelect}
                                            options={options.selectTypography}
                                            isSearchable={false}
                                            placeholder="타이포그래피 선택"
                                            styles={reactSelectStyles}
                                            value={reactSelect_typo}
                                            menuPortalTarget={document.body}
                                            onChange={(opt) => {
                                                setReactSelect_typo(opt);
                                                setSelectOption((prev) => {
                                                    const copy = { ...prev };
                                                    copy.typography = opt?.value ?? '';
                                                    return copy
                                                })
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <Select
                                            className={styles.reactSelect}
                                            options={options.selectLayout}
                                            isSearchable={false}
                                            placeholder="레이아웃 선택"
                                            styles={reactSelectStyles}
                                            value={reactSelect_layout}
                                            menuPortalTarget={document.body}
                                            onChange={(opt) => {
                                                setReactSelect_layout(opt);
                                                setSelectOption((prev) => {
                                                    const copy = { ...prev };
                                                    copy.layout = opt?.value ?? '';
                                                    return copy
                                                })
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <Select
                                            className={styles.reactSelect}
                                            options={options.selectTexture}
                                            isSearchable={false}
                                            placeholder="질감 선택"
                                            styles={reactSelectStyles}
                                            value={reactSelect_texture}
                                            menuPortalTarget={document.body}
                                            onChange={(opt) => {
                                                setReactSelect_texture(opt);
                                                setSelectOption((prev) => {
                                                    const copy = { ...prev };
                                                    copy.texture = opt?.value ?? '';
                                                    return copy
                                                })
                                            }}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {items?.img_path && (
                    <div style={{ marginTop: "50px" }}>
                        <Image className="bookCoverShadow" src={`/img/book_covers/${items.img_path}`} alt="bookcover" width={190} height={300} />
                    </div>
                )}
            </div>
        </>
    );
}
