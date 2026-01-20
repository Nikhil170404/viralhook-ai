
import { getCinematicPrompt, getShockingPrompt, getChaosPrompt, getHooksPrompt } from '../src/lib/prompts/modes';

console.log("Testing Prompt Logic...");

try {
    console.log("Testing Cinematic...");
    const cin = getCinematicPrompt("A red car", "kling");
    if (!cin.systemPrompt) throw new Error("Cinematic prompt empty");
    console.log("Cinematic logic OK");

    console.log("Testing Shocking...");
    const shock = getShockingPrompt("A jumping cat", "runway");
    if (!shock.systemPrompt) throw new Error("Shocking prompt empty");
    console.log("Shocking logic OK");

    console.log("Testing Chaos...");
    const chaos = getChaosPrompt("A flying burger", "veo");
    if (!chaos.systemPrompt) throw new Error("Chaos prompt empty");
    console.log("Chaos logic OK");

    console.log("Testing Hooks...");
    const hooks = getHooksPrompt("My video script", "cinematic");
    if (!hooks.systemPrompt) throw new Error("Hooks prompt empty");
    console.log("Hooks logic OK");

    console.log("ALL LOGIC TESTS PASSED");
} catch (e) {
    console.error("LOGIC TEST FAILED:", e);
    process.exit(1);
}
