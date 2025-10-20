import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UuidUpdate } from "@/lib/adm/utils";

const supabase = createClientComponentClient();

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// export function useUploadstate() {
//     const [uploadstate, setUploadstate] = useState<upload[]>([{
//         file: null,
//         id: 0,
//         m: null,
//     }]);
//     return { uploadstate, setUploadstate };
// }

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


export const useUserSession = () => {

    const userSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return session
        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
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


export function UsebookLink() {
    const router = useRouter();
    const bookLink = async (id: number) => {
        try {
            const { uuidUpdate } = UuidUpdate();
            const uuid = await uuidUpdate(id);
            router.push(`/bookDetail/${uuid}`);
        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
        }
    }
    return { bookLink }
};
