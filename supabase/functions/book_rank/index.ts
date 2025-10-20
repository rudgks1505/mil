// @ts-expect-error: importing via npm: may not resolve types in this environment
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/// <reference types="deno" />

const genre = [
  "판타지",
  "SF",
  "로맨스",
  "미스터리",
  "스릴러",
  "호러",
  "역사소설",
  "성장소설",
  "드라마",
  "철학",
  "무협",
  "라이트노벨",
];


Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    //각 장르별 상위 100개를 가져온 뒤, 배열에 담고. 평탄화 작업 뒤, sort로 정렬

    const promises = genre.map(g =>
      supabase
        .from("books")
        .select('id, today_hit, today_rank')
        .eq('genre', g)
        .order('today_hit', { ascending: false })
        .order("id", { ascending: false })
        .limit(100)
    );

    const results = await Promise.allSettled(promises);

    const items = [];

    for (const el of results) {
      if (el.status === "fulfilled") {
        const { data } = el.value;
        items.push(data);
      } else {
        const err = el.reason;
        if (err) return new Response("Error: " + err.message, { status: 500 });
      }
    }

    const hit_data = items.flat().sort((a, b) => b.today_hit - a.today_hit);


    for (let index = 0; index < hit_data.length; index++) {
      const { error } = await supabase
        .from("books")
        .update({ today_rank: index, last_rank: hit_data[index].today_rank })
        .eq('id', hit_data[index].id);

      if (error) return new Response("Error: " + error.message, { status: 500 });
    }

    const { error } = await supabase
      .from("books")
      .update({ today_hit: 0 })
      .gt('today_hit', 0);

    if (error) return new Response("Error: " + error.message, { status: 500 });

    return new Response("update done", { status: 200 });

  } catch (e) {
    const msg =
      e && typeof e === 'object' && 'message' in e
        ? String((e as any).message)
        : String(e);
    console.error('[unhandled]', e);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
});