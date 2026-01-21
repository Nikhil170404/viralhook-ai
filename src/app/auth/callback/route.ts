import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Always redirect to generator on success
    const next = searchParams.get('next') ?? '/generator'

    console.log('[Auth Callback] Received code:', code ? 'Yes' : 'No', 'Next:', next)

    if (code) {
        const cookieStore = await cookies()
        const redirectUrl = `${origin}${next}`
        const response = NextResponse.redirect(redirectUrl)

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            // Set the cookie on the response object
                            response.cookies.set(name, value, options)
                        })
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log("[Auth Callback] Success. Redirecting to", redirectUrl)
            return response
        } else {
            console.error("[Auth Callback] Exchange Error:", error.message)
            // Redirect to login with error message
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
        }
    }

    // No code provided - redirect to login
    console.error("[Auth Callback] No code provided")
    return NextResponse.redirect(`${origin}/login?error=no_code`)
}

