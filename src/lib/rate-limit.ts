interface RateLimitBucket {
    tokens: number
    lastRefill: number
}

const buckets = new Map<string, RateLimitBucket>()


const BUCKET_LIMIT = 100
const REFILL_RATE = 500

let callCount = 0

function checkRateLimitLocal(key: string): boolean {
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


export async function checkRateLimit(key: string): Promise<boolean> {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

    if (!url || !token) {

        return checkRateLimitLocal(key)
    }

    try {
        const windowSeconds = 60
        const limit = 60
        const now = Math.floor(Date.now() / 1000)
        const windowTimestamp = Math.floor(now / windowSeconds)
        const redisKey = `ratelimit:${key}:${windowTimestamp}`
        const ttl = windowSeconds - (now % windowSeconds)

        const response = await fetch(`${url}/pipeline`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify([
                ["INCR", redisKey],
                ["EXPIRE", redisKey, ttl]
            ]),

            signal: AbortSignal.timeout(2000)
        })

        if (!response.ok) {
            console.error("Upstash Redis Rate Limit HTTP Error:", response.statusText)
            return checkRateLimitLocal(key)
        }

        const data = await response.json()
        const currentCount = data[0]?.result

        return currentCount <= limit
    } catch (error) {
        console.error("Upstash Redis Rate Limit Exception, falling back to local memory:", error)
        return checkRateLimitLocal(key)
    }
}
