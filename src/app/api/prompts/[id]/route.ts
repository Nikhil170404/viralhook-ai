import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logger, createRequestLogger } from "@/lib/logger";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: promptId } = await params;
    const cookieStore = await cookies();
    const requestId = crypto.randomUUID().slice(0, 8);
    const log = createRequestLogger(requestId);

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) { /* No-op for read-only */ }
            },
        }
    );

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user) log.child({ userId: user.id });

    // 2. Perform Delete
    const { error } = await supabase
        .from('generated_prompts')
        .delete()
        .eq('id', promptId)
        .eq('user_id', user.id);

    if (error) {
        log.error(`Delete failed for prompt ${promptId}`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: promptId } = await params;
    const { prompt_text, viral_hook } = await request.json();
    const cookieStore = await cookies();
    const requestId = crypto.randomUUID().slice(0, 8);
    const log = createRequestLogger(requestId);

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) { /* No-op */ }
            },
        }
    );

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user) log.child({ userId: user.id });

    // 2. Validate Input
    if (!prompt_text) {
        return NextResponse.json({ error: "Prompt text is required" }, { status: 400 });
    }

    // 3. Perform Update
    const { error } = await supabase
        .from('generated_prompts')
        .update({
            prompt_text,
            viral_hook: viral_hook || null
        })
        .eq('id', promptId)
        .eq('user_id', user.id);

    if (error) {
        log.error(`Update failed for prompt ${promptId}`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
