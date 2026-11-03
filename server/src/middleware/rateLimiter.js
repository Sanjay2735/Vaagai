/**
 * In-memory brute-force rate limiter for authentication endpoints
 */

const loginAttempts = new Map();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000; // 1 minute lockout

export function loginRateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const email = (req.body?.email || '').toLowerCase().trim();
  const key = `${ip}:${email}`;

  const now = Date.now();
  const record = loginAttempts.get(key);

  if (record) {
    if (record.lockedUntil && record.lockedUntil > now) {
      const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts. Security lockout active. Please wait ${waitSeconds} seconds before retrying.`,
        lockoutSeconds: waitSeconds,
      });
    }

    // Reset if window has elapsed
    if (now - record.firstAttempt > LOCKOUT_MS) {
      loginAttempts.delete(key);
    }
  }

  // Attach record updater to res
  res.recordFailedAttempt = () => {
    const current = loginAttempts.get(key) || { count: 0, firstAttempt: now };
    current.count += 1;
    if (current.count >= MAX_ATTEMPTS) {
      current.lockedUntil = Date.now() + LOCKOUT_MS;
      console.warn(`[Security Alert]: Rate limit triggered for ${key}. Locked for 60s.`);
    }
    loginAttempts.set(key, current);
  };

  res.recordSuccessfulLogin = () => {
    loginAttempts.delete(key);
  };

  next();
}

export default loginRateLimiter;

