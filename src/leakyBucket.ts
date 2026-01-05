export class LeakyBucket {
    private readonly capacity: number;
    private readonly leakRate: number;
    private readonly bucket: number[];
    private lastElapsed: number;

    constructor(capacity: number, learRate: number) {
        this.capacity = capacity
        this.leakRate = learRate
        this.bucket = []
        this.lastElapsed = Date.now();
    }

    public consumeBucket(): boolean {
        const timeNow = Date.now()

        const timeElapsed = timeNow - this.lastElapsed;

        const leakedClients = timeElapsed * this.leakRate;
        if (leakedClients > 0) {
            for (let i = 0; i <= leakedClients; i++) {
                this.bucket.slice(i, 1);
            }
            this.lastElapsed = Date.now()
        }

        if (this.bucket.length < this.capacity) {
            this.bucket.push(timeNow)
            return true
        }
        return false
    }
}

const rateLimiter = new LeakyBucket(10, 0.01);
function testBasicRateLimiting() {
    console.log('Testing basic LeakyBucket rate limiter...\n');

    for (let i = 1; i <= 15; i++) {
        const allowed = rateLimiter.consumeBucket();
        console.log(`Request ${i}: ${allowed ? '✅ Allowed' : '❌ Rate limited'}`);
    }
}

class APIHandler {
    private rateLimiter: LeakyBucket;

    constructor(requestsPerSecond: number, burstCapacity: number) {
        const leakRatePerMs = requestsPerSecond / 1000;
        this.rateLimiter = new LeakyBucket(burstCapacity, leakRatePerMs, 0);
    }

    handleRequest(userId: string, endpoint: string): boolean {
        const allowed = this.rateLimiter.consumeBucket();

        if (allowed) {
            console.log(`✅ Processing request from user ${userId} to ${endpoint}`);
            return true;
        } else {
            console.log(`❌ Rate limited request from user ${userId} to ${endpoint}`);
            return false;
        }
    }
}

function demonstrateScenarios() {
    console.log('\n=== Different Rate Limiting Scenarios ===\n');

    console.log('1. High Traffic API (100 req/sec, burst capacity 50):');
    const highTrafficAPI = new APIHandler(100, 50);

    for (let i = 0; i < 55; i++) {
        highTrafficAPI.handleRequest('user123', '/api/data');
    }

    console.log('\n2. Login endpoint (5 req/minute, burst of 2):');
    const loginLimiter = new LeakyBucket(2, 5 / 60000, 0);

    for (let i = 0; i < 8; i++) {
        const allowed = loginLimiter.consumeBucket();
        console.log(`Login attempt ${i + 1}: ${allowed ? '✅ Allowed' : '❌ Rate limited'}`);
    }
}

async function handleAPIRequests() {
    const limiter = new LeakyBucket(5, 0.005, 0);

    const requests = Array.from({ length: 10 }, (_, i) => `Request ${i + 1}`);

    for (const request of requests) {
        const allowed = limiter.consumeBucket();

        if (allowed) {
            console.log(`${request}: Processing...`);
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log(`${request}: Completed ✅`);
        } else {
            console.log(`${request}: Rate limited ❌`);
        }

        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

testBasicRateLimiting();
demonstrateScenarios();
handleAPIRequests().then(() => console.log('Async example completed'));
