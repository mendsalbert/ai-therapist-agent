import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimit = new Map<string, RateLimitRecord>();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimit.entries()) {
    if (record.resetTime < now) {
      rateLimit.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Check rate limit for a request
 * @param req - The Next.js request object
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns null if allowed, NextResponse with 429 error if rate limited
 */
export function checkRateLimit(
  req: NextRequest,
  maxRequests = 10,
  windowMs = 60000
): NextResponse | null {
  // Get client identifier (IP address or user ID)
  const identifier = 
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    req.ip ||
    'unknown';
  
  const now = Date.now();
  const record = rateLimit.get(identifier);
  
  // Create new record if doesn't exist or window has expired
  if (!record || record.resetTime < now) {
    rateLimit.set(identifier, { 
      count: 1, 
      resetTime: now + windowMs 
    });
    return null;
  }
  
  // Check if limit exceeded
  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return NextResponse.json(
      { 
        success: false,
        error: 'Too many requests',
        retryAfter: `${retryAfter} seconds`
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
        }
      }
    );
  }
  
  // Increment count
  record.count++;
  return null;
}

/**
 * Create a rate limit middleware wrapper
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 */
export function createRateLimiter(maxRequests = 10, windowMs = 60000) {
  return (req: NextRequest) => checkRateLimit(req, maxRequests, windowMs);
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  // Strict - for sensitive operations (login, registration)
  strict: (req: NextRequest) => checkRateLimit(req, 5, 60000), // 5 req/min
  
  // Standard - for normal API calls
  standard: (req: NextRequest) => checkRateLimit(req, 30, 60000), // 30 req/min
  
  // Lenient - for high-frequency operations
  lenient: (req: NextRequest) => checkRateLimit(req, 100, 60000), // 100 req/min
  
  // AI - for AI-powered endpoints (expensive)
  ai: (req: NextRequest) => checkRateLimit(req, 10, 60000), // 10 req/min
};

