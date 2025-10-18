import { NextResponse, NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { deleteItemsSchema, deleteItems, Mainvisual, MainvisualSchema } from "@/types/schemas";
import { z } from 'zod';
import { publicMainvisualInsertSchema, publicMainvisualRowSchema } from "@/types/zodSchemas";
import sharp from 'sharp';
import omit from 'lodash/omit';
import crypto from 'node:crypto';

const CACHE_CTRL = 'public, max-age=3600, stale-while-revalidate=3600';

const mainvisual_delete = async (supabase: any, id: number) => {
    const { error: delete_err } = await supabase
        .from('mainvisual')
        .delete()
        .eq('id', id);
    if (delete_err) {
        console.error(delete_err.message);
        return NextResponse.json({ message: `데이터 처리 중 오류가 발생했습니다.` }, { status: 400 })
    };
}

export async function PUT(req: Request) {
    try {

        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const body = await req.formData();
        const rowId = body.getAll("id");
        const rowFile = body.getAll("file");
        const rowM = body.getAll("m");
        const rowItems = body.get("items");
        //body.get 파일이면 파싱 해줌, 


        if (typeof rowItems !== "string") {
            console.error('rowItems 유효성 검사 실패');
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const hasBlob = rowId.some(el => el instanceof Blob);
        if (hasBlob) {
            console.error('hasBlob 유효성 검사 실패');
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const zodrowId = z.array(z.string()).safeParse(rowId);
        const zodItems = z.array(publicMainvisualInsertSchema).safeParse(JSON.parse(rowItems));

        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }
        if (!zodrowId.success) {
            console.error(zodrowId.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const items = zodItems.data;
        const path: string[] = [];
        const path_m: string[] = [];
        const ext: string[] = [];
        const ext_m: string[] = [];
        const sharp_metadata = [];
        const sharp_metadata_m = [];

        const { data, error } = await supabase
            .from('mainvisual')
            .upsert(items, { onConflict: "id" })
            .select();

        if (error) {
            console.error(error.message);
            return NextResponse.json({ message: `데이터 처리 중 오류가 발생했습니다.` }, { status: 400 });
        }

        for (let i = 0; i < items.length; i++) {
            const el = rowFile[i];
            const el_m = rowM[i];

            if (el instanceof File && el_m instanceof File) {

                const arrayBuffer = await el.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                sharp_metadata[i] = await sharp(buffer).metadata();

                const arrayBuffer_m = await el_m.arrayBuffer();
                const buffer_m = Buffer.from(arrayBuffer_m);
                sharp_metadata_m[i] = await sharp(buffer_m).metadata();

                if (sharp_metadata[i].width < 1360 || sharp_metadata[i].height < 430) {
                    mainvisual_delete(supabase, data[i].id);
                    return NextResponse.json({ message: `pc 이미지 크기는 최소 넓이 1360, 최소 높이 430 이상이어야 합니다.` }, { status: 400 })
                }

                if (sharp_metadata_m[i].width < 600 || sharp_metadata_m[i].height < 700) {
                    mainvisual_delete(supabase, data[i].id);
                    return NextResponse.json({ message: `모바일 이미지 크기는 최소 넓이 600, 최소 높이 700 이상이어야 합니다.` }, { status: 400 })
                }

                const resized_el = await sharp(buffer).resize(1360, 430, { withoutEnlargement: true }).toBuffer();
                const resized_el_m = await sharp(buffer_m).resize(600, 700, { withoutEnlargement: true }).toBuffer();

                const timestamp = Date.now();
                ext[i] = (el.name.split(".").pop() ?? "bin").toLowerCase();
                ext_m[i] = (el_m.name.split(".").pop() ?? "bin").toLowerCase();
                path[i] = `${data[i].id}_${timestamp}.${ext[i]}`;
                path_m[i] = `${data[i].id}_${timestamp}_m.${ext_m[i]}`;

                const { data: update_data, error: update_err } = await supabase
                    .from('mainvisual')
                    .update({ img_path: path[i], img_path_m: path_m[i] })
                    .eq("id", data[i].id)
                    .select();

                if (update_err) {
                    mainvisual_delete(supabase, data[i].id);
                    console.error(update_err.message);
                    return NextResponse.json({ message: `데이터 처리 중 오류가 발생했습니다.` }, { status: 400 })
                }

                if (update_data) {

                    const { error: storage_err } = await supabase.storage
                        .from("mainvisual").upload(path[i], resized_el, {
                            contentType: el.type,
                            upsert: true,
                            cacheControl: '43200',
                        });

                    const { error: storage_err_m } = await supabase.storage
                        .from("mainvisual").upload(path_m[i], resized_el_m, {
                            contentType: el_m.type,
                            upsert: true,
                            cacheControl: '43200',
                        });

                    if (storage_err || storage_err_m) {
                        mainvisual_delete(supabase, data[i].id);
                        console.error(storage_err ? storage_err.message : storage_err_m?.message);
                        return NextResponse.json({ message: `데이터 처리 중 오류가 발생했습니다.` }, { status: 400 });
                    }
                }
            }
        }

        return NextResponse.json({ status: 200 });
    } catch (err: any) {
        console.error(err.message);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {

        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const body = await req.formData();
        const rowId = body.get("id");
        const rowFile = body.get("file");
        const rowM = body.get("m");
        const rowItems = body.get("items");

        if (typeof rowItems !== "string") {
            console.error('rowItems 유효성 검사 실패');
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        if (rowId instanceof Blob) {
            console.error('rowId 유효성 검사 실패');
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const zodrowId = z.string().safeParse(rowId);
        const zodItems = publicMainvisualInsertSchema.safeParse(JSON.parse(rowItems));

        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }
        if (!zodrowId.success) {
            console.error(zodrowId.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const items = zodItems.data;

        const { data, error } = await supabase
            .from('mainvisual')
            .upsert(items, { onConflict: "id" })
            .select();

        if (error) {
            console.error(error.message);
            return NextResponse.json({ message: `데이터 처리 중 오류가 발생했습니다.` }, { status: 400 });
        }

        const el = rowFile;
        const el_m = rowM;

        if (el instanceof File && el_m instanceof File) {
            const arrayBuffer = await el.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const sharp_metadata = await sharp(buffer).metadata();

            const arrayBuffer_m = await el_m.arrayBuffer();
            const buffer_m = Buffer.from(arrayBuffer_m);
            const sharp_metadata_m = await sharp(buffer_m).metadata();

            if (sharp_metadata.width < 1360 || sharp_metadata.height < 430) {
                mainvisual_delete(supabase, data[0].id);
                return NextResponse.json({ message: `pc 이미지 크기는 최소 넓이 1360, 최소 높이 430 이상이어야 합니다.` }, { status: 400 })
            }

            if (sharp_metadata_m.width < 600 || sharp_metadata_m.height < 700) {
                mainvisual_delete(supabase, data[0].id);
                return NextResponse.json({ message: `모바일 이미지 크기는 최소 넓이 600, 최소 높이 700 이상이어야 합니다.` }, { status: 400 })
            }

            const resized_el = await sharp(buffer).resize(1360, 430, { withoutEnlargement: true }).toBuffer();
            const resized_el_m = await sharp(buffer_m).resize(600, 700, { withoutEnlargement: true }).toBuffer();

            const timestamp = Date.now();
            const ext = (el.name.split(".").pop() ?? "bin").toLowerCase();
            const ext_m = (el_m.name.split(".").pop() ?? "bin").toLowerCase();
            const path = `${data[0].id}_${timestamp}.${ext[0]}`;
            const path_m = `${data[0].id}_${timestamp}_m.${ext_m[0]}`;


            const { data: update_data, error: update_err } = await supabase
                .from('mainvisual')
                .update({ img_path: path, img_path_m: path_m })
                .eq("id", data[0].id)
                .select();

            if (update_err) {
                mainvisual_delete(supabase, data[0].id);
                console.error(update_err.message);
                return NextResponse.json({ message: `데이터 처리 중 오류가 발생했습니다.` }, { status: 400 })
            }

            if (update_data) {
                const { error: storage_err } = await supabase.storage
                    .from("mainvisual").upload(path, resized_el, {
                        contentType: el.type,
                        upsert: true,
                        cacheControl: '43200',
                    });

                const { error: storage_err_m } = await supabase.storage
                    .from("mainvisual").upload(path_m, resized_el_m, {
                        contentType: el_m.type,
                        upsert: true,
                        cacheControl: '43200',
                    });

                if (storage_err || storage_err_m) {
                    mainvisual_delete(supabase, data[0].id);
                    console.error(storage_err ? storage_err.message : storage_err_m?.message);
                    return NextResponse.json({ message: `데이터 처리 중 오류가 발생했습니다.` }, { status: 400 });
                }
            }
        }
        return NextResponse.json({ status: 200 });
    } catch (err: any) {
        console.error(err.message);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {

        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const { data, error } = await supabase
            .from('mainvisual')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error(error.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }


        const zodItems = z.array(MainvisualSchema).safeParse(data);
        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }


        const payload = { data: zodItems.data };
        const hash = crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');
        const etag = `W/"${hash}"`;

        const ifNoneMatch = req.headers.get('if-none-match');
        if (ifNoneMatch && ifNoneMatch === etag) {
            return new Response(null, {
                status: 304,
                headers: {
                    'ETag': etag,
                    'Cache-Control': CACHE_CTRL,
                },
            });
        }

        const res = NextResponse.json(payload, { status: 200 });
        res.headers.set('ETag', etag);
        res.headers.set('Cache-Control', CACHE_CTRL);
        return res;
    } catch (err: any) {
        console.error(err.message);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

        const body: deleteItems = await req.json();
        const zodItems = deleteItemsSchema.safeParse(body);

        if (!zodItems.success) {
            console.error(zodItems.error.issues);
            return NextResponse.json({ message: `유효성 검사 실패` }, { status: 400 });
        }

        const { error } = await supabase
            .from('mainvisual')
            .delete()
            .in('id', zodItems.data)

        if (error) {
            console.error(error.message);
            return NextResponse.json({ message: '데이터 처리 중 오류가 발생했습니다.' }, { status: 400 });
        }

        return NextResponse.json({ status: 200 });
    } catch (err: any) {
        console.error(err.message);
        return NextResponse.json({ message: '요청 처리 중 오류.' }, { status: 500 });
    }
}