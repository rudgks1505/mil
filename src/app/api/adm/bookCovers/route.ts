import OpenAI from "openai";
import { NextResponse } from 'next/server'
import sharp from 'sharp';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { BookCoverSelectOption, BookCoverSelectOptionSchema } from "@/types/schemas";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.error('user null');
            return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
        }
        const user = session.user;
        if (user?.email !== 'rudgks1505@gmail.com') return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });


        const body: BookCoverSelectOption = await req.json();
        const zodItems = BookCoverSelectOptionSchema.safeParse(body);

        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: '유효성 검사 실패' }, { status: 400 });
        }

        const book_covers_prompt = `
Prompt:
A contemporary, bookstore-ready 3D book mockup of a Korean novel, placed on a clean wooden table or neutral surface.

Visual details:
– Symbol / Iconography: ${zodItems.data.symbol}
– Typography: ${zodItems.data.typography}
– Layout: ${zodItems.data.layout}
– Color palette: Harmonize with the genre '${zodItems.data.genre}' and the title '${zodItems.data.title}'.
– Texture and finish: ${zodItems.data.texture} (realistic printed paper, soft matte or semi-gloss finish).
– Author: ${zodItems.data.author}

Art direction:
– Present the book as a physical object, angled slightly toward the viewer.
– Include the spine and subtle book thickness, but focus mainly on the front cover.
– Professional bookstore-quality mockup photo aesthetic, with soft shadows and cinematic daylight.
– No visible watermark, logo, or genre label.
– Title and author should appear clearly printed and legible on the front cover.
– Natural color tones, realistic paper lighting, and gentle depth of field for realism.

Hard constraints:
– Show front cover and partial spine only; no back cover visible.
– Aspect ratio 2:3 (portrait) for the book’s front surface.
– Korean text must remain accurate, readable, and naturally typeset.
– Avoid flat graphic renderings — it should appear like a real printed book photographed on a studio surface.
– The image should look indistinguishable from a real Korean novel displayed in a bookstore.

--ar 2:3, ultra-realistic lighting, 4K detail, soft studio shadows
`;

        const book_covers_result = await openai.images.generate({
            model: "gpt-image-1",
            prompt: book_covers_prompt,
            size: "1024x1536",
            quality: "medium", //로우 미디엄 하이 오토만 가능
            n: 1,
        });

        if (!book_covers_result.data) {
            console.error('book_covers_result null');
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }


        const book_covers_image_base64 = book_covers_result.data[0].b64_json;

        if (!book_covers_image_base64) {
            console.error('book_covers_image_base64 null');
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }

        const book_covers_buffer = Buffer.from(book_covers_image_base64, "base64");
        const book_covers_metadata = await sharp(book_covers_buffer).metadata();


        const timestamp = Date.now();
        const mime = book_covers_metadata.format ? `image/${book_covers_metadata.format}` : "application/octet-stream";
        const book_covers_path = `bookId_${zodItems.data.id}/${zodItems.data.id}_${timestamp}.${book_covers_metadata.format}`;

        const book_covers_resize = await sharp(book_covers_buffer).resize(200).toBuffer();

        const { error: storage_err } = await supabase.storage
            .from("book_covers").upload(book_covers_path, book_covers_resize, {
                contentType: mime,
                upsert: true,
                cacheControl: '43200',
            });

        if (storage_err) {
            console.error(storage_err.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }

        const { error: update_err } = await supabase
            .from('books')
            .update({ img_path: book_covers_path })
            .eq("id", zodItems.data.id);

        if (update_err) {
            console.error(update_err.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }


        return NextResponse.json({ data: { book_covers_path: book_covers_path } }, { status: 200 })
    } catch (err: any) {
        console.error(err.message);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}