import { z } from "zod";
import type { Tables, TablesInsert } from "@/types/helper";
import { publicBooksRowSchema, publicMemberRowSchema, publicMainvisualRowSchema } from "./zodSchemas";

const PhoneRegex = /^010\d{8}$/;


const uploadSchema = z.object({
    file: z.instanceof(File).nullable(),
    id: z.number().int().positive(),
    m: z.object({
        file: z.instanceof(File),
    }).nullable(),
});

export const InpBookSchema = z.object({
    value: z.string(),
    label: z.string(),
});

export const deleteItemsSchema = z.array(z.number()).nonempty();


//책 내용 생성용
export const EpubBookMetadataSchema = z.object({
    title: z.string(),
    symbol: z.string(),
    author: z.string(),
    genre: z.string(),
    language: z.string(),
    book_review: z.string(),
});

export const EpubBookChaptersSchema = z.object({
    title: z.string(),
    summary: z.string(),
    content: z.string(),
});


//북커버 생성
export const BookCoverSelectOptionSchema = z.object({
    id: z.number().refine(val => val !== 0, {
        message: "id 0은 허용되지 않습니다",
    }),
    genre: z.string(),
    title: z.string(),
    symbol: z.string(),
    author: z.string().min(1, "저자포함은 필수입니다"),
    typography: z.string().min(1, "타이포그래피는 필수입니다"),
    layout: z.string().min(1, "레이아웃은 필수입니다"),
    texture: z.string().min(1, "텍스쳐는 필수입니다"),
});

//epub라이브러리
export const EpubSchema = z.object({
    metadata: z.object({
        title: z.string(),
        author: z.string(),
        identifier: z.string(),
    }),
    chapters: z.array(z.object({
        book_id: z.number(),
        created_at: z.string(),
        id: z.number(),
        img_path: z.string(),
        seq: z.number(),
        title: z.string(),
        xhtml: z.string(),
    })),
});


export const joinSchema = z.object({
    phone: z.string().regex(PhoneRegex, "010으로 시작하는 11자리 숫자만 입력해주세요."),
    email: z.string().trim().toLowerCase().email("올바른 이메일 형식이 아닙니다."),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
    passwordConfirm: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

export const memberSchema = publicMemberRowSchema.pick({ created_at: true, last_sign: true, user_role: true });
export const admMemberSchema = publicMemberRowSchema.pick({ created_at: true, email: true, last_sign: true, user_phone: true, user_role: true });

export const MainvisualSchema = publicMainvisualRowSchema.omit({ owner: true });
export type Mainvisual = z.infer<typeof MainvisualSchema>;

export type Member = z.infer<typeof memberSchema>;
export type AdmMember = z.infer<typeof admMemberSchema>;

export type Join = z.infer<typeof joinSchema>;

export const BooksRowSchema = publicBooksRowSchema.omit({ owner: true });

export type BooksRow = z.infer<typeof BooksRowSchema>;

export type BooksRowRank = (BooksRow & { rankCalc?: { state: string, calc: number } });

export type EpubBookMetadata = z.infer<typeof EpubBookMetadataSchema>;

export type EpubBookChapters = z.infer<typeof EpubBookChaptersSchema>;

export type Epub = z.infer<typeof EpubSchema>;

export type BookCoverSelectOption = z.infer<typeof BookCoverSelectOptionSchema>;

export type ReactSelect = { value: string; label: string };

export type deleteItems = z.infer<typeof deleteItemsSchema>;

export type upload = z.infer<typeof uploadSchema>;

export type slide_order = Pick<Tables<"mainvisual">, 'id' | 'slide_order'>[];

export type InpBook = z.infer<typeof InpBookSchema>;