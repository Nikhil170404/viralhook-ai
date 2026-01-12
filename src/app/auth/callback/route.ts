import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL. Default to /
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const cookieStore = await cookies()
        const response = NextResponse.redirect(`${origin}${next}`)

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
            console.log("Auth Callback: Success. Redirecting to", `${origin}${next}`)
            return response
        } else {
            console.error("Auth Callback: Exchange Error", error)
        }
    }

    // return the user to an error page with instructions
    console.error("Auth Callback: No code or error")
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
