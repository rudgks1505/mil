// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/// <reference types="deno" />



Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase
      .from("member")
      .update({ uuid: null, uuid_close: null })
      .lte("uuid_close", new Date().toISOString())
      .not("uuid_close", "is", null);

    if (error) return new Response("Error: " + error.message, { status: 500 });
    return new Response("cleanup done", { status: 200 });


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