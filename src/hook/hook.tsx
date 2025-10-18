import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { upload } from "@/types/schemas";
import { useState, useEffect } from "react";
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { BooksRow, BooksRowSchema, BooksRowRank } from "@/types/schemas";
// import { getPrivateImageUrl } from "@/lib/adm/utils";
// import { getCached, setCached } from "@/lib/adm/cached";

const supabase = createClientComponentClient();

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useUploadstate() {
    const [uploadstate, setUploadstate] = useState<upload[]>([{
        file: null,
        id: 0,
        m: null,
    }]);
    return { uploadstate, setUploadstate };
}

export function useToken() {

    const [token, setToken] = useState<string>('');

    useEffect(() => {
        const t = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setToken(session.access_token);
            } else {
                return console.log('token null');
            }
        }
        t();
    }, []);


    return token;
}

export const useDelete = () => {
    const [deleteItems, setDeleteItems] = useState<Set<number>>(new Set());
    return { deleteItems, setDeleteItems };
}


export const useToggle = (
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


export const useUuidUpdate = () => {

    const uuidUpdate = async (
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
        } catch (error: any) {
            return console.error(error.message);
        };
    }

    return { uuidUpdate }

}


export const useUserSession = () => {

    const userSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return session
        } catch (error: any) {
            return console.error(error);
        };
    }

    return { userSession }
}

export const useAuthChange = () => {
    const router = useRouter();

    const authChange = () => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) router.replace('/');
        });
        return () => {
            subscription.unsubscribe();
        };
    }

    return { authChange }
}

// export async function useBookCoverSet(item: (BooksRow & { visited_at?: string })[], setValue: React.Dispatch<React.SetStateAction<(BooksRow & { visited_at?: string })[]>>) {

//     try {
//         const copy = item.map(async (el) => {
//             const path = el.img_signed.trim();
//             console.log(path);

//             if (!path) return { ...el, img_signed: '' };

//             const url = await getPrivateImageUrl('book_covers', path);
//             return { ...el, img_signed: url ?? '' }
//         });

//         const promise = await Promise.all(copy);

//         setValue(promise);

//     } catch (error: any) {
//         return console.error(error);
//     }
// }

export function useRankCalc(setValue: React.Dispatch<React.SetStateAction<BooksRowRank[]>>, g: string) {
    if (g === '전체') {
        setValue((prev) => {
            const copy = prev.map(obj => ({ ...obj }));
            const send = copy.map((el, index) => {
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

export function UsebookLink() {
    const router = useRouter();
    const bookLink = async (id: number) => {
        try {
            const { uuidUpdate } = useUuidUpdate();
            const uuid = await uuidUpdate(id);
            router.push(`/bookDetail/${uuid}`);
        } catch (error: any) {
            return console.error(error);
        }
    }
    return { bookLink }
};
