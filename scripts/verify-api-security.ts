const BASE_URL = 'http://localhost:3000';

async function testPromptInjection() {
    console.log("Testing Prompt Injection via API...");
    // Needs a valid session token technically, but let's see if 401 is returned (Auth works) 
    // or if we can bypass.
    // Assuming user can get a token (manual step). 
    // For now, check if endpoint is reachable.

    try {
        const res = await fetch(`${BASE_URL}/api/generate`, {
            method: 'POST',
            body: JSON.stringify({ object: 'test' }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.status === 401) {
            console.log("PASS: Auth check works (401 returned).");
        } else if (res.status === 403) {
            console.log("PASS: CSRF/Auth check works (403 returned).");
        } else {
            console.log(`Response: ${res.status}`);
        }
    } catch (e) {
        console.log("Server not running or reachable.");
    }
}

testPromptInjection();
