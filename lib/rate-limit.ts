/**
 * Simple in-memory rate limiter for development
 * For production, use Upstash Redis or similar service
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default: 1 minute)
  maxRequests?: number; // Max requests per window (default: 30)
  keyGenerator?: (req: any) => string; // Custom key generator
}

/**
 * Get client identifier (IP address or user ID)
 */
function getClientKey(request: Request): string {
  // Try to get IP from headers (works with reverse proxies)
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") || "unknown";
  return ip;
}

/**
 * Create a rate limiter for an endpoint
 */
export function createRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute default
  const maxRequests = options.maxRequests || 30;
  const keyGenerator = options.keyGenerator || getClientKey;

  return {
    check: (request: Request): { allowed: boolean; remaining: number; resetTime: number } => {
      const key = keyGenerator(request);
      const now = Date.now();

      // Initialize or reset if window expired
      if (!store[key] || store[key].resetTime < now) {
        store[key] = {
          count: 0,
          resetTime: now + windowMs,
        };
      }

      const record = store[key];
      const remaining = Math.max(0, maxRequests - record.count);

      if (record.count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: record.resetTime,
        };
      }

      record.count++;

      return {
        allowed: true,
        remaining: remaining - 1,
        resetTime: record.resetTime,
      };
    },
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // General API rate limit: 100 requests per minute
  api: createRateLimiter({ windowMs: 60 * 1000, maxRequests: 100 }),

  // Auth endpoints: 5 attempts per 15 minutes
  auth: createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 5 }),

  // Scraping: 10 requests per 5 minutes to prevent abuse
  scraping: createRateLimiter({ windowMs: 5 * 60 * 1000, maxRequests: 10 }),
};
