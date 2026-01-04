// Design token bucket. Each of the client should be having it's own bucket.
type Bucket = {
    clientId: string;
    tokens: number;
    elapsedTime: number;
};

class TokenBucket {
    private readonly _maxTokens: number;
    private readonly _refillInterval
    private readonly _refillAmount;
    private _buckets: Bucket[] = [];

    constructor(maxTokens: number, refillInterval: number, refillAmount: number) {
        this._maxTokens = maxTokens;
        this._buckets = [];
        this._refillInterval = refillInterval;
        this._refillAmount = refillAmount;
        console.log("Initialize the token bucket...");
    }

    private initializeTokenBucket(clientId: string): Bucket {
        const bucketData = {
            clientId: clientId,
            tokens: this._maxTokens,
            elapsedTime: Date.now(),
        };
        this._buckets.push(bucketData);
        return bucketData;
    }

    private refillBucket(bucket: Bucket): boolean {
        const now = Date.now();
        const timeElapsed = now - bucket.elapsedTime;
        const tokensToAdd =
            Math.floor(timeElapsed / this._refillInterval) * this._refillAmount;
        if (tokensToAdd > 0) {
            bucket.tokens = Math.min(bucket.tokens + tokensToAdd, this._maxTokens);
            bucket.elapsedTime = now;
            return true;
        }
        return false;
    }

    public consumeTokenBucket(clientId: string): boolean {
        let tokenBucket = this._buckets.find(
            (item, idx) => item.clientId == clientId
        );
        if (tokenBucket == null) {
            tokenBucket = this.initializeTokenBucket(clientId);
        }

        this.refillBucket(tokenBucket);
        if (tokenBucket.tokens > 0) {
            tokenBucket.tokens--;
            return true;
        }
        return false;
    }
}

function sleep(time: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, time))
}

async function demonstrateTokenBucket() {
    console.log("=== Token Bucket Rate Limiting Demo ===\n");

    const bucket = new TokenBucket(10, 1000, 2);

    console.log("Configuration:");
    console.log("- Max tokens: 10");
    console.log("- Refill rate: 2 tokens per second\n");

    const clientId = "user123";

    console.log("Testing burst capacity (should allow first 10 requests):");
    for (let i = 1; i <= 12; i++) {
        const allowed = bucket.consumeTokenBucket(clientId);
        console.log(`Request ${i}: ${allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
    }

    console.log("\nWaiting 2 seconds for tokens to refill...");

    await sleep(2000)

    console.log("\nAfter waiting, testing steady-state rate limiting:");
    for (let i = 13; i <= 18; i++) {
        const allowed = bucket.consumeTokenBucket(clientId);
        console.log(`Request ${i}: ${allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
    }

    console.log("\n=== Demo Complete ===");
}

demonstrateTokenBucket();

export { TokenBucket }