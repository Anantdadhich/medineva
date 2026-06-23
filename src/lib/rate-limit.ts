interface RateLimitBucket {
    tokens: number
    lastRefill: number
}

const buckets = new Map<string, RateLimitBucket>()


const BUCKET_LIMIT = 30
const REFILL_RATE = 2000

let callCount = 0

export function checkRateLimit(key: string): boolean {
    const now = Date.now()


    callCount++
    if (callCount >= 1000) {
        callCount = 0
        const idleThreshold = BUCKET_LIMIT * REFILL_RATE
        for (const [k, b] of buckets.entries()) {
            if (now - b.lastRefill > idleThreshold) {
                buckets.delete(k)
            }
        }
    }

    let bucket = buckets.get(key)

    if (!bucket) {
        bucket = { tokens: BUCKET_LIMIT, lastRefill: now }
        buckets.set(key, bucket)
    } else {
        const elapsed = now - bucket.lastRefill
        const refilledTokens = Math.floor(elapsed / REFILL_RATE)
        if (refilledTokens > 0) {
            bucket.tokens = Math.min(BUCKET_LIMIT, bucket.tokens + refilledTokens)
            bucket.lastRefill = bucket.lastRefill + (refilledTokens * REFILL_RATE)
        }
    }

    if (bucket.tokens <= 0) {
        return false
    }

    bucket.tokens -= 1
    return true
}
