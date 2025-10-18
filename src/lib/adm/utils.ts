import { upload } from "@/types/schemas";
import type { Tables } from "@/types/helper";
import { any, z } from 'zod';
import { publicMainvisualRowSchema, publicBooksRowSchema } from "@/types/zodSchemas";
import { BooksRow, BooksRowSchema, Mainvisual, MainvisualSchema } from "@/types/schemas";

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
    } catch (error: any) {
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
    } catch (error: any) {
        throw error;
    }

}


// export async function getPrivateImageUrl(bucket: string, imagePath: string,) {
//     console.log("hit?", getCached(imagePath));
//     const hit = getCached(imagePath);
//     console.log("hit check:", { imagePath, hit, type: typeof hit, truthy: !!hit });
//     if (!imagePath) return

//     if (hit) return hit;

//     const supabase = createClientComponentClient();


//     const { data, error } = await supabase
//         .storage
//         .from(bucket)
//         .createSignedUrl(imagePath, 43200);//2번째인자 시간(초)

//     if (error) return console.warn(error);

//     setCached(imagePath, data.signedUrl, 43200);

//     return data.signedUrl;
// }