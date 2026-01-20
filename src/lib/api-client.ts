export async function fetchWithCSRF(url: string, options: RequestInit = {}) {
    // Get CSRF token from cookie
    // Note: Cookie must be non-HttpOnly for this to work
    const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];

    const headers = new Headers(options.headers);

    // Add CSRF token to header for mutation requests
    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase())) {
        headers.set('x-csrf-token', csrfToken);
    }

    return fetch(url, {
        ...options,
        headers,
    });
}
