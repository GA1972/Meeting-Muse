const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter: 10 requests per minute per email
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.body.userEmail,
  points: 10,
  duration: 60,
});

// Usage tracking (in production, use a database)
const usageTracker = new Map();

function validateANRUser(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!email.endsWith('@anr.in')) {
    return { 
      valid: false, 
      error: 'Access denied. Only @anr.in team members are authorized.' 
    };
  }
  
  return { valid: true };
}

function trackUsage(email, action, cost = 0) {
  const today = new Date().toISOString().split('T')[0];
  const key = `${email}_${today}`;
  
  if (!usageTracker.has(key)) {
    usageTracker.set(key, {
      email,
      date: today,
      requests: 0,
      actions: [],
      totalCost: 0
    });
  }
  
  const usage = usageTracker.get(key);
  usage.requests++;
  usage.actions.push({ action, timestamp: new Date().toISOString(), cost });
  usage.totalCost += cost;
  
  return usage;
}

async function rateLimitCheck(req, res) {
  try {
    await rateLimiter.consume(req.body.userEmail);
    return true;
  } catch (rejRes) {
    res.status(429).json({
      error: 'Rate limit exceeded. Please wait before making more requests.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
    return false;
  }
}

module.exports = {
  validateANRUser,
  trackUsage,
  rateLimitCheck,
  usageTracker
};