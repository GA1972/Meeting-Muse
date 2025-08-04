// ==========================================
// 📁 /package.json
// ==========================================
{
  "name": "my-meeting-muse",
  "version": "1.0.0",
  "scripts": {
    "dev": "vercel dev",
    "build": "echo 'Static site - no build needed'",
    "deploy": "vercel"
  },
  "dependencies": {
    "openai": "^4.0.0",
    "node-fetch": "^3.3.0",
    "rate-limiter-flexible": "^2.4.1"
  }
}

// ==========================================
// 📁 /vercel.json
// ==========================================
{
  "functions": {
    "api/*.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "POST, GET, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}

// ==========================================
// 📁 /api/auth.js - Authentication & Domain Validation
// ==========================================
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter: 10 requests per minute per email
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.body.userEmail,
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
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
  rateLimitCheck
};

// ==========================================
// 📁 /api/transcribe.js - Audio Transcription (OpenAI Whisper)
// ==========================================
const OpenAI = require('openai');
const { validateANRUser, trackUsage, rateLimitCheck } = require('./auth');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail, audioData } = req.body;
    
    // 🔒 SECURITY CHECK 1: Validate ANR.in domain
    const validation = validateANRUser(userEmail);
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }
    
    // 🔒 SECURITY CHECK 2: Rate limiting
    const rateLimitPassed = await rateLimitCheck(req, res);
    if (!rateLimitPassed) return; // Response already sent
    
    // 🔒 SECURITY CHECK 3: Validate audio data
    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }
    
    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    
    // Create form data for OpenAI
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: 'audio/wav' }), 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    
    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: formData.get('file'),
      model: 'whisper-1',
      language: 'en',
    });
    
    // Track usage (approximate cost: $0.006 per minute)
    const estimatedCost = 0.006; // Rough estimate
    trackUsage(userEmail, 'transcription', estimatedCost);
    
    console.log(`✅ Transcription success for ${userEmail}`);
    
    res.status(200).json({
      success: true,
      transcript: transcription.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Transcription error:', error);
    
    // Don't expose internal errors to client
    res.status(500).json({
      error: 'Transcription service temporarily unavailable. Please try again.',
      code: 'TRANSCRIPTION_ERROR'
    });
  }
}

// ==========================================
// 📁 /api/summarize.js - AI Meeting Summary (GPT-4)
// ==========================================
const OpenAI = require('openai');
const { validateANRUser, trackUsage, rateLimitCheck } = require('./auth');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail, transcript, meetingTitle } = req.body;
    
    // 🔒 SECURITY CHECKS
    const validation = validateANRUser(userEmail);
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }
    
    const rateLimitPassed = await rateLimitCheck(req, res);
    if (!rateLimitPassed) return;
    
    if (!transcript || transcript.length < 50) {
      return res.status(400).json({ error: 'Valid transcript is required' });
    }
    
    // Create AI prompt for healthcare advertising context
    const prompt = `As an AI assistant for A&R Advertising (healthcare marketing agency), analyze this meeting transcript and provide:

1. **Executive Summary** (2-3 key points)
2. **Action Items** (specific, assignable tasks)
3. **Next Steps** (upcoming priorities)
4. **Key Decisions** (important conclusions reached)

Meeting Title: ${meetingTitle || 'Team Meeting'}

Transcript:
${transcript}

Format as JSON with keys: summary, actionItems, nextSteps, keyDecisions`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert meeting analyst for a healthcare advertising agency. Provide clear, actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });
    
    // Parse AI response
    let analysis;
    try {
      analysis = JSON.parse(completion.choices[0].message.content);
    } catch {
      // Fallback if JSON parsing fails
      analysis = {
        summary: completion.choices[0].message.content,
        actionItems: ['Review meeting recording for missed details'],
        nextSteps: ['Follow up on discussed topics'],
        keyDecisions: ['Refer to detailed transcript']
      };
    }
    
    // Track usage (approximate cost: $0.03 per 1K tokens)
    const tokensUsed = completion.usage.total_tokens;
    const estimatedCost = (tokensUsed / 1000) * 0.03;
    trackUsage(userEmail, 'ai_summary', estimatedCost);
    
    console.log(`✅ AI Summary success for ${userEmail} (${tokensUsed} tokens)`);
    
    res.status(200).json({
      success: true,
      analysis,
      tokensUsed,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ AI Summary error:', error);
    
    res.status(500).json({
      error: 'AI analysis service temporarily unavailable. Please try again.',
      code: 'AI_SUMMARY_ERROR'
    });
  }
}

// ==========================================
// 📁 /api/calendar.js - Google Calendar Integration
// ==========================================
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
    
    const rateLimitPassed = await rateLimitCheck(req, res);
    if (!rateLimitPassed) return;
    
    // In production, implement actual Google Calendar API
    // For now, return demo data for ANR team
    const demoMeetings = [
      {
        id: 'anr_meeting_1',
        summary: 'Client Strategy Review - Pharma Campaign',
        start: { dateTime: new Date(Date.now() + 30 * 60000).toISOString() },
        end: { dateTime: new Date(Date.now() + 90 * 60000).toISOString() },
        attendees: [
          { email: 'gieve@anr.in', displayName: 'Gieve Acidwalla' },
          { email: 'client@pharma.com', displayName: 'Client Representative' }
        ],
        organizer: { email: userEmail }
      },
      {
        id: 'anr_meeting_2',
        summary: 'Creative Team Standup',
        start: { dateTime: new Date(Date.now() + 2 * 60 * 60000).toISOString() },
        end: { dateTime: new Date(Date.now() + 2.5 * 60 * 60000).toISOString() },
        attendees: [
          { email: 'creative@anr.in', displayName: 'Creative Team' }
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

// ==========================================
// 📁 /api/usage.js - Admin Usage Analytics
// ==========================================
const { validateANRUser, trackUsage } = require('./auth');

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
    const isAdmin = userEmail === 'gieve@anr.in'; // Add more admins as needed
    if (!isAdmin) {
      return res.status(403).json({ 
        error: 'Admin access required for usage analytics.' 
      });
    }
    
    // Get usage data from tracker (in production, use database)
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

// ==========================================
// 📁 /.env.example - Environment Variables Template
// ==========================================
/*
# Copy this to .env.local for local development
# Add these to Vercel Environment Variables for production

# OpenAI API Key (get from https://platform.openai.com/)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Google Calendar API (get from https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_API_KEY=your-google-api-key

# Optional: Additional AI Services
ASSEMBLYAI_API_KEY=your-assemblyai-key
ANTHROPIC_API_KEY=your-claude-api-key

# Admin Configuration
ADMIN_EMAILS=gieve@anr.in,admin@anr.in

# Rate Limiting Configuration
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60
*/