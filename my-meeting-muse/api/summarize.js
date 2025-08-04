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
    
    // Create AI prompt
    const prompt = `Analyze this meeting transcript and provide:

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
          content: 'You are an expert meeting analyst. Provide clear, actionable insights.'
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