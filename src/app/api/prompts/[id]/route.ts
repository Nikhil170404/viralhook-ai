
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const promptId = params.id;
    const cookieStore = await cookies();

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

    // 2. Perform Delete (Row Level Security would typically handle this, but adding explicit user_id check is safer)
    const { error } = await supabase
        .from('generated_prompts')
        .delete()
        .eq('id', promptId)
        .eq('user_id', user.id); // Strict ownership enforcement

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const promptId = params.id;
    const { prompt_text, viral_hook } = await request.json();
    const cookieStore = await cookies();

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

    // 2. Validate Input
    if (!prompt_text) {
        return NextResponse.json({ error: "Prompt text is required" }, { status: 400 });
    }

    // 3. Perform Update (Strict ownership check)
    const { error } = await supabase
        .from('generated_prompts')
        .update({
            prompt_text,
            viral_hook: viral_hook || null
        })
        .eq('id', promptId)
        .eq('user_id', user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
