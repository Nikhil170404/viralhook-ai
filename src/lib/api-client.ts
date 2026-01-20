export async function fetchWithCSRF(url: string, options: RequestInit = {}) {
    // Get CSRF token from cookie
    // Note: Cookie must be non-HttpOnly for this to work
    const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];

    console.log('[CSRF Client] All cookies:', document.cookie);
    console.log('[CSRF Client] Token found:', csrfToken ? `${csrfToken.slice(0, 8)}...` : 'MISSING');

    const headers = new Headers(options.headers);

    // Add CSRF token to header for mutation requests
    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase())) {
        headers.set('x-csrf-token', csrfToken);
        console.log('[CSRF Client] Header set:', `${csrfToken.slice(0, 8)}...`);
    } else if (!csrfToken) {
        console.warn('[CSRF Client] No CSRF token found in cookies!');
    }

    return fetch(url, {
        ...options,
        headers,
    });
}
