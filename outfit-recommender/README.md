# Moody Center Outfit Recommender 🎵👕

AI-powered concert outfit analyzer for UT students attending shows at Moody Center. Uses OpenAI Vision, SerpAPI, and real-time Austin weather data to provide personalized outfit recommendations.

## Features

- **📸 Photo Analysis**: Upload or take a photo of your outfit
- **🤖 AI-Powered Feedback**: OpenAI Vision analyzes your fit based on:
  - Artist genre and vibe
  - Austin weather conditions
  - Moody Center venue considerations
  - Concert crowd aesthetic
- **🌤️ Real-time Weather**: Live Austin weather integration
- **🎨 Outfit Inspiration**: SerpAPI pulls trending concert outfit ideas
- **⭐ Personalized Ratings**: Get a 1-5 star vibe check on your outfit
- **💡 Smart Suggestions**: Actionable tips to level up your look

## Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS
- **AI/ML**: OpenAI Vision (GPT-4 Vision)
- **APIs**: 
  - SerpAPI (outfit ideas, artist info)
  - OpenWeather API (Austin weather)
  - Microsoft Graph API (UT email verification)
- **Icons**: Lucide React

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- API keys for:
  - OpenAI (https://platform.openai.com/)
  - SerpAPI (https://serpapi.com/)
  - OpenWeather (https://openweathermap.org/api)
  - Microsoft Azure (for UT email auth)

### 2. Installation

```bash
# Clone or create the project directory
npm install

# Copy environment template
cp .env.template .env.local
```

### 3. Configure Environment Variables

Edit `.env.local` with your API keys:

```env
OPENAI_API_KEY=sk-...
SERPAPI_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
```

### 4. Get API Keys

#### OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign up/login
3. Navigate to API Keys
4. Create new secret key
5. **Important**: Enable GPT-4 Vision access (may require payment setup)

#### SerpAPI Key
1. Visit https://serpapi.com/
2. Sign up for free account (100 searches/month free)
3. Get API key from dashboard

#### OpenWeather API Key
1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Get API key (may take 1-2 hours to activate)

#### Microsoft Azure (UT Email Verification)
1. Visit Azure Portal
2. Register new app for OAuth
3. Configure redirect URIs
4. Get Client ID and Secret

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000` to see the app.

## Project Structure

```
.
├── components/
│   └── outfit-recommender.jsx     # Main React component
├── pages/
│   └── api/
│       ├── analyze-outfit.js      # OpenAI Vision endpoint
│       ├── outfit-ideas.js        # SerpAPI outfit inspiration
│       ├── artist-info.js         # Artist data from SerpAPI
│       └── weather.js             # Austin weather data
├── .env.template                  # Environment variables template
├── .env.local                     # Your API keys (DO NOT COMMIT)
└── package.json                   # Dependencies
```

## Usage Guide

### For Users

1. **Navigate to Outfit Recommender** section on the Moody Center website
2. **Select your upcoming concert** (or browse artist info)
3. **Upload outfit photo**:
   - Click "Upload a photo" to browse files
   - OR click "Take a photo" to use camera
4. **Get AI analysis**:
   - Overall vibe rating (1-5 stars)
   - What's working well
   - Suggested improvements
   - Weather-specific tips
   - Artist/genre styling advice
5. **Browse outfit inspiration** from similar concerts

### API Endpoints

#### POST `/api/analyze-outfit`
Analyzes outfit photo with OpenAI Vision

**Request Body**:
```json
{
  "image": "data:image/jpeg;base64,...",
  "artist": "Artist Name",
  "genre": "pop",
  "venue": "Moody Center",
  "weather": { "temp": 75, "condition": "Clear" },
  "outfitInspo": { /* SerpAPI results */ }
}
```

**Response**:
```json
{
  "rating": 4,
  "overallFeedback": "Your outfit is fire!",
  "whatWorks": ["Great color choice", "Comfortable shoes"],
  "suggestions": ["Add a light jacket", "Consider accessories"],
  "weatherTips": "Bring a layer for AC!",
  "artistTips": "Perfect for the pop vibe",
  "generalIdeas": [...]
}
```

#### POST `/api/outfit-ideas`
Fetches outfit inspiration via SerpAPI

**Request Body**:
```json
{
  "genre": "pop",
  "vibe": "concert",
  "weather": { "temp": 75 }
}
```

#### GET `/api/weather`
Returns current Austin weather

#### POST `/api/artist-info`
Gets artist details, genre, and concert aesthetic

**Request Body**:
```json
{
  "artistName": "Artist Name"
}
```

## OpenAI Vision Prompt Engineering

The system uses a carefully crafted prompt that considers:

1. **Context Awareness**:
   - Artist genre and typical concert vibe
   - Current Austin weather
   - Moody Center as an indoor arena
   - UT student demographic

2. **Analysis Categories**:
   - Style appropriateness (1-5 stars)
   - Comfort for 2-3 hours of standing/dancing
   - Weather readiness
   - Artist aesthetic match
   - Practical considerations (bag, shoes, etc.)

3. **Tone**:
   - Encouraging and positive
   - Casual, student-friendly language
   - Constructive feedback
   - Austin's laid-back vibe

## SerpAPI Integration

### Outfit Ideas Search
- Queries Google Images for `{genre} concert outfit ideas {weather} 2024`
- Returns 6 visual references
- Extracts text guides from top results

### Artist Information
- Uses Google Knowledge Graph for genre/bio
- Searches concert aesthetic and crowd photos
- Provides typical outfit descriptions

## Weather Integration

Real-time Austin weather factors into recommendations:

- **Temperature**: Fabric weight, layers
- **Conditions**: Rain gear, material choices
- **Humidity**: Moisture-wicking fabrics
- **Wind**: Secure loose items

Indoor Moody Center considerations:
- Strong AC (bring layers)
- Crowd heat (breathable fabrics)
- Standing room (comfortable shoes)

## Security & Privacy

- ✅ UT email verification via Microsoft OAuth
- ✅ No outfit photos stored on server
- ✅ All image data processed via secure HTTPS
- ✅ API keys stored in environment variables
- ✅ Rate limiting on API endpoints

## Best Practices

### Photo Guidelines
- Good lighting
- Full-body shot preferred
- Clear view of outfit details
- Plain background helps AI focus

### Accuracy Tips
- Upload photo day-of or close to concert date
- Check weather forecast before submitting
- Consider your comfort level with recommendations

## Troubleshooting

### "Failed to analyze outfit"
- Check OpenAI API key is valid
- Ensure GPT-4 Vision is enabled on your account
- Verify image is under 20MB

### Weather not loading
- OpenWeather API key may need activation (up to 2 hours)
- Check API key is correct in `.env.local`

### No outfit ideas showing
- SerpAPI free tier: 100 searches/month
- Check if quota exceeded
- Verify API key

### CORS errors
- Ensure API routes are in `pages/api/` directory
- Check Next.js is running on correct port

## Future Enhancements

- [ ] Save favorite outfits to profile
- [ ] Share outfit ratings with friends
- [ ] Integration with concert buddy matching
- [ ] Virtual try-on with AI
- [ ] Outfit shopping links
- [ ] Historical outfit gallery by artist
- [ ] Community outfit voting

## Contributing

This is a student project for UT. Contributions welcome!

## License

MIT

## Support

For issues or questions, contact via UT email or submit feedback through the Moody Center website.

---

**Hook 'em! 🤘**
