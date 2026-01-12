import * as dotenv from 'dotenv';
import path from 'path';
import OpenAI from 'openai';

// Import Modes (Relative paths due to script location)
import { getChaosPrompt } from '../src/lib/ai/modes/chaos';
import { getCinematicPrompt } from '../src/lib/ai/modes/cinematic';
import { getShockingPrompt } from '../src/lib/ai/modes/shocking';

// Load Env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
    console.error("❌ Error: OPENROUTER_API_KEY not found in .env.local");
    process.exit(1);
}

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
        "HTTP-Referer": "https://viralhook.ai",
        "X-Title": "Viral Hooks CLI Test",
    }
});

async function testMode(mode: string, object: string) {
    console.log(`\n\n🧪 TESTING MODE: [${mode.toUpperCase()}] for Object: "${object}"`);
    console.log("---------------------------------------------------");

    let systemPrompt = "";
    let randomStyle: any = {};

    switch (mode) {
        case 'chaos':
            ({ systemPrompt, randomStyle } = getChaosPrompt(object));
            break;
        case 'cinematic':
            ({ systemPrompt, randomStyle } = getCinematicPrompt(object));
            break;
        case 'shocking':
            ({ systemPrompt, randomStyle } = getShockingPrompt(object));
            break;
        default:
            console.error("Unknown mode");
            return;
    }

    console.log(`📝 System Prompt Length: ${systemPrompt.length} chars`);
    console.log("⏳ Generating...");

    const startTime = Date.now();
    try {
        const completion = await openai.chat.completions.create({
            model: "tngtech/deepseek-r1t2-chimera:free", // Use free model for testing
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Generate strictly for object: ${object}` }
            ],
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        const content = completion.choices[0].message.content || "";

        // Clean markdown
        const cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const json = JSON.parse(cleaned);
            console.log(`✅ SUCCESS (${duration}s)`);
            console.log("---------------------------------------------------");
            console.log(`🔥 Viral Hook:  "${json.hook}"`);
            console.log(`📂 Category:    ${randomStyle.category || "General"}`);
            // console.log(`🎥 Platform:    ${randomStyle.platform || "Video"}`);
            console.log(`📝 Prompt Preview:`);
            console.log(json.prompt.substring(0, 150) + "...");
            console.log("---------------------------------------------------");
        } catch (e) {
            console.log("⚠️ JSON Parse Failed (Raw Output):", content.substring(0, 200));
        }

    } catch (e: any) {
        console.error("❌ API Error:", e.message);
    }
}

async function runTests() {
    console.log(`🚀 STARTING VIRAL HOOKS CLI TESTER`);
    if (apiKey) {
        console.log(`🔑 API Key Found: ${apiKey.substring(0, 10)}...`);
    }

    // Test 1: Chaos
    await testMode('chaos', 'A rubber duck');

    // Test 2: Shocking
    await testMode('shocking', 'An iPhone 16');

    // Test 3: Cinematic
    await testMode('cinematic', 'A slice of pizza');
}

runTests();
