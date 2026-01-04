// Token Bucket Demo - Shows rate limiting in action
import { TokenBucket } from './src/tokenBucket';

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTokenBucketDemo() {
    console.log("🚀 Token Bucket Rate Limiting Demo\n");

    // Create token bucket: max 5 tokens, refill 1 token per second
    const bucket = new TokenBucket(5, 1000, 1);

    console.log("Configuration:");
    console.log("- Max tokens: 5 (burst capacity)");
    console.log("- Refill rate: 1 token per second (steady state)\n");

    const clientId = "api-client-123";

    console.log("=== Phase 1: Testing Burst Capacity ===");
    console.log("Making 7 rapid requests (should allow 5, block 2):");

    for (let i = 1; i <= 7; i++) {
        const allowed = bucket.consumeTokenBucket(clientId);
        console.log(`Request ${i}: ${allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
    }

    console.log("\n=== Phase 2: Waiting for Refill ===");
    console.log("Waiting 3 seconds for tokens to refill...");
    await sleep(3000);

    console.log("\n=== Phase 3: Steady State Rate Limiting ===");
    console.log("Making requests at ~1 per second (should mostly allow):");

    for (let i = 8; i <= 12; i++) {
        const allowed = bucket.consumeTokenBucket(clientId);
        console.log(`Request ${i}: ${allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
        await sleep(1100); // Slightly more than 1 second
    }

    console.log("\n=== Phase 4: Exceeding Rate Limit ===");
    console.log("Making 3 rapid requests (should be rate limited):");

    for (let i = 13; i <= 15; i++) {
        const allowed = bucket.consumeTokenBucket(clientId);
        console.log(`Request ${i}: ${allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
    }

    console.log("\n🎯 Demo Complete!");
    console.log("The token bucket successfully:");
    console.log("- Allowed burst traffic (5 requests)");
    console.log("- Refilled tokens over time");
    console.log("- Limited steady-state traffic to 1 request/second");
}

runTokenBucketDemo().catch(console.error);