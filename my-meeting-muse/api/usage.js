const { validateANRUser, usageTracker } = require('./auth');

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail } = req.query;
    
    // 🔒 SECURITY CHECKS
    const validation = validateANRUser(userEmail);
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }
    
    // 🔒 ADMIN CHECK: Only admin can view usage analytics
    const isAdmin = userEmail === 'gieve@anr.in';
    if (!isAdmin) {
      return res.status(403).json({ 
        error: 'Admin access required for usage analytics.' 
      });
    }
    
    // Get usage data from tracker
    const usageData = Array.from(usageTracker.values());
    
    // Calculate totals
    const totalRequests = usageData.reduce((sum, user) => sum + user.requests, 0);
    const totalCost = usageData.reduce((sum, user) => sum + user.totalCost, 0);
    
    res.status(200).json({
      success: true,
      analytics: {
        totalRequests,
        totalCost: totalCost.toFixed(4),
        activeUsers: usageData.length,
        users: usageData.map(user => ({
          email: user.email,
          requests: user.requests,
          cost: user.totalCost.toFixed(4),
          lastActivity: user.actions[user.actions.length - 1]?.timestamp
        }))
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Usage analytics error:', error);
    
    res.status(500).json({
      error: 'Analytics service temporarily unavailable.',
      code: 'ANALYTICS_ERROR'
    });
  }
}