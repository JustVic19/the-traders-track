/**
 * Client-side rate limiting utility for security
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private blocked: Map<string, number> = new Map();

  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    
    // Check if currently blocked
    const blockedUntil = this.blocked.get(key);
    if (blockedUntil && now < blockedUntil) {
      return false;
    }

    // Clean up old attempts
    const attempts = this.attempts.get(key) || [];
    const validAttempts = attempts.filter(
      timestamp => now - timestamp < config.windowMs
    );

    if (validAttempts.length >= config.maxAttempts) {
      // Block user if blockDuration is specified
      if (config.blockDurationMs) {
        this.blocked.set(key, now + config.blockDurationMs);
      }
      return false;
    }

    // Record this attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
    this.blocked.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Common rate limiting configurations
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  },
  TRADE_CREATION: {
    maxAttempts: 10,
    windowMs: 60 * 1000 // 1 minute
  },
  SKILL_INVESTMENT: {
    maxAttempts: 20,
    windowMs: 60 * 1000 // 1 minute
  }
};