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
    const { userEmail, audioData } = req.body;
    
    // 🔒 SECURITY CHECK 1: Validate ANR.in domain
    const validation = validateANRUser(userEmail);
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }
    
    // 🔒 SECURITY CHECK 2: Rate limiting
    const rateLimitPassed = await rateLimitCheck(req, res);
    if (!rateLimitPassed) return;
    
    // 🔒 SECURITY CHECK 3: Validate audio data
    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }
    
    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    
    // Create a file-like object for OpenAI
    const audioFile = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });
    
    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    });
    
    // Track usage (approximate cost: $0.006 per minute)
    const estimatedCost = 0.006;
    trackUsage(userEmail, 'transcription', estimatedCost);
    
    console.log(`✅ Transcription success for ${userEmail}`);
    
    res.status(200).json({
      success: true,
      transcript: transcription.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Transcription error:', error);
    
    res.status(500).json({
      error: 'Transcription service temporarily unavailable. Please try again.',
      code: 'TRANSCRIPTION_ERROR'
    });
  }
}