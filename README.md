# Meeting-Muse
Personal Meeting Recorder AI-Powered Meeting Transcription &amp; Analysis Platform
# 🎙️ Meeting Muse

**AI-Powered Meeting Transcription & Analysis Platform**

Transform your meetings into actionable insights with real-time transcription, intelligent summaries, and automated action item extraction.

---

## ✨ **Features**

### 🎯 **Core Functionality**
- **Real-time Audio Transcription** - Convert speech to text using OpenAI Whisper
- **AI-Powered Meeting Summaries** - Generate executive summaries, action items, and key decisions
- **Calendar Integration** - View upcoming meetings and schedule analysis
- **Usage Analytics** - Track API usage and costs (admin only)

### 🔒 **Security & Controls**
- **Domain Restriction** - Access limited to @anr.in team members only
- **Rate Limiting** - 10 requests per minute per user
- **Usage Tracking** - Monitor API costs and user activity
- **Secure Authentication** - Email-based access control

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 16+ 
- OpenAI API Key ([Get one here](https://platform.openai.com))
- Vercel account for deployment

### **1. Clone Repository**
```bash
git clone https://github.com/GA1972/Meeting-Muse.git
cd Meeting-Muse
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
Create a `.env.local` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### **4. Deploy to Vercel**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### **5. Add Environment Variables**
In Vercel Dashboard → Project Settings → Environment Variables:
- `OPENAI_API_KEY` = your OpenAI API key

---

## 📁 **Project Structure**

```
Meeting-Muse/
├── api/
│   ├── auth.js          # Authentication & rate limiting
│   ├── transcribe.js    # Audio transcription endpoint  
│   ├── summarize.js     # AI meeting analysis
│   ├── calendar.js      # Calendar integration
│   └── usage.js         # Usage analytics (admin)
├── index.html           # Frontend application
├── package.json         # Dependencies
├── vercel.json          # Deployment configuration
└── README.md           # This file
```

---

## 🔌 **API Endpoints**

### **POST /api/transcribe**
Convert audio to text using OpenAI Whisper
```json
{
  "userEmail": "user@anr.in",
  "audioData": "base64_encoded_audio"
}
```

### **POST /api/summarize** 
Generate AI-powered meeting analysis
```json
{
  "userEmail": "user@anr.in", 
  "transcript": "meeting transcript text",
  "meetingTitle": "Team Strategy Session"
}
```

### **GET /api/calendar**
Fetch upcoming meetings
```
GET /api/calendar?userEmail=user@anr.in
```

### **GET /api/usage** 
View usage analytics (admin only)
```
GET /api/usage?userEmail=gieve@anr.in
```

---

## 🛡️ **Security Features**

- **Domain Whitelist**: Only `@anr.in` emails allowed
- **Rate Limiting**: 10 requests/minute per user
- **Admin Controls**: Usage analytics restricted to admin
- **Input Validation**: All endpoints validate required parameters
- **Error Handling**: Secure error messages without sensitive data

---

## 💰 **Cost Management**

### **Estimated API Costs**
- **Whisper Transcription**: ~$0.006 per minute of audio
- **GPT-4 Analysis**: ~$0.03 per 1,000 tokens
- **Rate Limiting**: Built-in protection against excessive usage

### **Usage Tracking**
All API calls are logged with:
- User email and timestamp
- Action type and estimated cost
- Daily/monthly usage summaries

---

## 🎨 **Frontend Features**

- **Modern UI** with real-time audio visualization
- **Drag & Drop** audio file upload
- **Live Transcription** with progress indicators  
- **Interactive Summaries** with expandable sections
- **Meeting Calendar** integration
- **Responsive Design** for mobile and desktop

---

## 🔧 **Technologies Used**

### **Backend**
- **Node.js** - Runtime environment
- **OpenAI API** - Whisper (transcription) + GPT-4 (analysis)
- **Rate Limiter Flexible** - Request rate limiting
- **Vercel Functions** - Serverless API endpoints

### **Frontend** 
- **Vanilla JavaScript** - Lightweight and fast
- **Web Audio API** - Real-time audio processing
- **Fetch API** - Modern HTTP requests
- **CSS Grid/Flexbox** - Responsive layouts

---

## 📊 **Usage Analytics**

Admin users can view:
- Total API requests and costs
- Per-user usage breakdowns  
- Daily/monthly trends
- Active user statistics

Access: Only `gieve@anr.in` can view analytics

---

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
vercel --prod
```

### **Manual Deployment**
1. Build static assets: `npm run build`
2. Deploy to any static host
3. Set environment variables
4. Configure serverless functions

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

---

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 **Team**

**ANR Team** - Internal tool for @anr.in domain users

For support or questions, contact: `gieve@anr.in`

---

## 🔄 **Version History**

- **v1.0.0** - Initial release with core transcription and analysis features
- Domain-restricted access for ANR team
- Full security and rate limiting implementation

---

**Made with ❤️ for productive meetings**
