import { upload } from "@/types/schemas";
import type { Tables } from "@/types/helper";
import { z } from 'zod';
import { BooksRow, BooksRowSchema, Mainvisual, MainvisualSchema } from "@/types/schemas";
import { BooksRowRank } from "@/types/schemas";

type MainvisualRow = Omit<Tables<"mainvisual">, 'img_path' | 'img_path_m' | 'owner'>;

export const fileSet = (e: React.ChangeEvent<HTMLInputElement>, id: number, index: number, set: React.Dispatch<React.SetStateAction<upload[]>>,
    m_b: upload['m']) => {
    const file = e.target.files?.[0];
    if (!file) return;

    set((prev) => {
        const copy = structuredClone(prev)

        m_b === null ?
            copy[index] = {
                file: file,
                id: id,
                m: m_b,
            } :
            copy[index].m = m_b;

        return [...copy]
    })
}

export const ContentChage = (<K extends keyof MainvisualRow>(val: MainvisualRow[K], origin: MainvisualRow[K]) => {
    const boolean = origin === val ? true : false;
    return boolean
});

export const mainvisualGet = async (path: string
): Promise<Mainvisual[]> => {
    try {
        const res = await fetch(path);

        const data = await res.json();
        if (!res.ok) throw new Error(`데이터 처리 중 오류가 발생했습니다.`);

        const item = data.data;

        const zodResult = z.array(MainvisualSchema).safeParse(item);
        if (!zodResult.success) {
            console.error(zodResult.error.issues);
            throw new Error("유효성 검사 실패");
        }

        return zodResult.data;
    } catch (error: unknown) {
        throw error; //swr error로 던지기
    }

}


export const booksGet = async (uuid: string): Promise<BooksRow[]> => {
    try {
        const qu = uuid ? uuid : '';
        const res = await fetch(`/api/adm/books?qu=${qu}`);
        const data = await res.json();

        if (!res.ok) throw new Error(`데이터 처리 중 오류가 발생했습니다.`);
        const item = data.data;

        const zodResult = z.array(BooksRowSchema).safeParse(item);
        if (!zodResult.success) {
            console.error(zodResult.error.issues);
            throw new Error("유효성 검사 실패");
        }

        return zodResult.data;
    } catch (error: unknown) {
        throw error;
    }

}

export const Toggle = (
    boolean: boolean,
    id: number[],//[] 전체 토글 같이 처리
    setValue: React.Dispatch<React.SetStateAction<Set<number>>>
) => {

    setValue((prev) => {
        const copy = new Set(prev);
        id.forEach((el) => {
            if (boolean) {
                copy.add(el);
            } else {
                copy.delete(el);
            }
        });

        return copy;
    });
};

export const UuidUpdate = () => {
    const uuidUpdate =
        async (
            id: number,
        ) => {
            try {
                const zodResult = z.number().safeParse(id);
                if (!zodResult.success) {
                    console.error(zodResult.error.issues);
                    throw new Error("유효성 검사 실패");
                }

                const res = await fetch(`/api/adm/UUID/books?id=${id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');

                return data.data
            } catch (err: unknown) {
                if (err instanceof Error) alert(err.message);
                else console.error(err);
                return
            };
        }

    return { uuidUpdate }

}


export function RankCalc(setValue: React.Dispatch<React.SetStateAction<BooksRowRank[]>>, g: string) {
    if (g === '전체') {
        setValue((prev) => {
            const copy = prev.map(obj => ({ ...obj }));
            const send = copy.map((el) => {
                if (el.today_rank === null) return { ...el, rankCalc: { state: 'rank_none', calc: 0 } };

                if (el.last_rank === null) return { ...el, rankCalc: { state: 'rank_new', calc: 0 } }

                if (el.today_rank > el.last_rank) return { ...el, rankCalc: { state: 'rank_down', calc: (el.today_rank - el.last_rank) } }

                if (el.last_rank > el.today_rank) return { ...el, rankCalc: { state: 'rank_up', calc: (el.last_rank - el.today_rank) } }

                return { ...el, rankCalc: { state: 'rank_same', calc: 0 } };
            })
            return send
        });
    } else {
        setValue((prev) => {
            const copy = prev.filter(obj => obj.genre === g).map(obj => ({ ...obj }));

            const lat = copy.sort((a, b) => (a.last_rank ?? Infinity) - (b.last_rank ?? Infinity)).map((el, index) => {
                return { ...el, last_rank: el.last_rank === null ? Infinity : index };
            });

            const send = lat.sort((a, b) => (a.today_rank ?? Infinity) - (b.today_rank ?? Infinity)).map((el, index) => {
                if (el.today_rank === null) return { ...el, rankCalc: { state: 'rank_none', calc: 0 } };

                if (el.last_rank === Infinity) return { ...el, rankCalc: { state: 'rank_new', calc: 0 } }

                if (index > el.last_rank) return { ...el, rankCalc: { state: 'rank_down', calc: (index - el.last_rank) } }

                if (el.last_rank > index) return { ...el, rankCalc: { state: 'rank_up', calc: (el.last_rank - index) } }

                return { ...el, rankCalc: { state: 'rank_same', calc: 0 } };
            });

            return send
        });
    }
};
