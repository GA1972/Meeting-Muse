const { validateANRUser, trackUsage, rateLimitCheck } = require('./auth');

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
    
    const rateLimitPassed = await rateLimitCheck({ body: { userEmail } }, res);
    if (!rateLimitPassed) return;
    
    // Demo meetings for ANR team
    const demoMeetings = [
      {
        id: 'meeting_1',
        summary: 'Team Strategy Session',
        start: { dateTime: new Date(Date.now() + 30 * 60000).toISOString() },
        end: { dateTime: new Date(Date.now() + 90 * 60000).toISOString() },
        attendees: [
          { email: userEmail, displayName: 'You' },
          { email: 'team@anr.in', displayName: 'Team Member' }
        ],
        organizer: { email: userEmail }
      },
      {
        id: 'meeting_2',
        summary: 'Client Review Meeting',
        start: { dateTime: new Date(Date.now() + 2 * 60 * 60000).toISOString() },
        end: { dateTime: new Date(Date.now() + 2.5 * 60 * 60000).toISOString() },
        attendees: [
          { email: userEmail, displayName: 'You' },
          { email: 'client@external.com', displayName: 'Client' }
        ],
        organizer: { email: userEmail }
      }
    ];
    
    trackUsage(userEmail, 'calendar_fetch', 0);
    
    res.status(200).json({
      success: true,
      meetings: demoMeetings,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Calendar error:', error);
    
    res.status(500).json({
      error: 'Calendar service temporarily unavailable.',
      code: 'CALENDAR_ERROR'
    });
  }
}