export async function fetchWithCSRF(url: string, options: RequestInit = {}) {
    // Get CSRF token from cookie
    // Note: Cookie must be non-HttpOnly for this to work
    const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];

    if (process.env.NODE_ENV !== 'production') {
        console.log('[CSRF Client] Token found:', csrfToken ? `${csrfToken.slice(0, 8)}...` : 'MISSING');
    }

    const headers = new Headers(options.headers);

    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase())) {
        headers.set('x-csrf-token', csrfToken);
    }

    return fetch(url, {
        ...options,
        headers,
    });
}
