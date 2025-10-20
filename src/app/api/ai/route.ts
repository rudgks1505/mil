import OpenAI from "openai";
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { EpubBookMetadata, EpubBookMetadataSchema, EpubBookChapters, EpubBookChaptersSchema, InpBookSchema, InpBook } from "@/types/schemas";
import { escape } from "lodash";
import { z } from 'zod';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 0
});

const delete_meta = async (supabase: any, id: number) => {
    const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);
    if (error) {
        console.error(error.message);
        return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
    }
}


export async function POST(req: Request) {

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        console.error('user null');
        return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
    }
    const user = session.user;
    if (user?.email !== 'rudgks1505@gmail.com') return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });

    let bookMeteId = 0;
    const bookToken = 15051505;


    try {
        const body: InpBook = await req.json();
        const zodItems = InpBookSchema.safeParse(body);

        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }


        const metadataSchema = {
            type: "object",
            additionalProperties: false,
            required: ["title", "symbol", "author", "genre", "language", "book_review"],
            properties: {
                title: {
                    type: "string",
                    minLength: 1,
                    description: "Reinterpret the genre poetically/metaphorically in the title only."
                },
                symbol: {
                    type: "string",
                    minLength: 1,
                    description: "A concise symbol reflecting the theme or mood."
                },
                author: {
                    type: "string",
                    description: "Exactly 3 Korean Hangul syllables (e.g., 김하늘).",
                    pattern: "^[가-힣]{3}$"
                },
                genre: {
                    type: "string",
                    const: zodItems.data.value,
                    description: "Must exactly match the provided input genre."
                },
                language: { type: "string", const: "ko" },
                book_review: {
                    type: "string",
                    minLength: 100,
                    maxLength: 800,
                    description:
                        "Positive-only Korean review (100–600 chars), friendly and conversational."
                }
            }
        }

        const chaptersSchema = {
            type: "object",
            additionalProperties: false,
            required: ["title", "summary", "content"],
            properties: {
                title: {
                    type: "string",
                    description:
                        "a short Korean title that summarizes the chapters main theme, based on the content you generate.",
                    minLength: 1,
                    maxLength: 80
                },
                summary: {
                    type: "string",
                    description:
                        "a concise Korean paragraph summarizing the key events and emotions (80–600 characters).",
                    minLength: 80,
                    maxLength: 600
                },
                content: {
                    type: "string",
                    description:
                        `full Korean prose (1,000–3,000 characters) with paragraphs separated by the ${bookToken}.`,
                    minLength: 1000,
                    maxLength: 3000,
                    // // 줄바꿈/역슬래시/쌍따옴표 금지
                    // pattern: "^[^\\n\\r\\\\\\\"]+$"
                }
            },
        };




        //&quot; -> ", &#39; -> '

        const response_metadata = await openai.responses.parse({
            model: "gpt-5-mini",
            text: {
                format: {
                    type: "json_schema",
                    schema: metadataSchema, //metadataSchema.properties 형태로 값 반환
                    name: "metadataSchema",
                    strict: true
                }
            },
            input: `
Return one JSON object that matches the schema. Output Korean content where specified. Your response must only contain the raw JSON object, starting with { and ending with }.

Do not include any explanations, comments, code fences, or extra keys.

### Creative guidance
- Reinterpret the genre in an unexpected yet meaningful way only within the title and symbol.
- Blend emotional depth with imaginative storytelling.

### Fields (and constraints)
- title (string): Poetic/metaphorical reinterpretation of the genre. Non-empty.
- symbol (string): A concise symbolic phrase reflecting the theme or mood. Non-empty.
- author (string): Exactly 3 Korean Hangul syllables (e.g., 김하늘). Pattern: ^[가-힣]{3}$
- book_review (string): 100–800 Korean characters, warmly positive only. Briefly summarize what makes the book appealing or memorable and share a friendly personal impression. No criticism, no emojis, no quotation marks.

### Schema rules
- Return exactly these four keys: title, symbol, author, book_review.
- No additional properties.

### Example of the exact output format
{
  "title": "기억의 바다를 항해하는 종이배",
  "symbol": "젖어가는 편지",
  "author": "김민준",
  "book_review": "이 책은 상실의 아픔을 따뜻한 시선으로 그려냅니다. 주인공이 과거의 기억들을 하나씩 마주하며 성장하는 과정이 깊은 울림을 줍니다. 마치 잊고 있던 소중한 사진첩을 다시 들춰보는 듯한 기분이었어요. 마음이 저릿하면서도 따스해지는 경험이었습니다."
}
            `,
            max_output_tokens: 2000,
        });

        //응답은 성공하되, 스키마 맞지 않게 파싱되어옴, 응답 실패는 캐치로 빠짐.
        if (!response_metadata.output_parsed) {
            console.error("!response_metadata.output_parsed");
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const message_metadata: EpubBookMetadata = response_metadata.output_parsed;
        const zodItems_metadata = EpubBookMetadataSchema.safeParse(message_metadata);
        if (!zodItems_metadata.success) {
            console.error(zodItems_metadata.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const { data: books, error: books_err } = await supabase
            .from('books')
            .insert([{
                title: zodItems_metadata.data.title,
                symbol: zodItems_metadata.data.symbol,
                author: zodItems_metadata.data.author,
                genre: zodItems_metadata.data.genre,
                book_review: zodItems_metadata.data.book_review,
            }]).select('id').single();


        if (books_err) {
            console.error(books_err.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }
        bookMeteId = books.id;

        const metaJson = JSON.stringify(message_metadata); //특수문자 처리
        const message_chapters: EpubBookChapters[] = [];

        for (let i = 0; i <= 4; i++) {
            const chapter_point = Math.floor((i / 4) * 100);
            const response_chapters = await openai.responses.parse({
                model: "gpt-5-mini",
                text: {
                    format: {
                        type: "json_schema",
                        schema: chaptersSchema, //metadataSchema.properties 형태로 값 반환
                        name: "chaptersSchema",
                        strict: true
                    }
                },
                input: `
Write the ${i === 0 ? 'prologue' : `chapter that corresponds to the ${chapter_point} progress point`} based on ${i === 0 ? metaJson : message_chapters[i - 1].summary}, and return the result as valid JSON only.

Feel free to reinterpret the genre in an unexpected but meaningful way.
Combine emotional depth with imaginative storytelling, even if it bends typical conventions.

The JSON must include:
- title: a short Korean title that summarizes the chapters main theme, based on the content you generate.
- summary: a concise Korean paragraph summarizing the key events and emotions (80–600 characters).
- content: full Korean prose (1,000–3,000 characters) with paragraphs separated by the ${bookToken}.

Output exactly one JSON object that matches the schema. No explanations, no comments, and no code fences.
`,

                max_output_tokens: 4000,
            });
            if (!response_chapters.output_parsed) {
                delete_meta(supabase, bookMeteId);
                console.error("!response_chapters.output_parsed");
                return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
            }
            message_chapters.push(response_chapters.output_parsed);
        }

        // 1회 사용량: console.log(response_chapters.usage);
        const zodItems_chapters = z.array(EpubBookChaptersSchema).safeParse(message_chapters);
        if (!zodItems_chapters.success) {
            console.error(zodItems_chapters.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        for (let index = 0; index < zodItems_chapters.data.length; index++) {

            const rawXhtml = zodItems_chapters.data[index].content;
            const parts = rawXhtml
                .split(`${bookToken}`)
                .map(s => s.trim())
                .filter(Boolean);// 빈 문자열 제거

            const paragraphs = parts
                .map(p => `<p>${escape(p)}</p>`)
                .join(""); // 배열 문자화

            const { error: chaptersError } = await supabase
                .from('chapters')
                .insert([{
                    book_id: books.id,
                    title: zodItems_chapters.data[index].title,
                    xhtml: paragraphs,
                    seq: index + 1,
                }])


            if (chaptersError) {
                delete_meta(supabase, books.id);
                console.error(chaptersError.message);
                return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
            }
        }

        return NextResponse.json({ status: 200 })
    } catch (err: unknown) {
        delete_meta(supabase, bookMeteId);
        if (err instanceof Error) console.error(err.message);
        else console.error(err);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}