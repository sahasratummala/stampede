# Architecture & Implementation Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Next.js)                 │
│                                                               │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │  Event Detail   │  │ Outfit Recomm.   │  │  User Auth  │ │
│  │     Page        │──│   Component      │  │  (UT Email) │ │
│  └─────────────────┘  └──────────────────┘  └─────────────┘ │
│           │                    │                    │         │
└───────────┼────────────────────┼────────────────────┼─────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌───────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API Routes)             │
│                                                                │
│  ┌─────────────┐  ┌──────────┐  ┌─────────┐  ┌────────────┐ │
│  │  Analyze    │  │  Outfit  │  │ Weather │  │   Artist   │ │
│  │  Outfit     │  │  Ideas   │  │  Data   │  │    Info    │ │
│  └─────────────┘  └──────────┘  └─────────┘  └────────────┘ │
│         │              │             │              │         │
└─────────┼──────────────┼─────────────┼──────────────┼─────────┘
          │              │             │              │
          ▼              ▼             ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External APIs                             │
│                                                               │
│  ┌──────────────┐  ┌──────────┐  ┌────────────┐             │
│  │   OpenAI     │  │ SerpAPI  │  │ OpenWeather│             │
│  │   Vision     │  │          │  │    API     │             │
│  │  (GPT-4o)    │  │          │  │            │             │
│  └──────────────┘  └──────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Upload Flow

```
User uploads photo
      ↓
Frontend converts to base64
      ↓
Fetch weather (Austin)
      ↓
Fetch outfit ideas (SerpAPI)
      ↓
Send all data to /api/analyze-outfit
      ↓
OpenAI Vision analyzes image
      ↓
Response formatted as JSON
      ↓
Display results to user
```

### 2. Artist Information Flow

```
User views event page
      ↓
Fetch event details
      ↓
Send artist name to /api/artist-info
      ↓
SerpAPI searches for:
  - Artist genre
  - Concert style
  - Typical outfits
  - Concert images
      ↓
Return structured data
      ↓
Display on event page
```

## Component Architecture

### OutfitRecommender Component

**Props:**
- `event`: Object containing event details
- `artistInfo`: Object with artist genre, style info

**State:**
- `uploadedImage`: Base64 string of uploaded photo
- `analysis`: AI analysis results
- `loading`: Boolean for loading state
- `weather`: Current Austin weather

**Key Functions:**
- `fetchWeather()`: Get Austin weather from OpenWeather API
- `fetchOutfitIdeas()`: Get general outfit inspiration via SerpAPI
- `analyzeOutfit()`: Send image to OpenAI Vision for analysis
- `handleImageUpload()`: Process file upload and trigger analysis

## API Endpoint Details

### POST /api/analyze-outfit

**Purpose**: Analyze outfit photo using OpenAI Vision

**Input Schema**:
```typescript
{
  image: string;           // base64 encoded image
  artist: string;          // Artist name
  genre: string;           // Music genre
  venue: string;           // Venue name
  weather: {
    temp: number;
    condition: string;
  };
  outfitInspo?: object;    // Optional SerpAPI results
}
```

**Output Schema**:
```typescript
{
  rating: number;          // 1-5 stars
  overallFeedback: string;
  whatWorks: string[];
  suggestions: string[];
  weatherTips: string;
  artistTips: string;
  generalIdeas: Array<{
    title: string;
    description: string;
  }>;
}
```

**Error Handling**:
- Returns 500 if OpenAI API fails
- Returns structured error message
- Frontend shows user-friendly error

### POST /api/outfit-ideas

**Purpose**: Fetch outfit inspiration from web

**How it works**:
1. Constructs search query from genre + weather
2. Uses SerpAPI Google Images search
3. Uses SerpAPI Google search for text guides
4. Returns combined results

**Rate Limits**:
- SerpAPI free tier: 100 searches/month
- Cache results where possible

### GET /api/weather

**Purpose**: Get current Austin weather

**Data Source**: OpenWeather API
**Location**: Austin, TX (30.2672, -97.7431)
**Update Frequency**: Real-time on each request

**Returns**:
- Temperature (°F)
- Condition (Clear, Rain, etc.)
- Humidity
- Wind speed
- Outfit tips based on conditions

### POST /api/artist-info

**Purpose**: Get artist details and concert aesthetic

**SerpAPI Queries**:
1. Google Knowledge Graph (genre, bio)
2. Google Search (concert style articles)
3. Google Images (concert crowd photos)

**Output**: Structured artist profile with styling recommendations

## OpenAI Vision Integration

### Prompt Structure

The prompt is carefully engineered to provide context-aware analysis:

```
CONTEXT:
- Artist and genre
- Weather conditions
- Venue details (indoor, AC, capacity)

ANALYSIS AREAS:
1. Overall rating (1-5 stars)
2. What works well
3. Suggested improvements
4. Weather considerations
5. Artist-specific styling

TONE:
- Encouraging and positive
- Casual, student-friendly
- Constructive feedback
```

### Image Processing

- Accepts: JPEG, PNG, WebP
- Max size: 20MB
- Sent as base64 in API request
- Processed with "high" detail setting

### Token Management

- Max tokens: 1000 per request
- Estimated cost: ~$0.01-0.03 per analysis
- Response typically 300-500 tokens

## SerpAPI Integration Strategy

### Search Query Optimization

**For Outfit Ideas**:
```javascript
`${genre} concert outfit ideas ${weatherContext} 2024`
```

**For Artist Info**:
```javascript
`${artistName} concert style aesthetic fashion`
`${artistName} artist music genre`
```

### Result Processing

1. **Images**: Take top 6 results
2. **Text**: Extract snippets from top 3-5 results
3. **Deduplication**: Remove duplicate recommendations
4. **Formatting**: Structure for easy frontend consumption

### Caching Strategy

To conserve API calls:
- Cache artist info for 24 hours
- Cache outfit ideas by genre+weather combo
- Implement Redis or in-memory cache

## Weather Integration Logic

### Outfit Recommendations by Temperature

- **> 85°F**: Light, breathable fabrics + AC layer
- **70-85°F**: Comfortable, standard concert wear
- **60-70°F**: Light layers, jacket recommended
- **< 60°F**: Warm layers, consider hoodie/sweater

### Condition-Based Tips

- **Rain**: Water-resistant jacket, avoid suede
- **High humidity**: Moisture-wicking fabrics
- **Wind**: Secure loose items, avoid hats

## Security Considerations

### API Key Protection

```javascript
// ✅ DO: Use environment variables
const apiKey = process.env.OPENAI_API_KEY;

// ❌ DON'T: Hardcode keys
const apiKey = "sk-...";
```

### Rate Limiting

Implement rate limiting on API routes:
```javascript
// Example using next-rate-limit
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export default async function handler(req, res) {
  try {
    await limiter.check(res, 10, 'CACHE_TOKEN');
    // ... rest of handler
  } catch {
    res.status(429).json({ error: 'Rate limit exceeded' });
  }
}
```

### Image Validation

```javascript
// Validate image before processing
const validateImage = (base64) => {
  // Check size
  const sizeInMB = (base64.length * 3) / 4 / 1024 / 1024;
  if (sizeInMB > 20) {
    throw new Error('Image too large');
  }
  
  // Check format
  if (!base64.startsWith('data:image/')) {
    throw new Error('Invalid image format');
  }
  
  return true;
};
```

## Performance Optimization

### Frontend

1. **Image Compression**: Compress before upload
2. **Lazy Loading**: Load OutfitRecommender on demand
3. **Debouncing**: Debounce rapid API calls
4. **Caching**: Cache weather and artist data

### Backend

1. **Response Compression**: Enable gzip
2. **Parallel Requests**: Fetch weather + outfit ideas simultaneously
3. **Connection Pooling**: Reuse HTTP connections
4. **Error Recovery**: Graceful degradation if APIs fail

### Example: Parallel Data Fetching

```javascript
const analyzeOutfit = async (imageData) => {
  // Fetch all data in parallel
  const [weather, outfitIdeas] = await Promise.all([
    fetchWeather(),
    fetchOutfitIdeas(genre, vibe)
  ]);
  
  // Then analyze with all context
  const analysis = await callOpenAI(imageData, { weather, outfitIdeas });
  return analysis;
};
```

## Testing Strategy

### Unit Tests
- API route handlers
- Helper functions (generateRecommendations, etc.)
- Image validation logic

### Integration Tests
- Full outfit analysis flow
- SerpAPI data fetching
- Weather API integration

### E2E Tests
- User uploads photo
- Photo analysis completes
- Results display correctly

### Mock Data for Testing
Use `test-data.js` for:
- Developing without API credits
- Testing UI states
- Demo presentations

## Deployment Checklist

### Environment Setup
- [ ] Set all API keys in production environment
- [ ] Configure CORS for production domain
- [ ] Set up rate limiting
- [ ] Enable error monitoring (Sentry, etc.)

### Performance
- [ ] Enable image optimization
- [ ] Configure CDN for static assets
- [ ] Set up caching headers
- [ ] Optimize bundle size

### Security
- [ ] Enable HTTPS
- [ ] Set security headers
- [ ] Implement CSP
- [ ] Add input sanitization

### Monitoring
- [ ] Set up logging
- [ ] Track API usage
- [ ] Monitor error rates
- [ ] Set up alerts for API failures

## Cost Estimation

### OpenAI Vision
- ~$0.01-0.03 per outfit analysis
- Estimated: 1000 analyses/month = $10-30/month

### SerpAPI
- Free tier: 100 searches/month
- Paid tier: $50/month for 5000 searches

### OpenWeather
- Free tier: 1000 calls/day
- Should be sufficient for this use case

### Total Estimated Cost
- Development: ~$0-10/month (using free tiers)
- Production (1000 users): ~$50-100/month

## Future Enhancements

### Phase 2 Features
- User profiles (save outfit history)
- Outfit voting/ratings from community
- Virtual try-on (AR integration)
- Shopping links for outfit pieces
- Integration with concert buddy matching

### Technical Improvements
- WebP image format support
- Progressive image loading
- Outfit comparison (side-by-side)
- Save favorite recommendations
- Share results on social media

### Advanced AI Features
- Multi-outfit comparison
- Style transfer (apply artist aesthetic to your outfit)
- Seasonal trend analysis
- Personalized style profile

## Troubleshooting Guide

### Common Issues

**"Failed to analyze outfit"**
- Check OpenAI API key validity
- Verify GPT-4 Vision access
- Check image size < 20MB

**Weather not loading**
- OpenWeather key may need activation (2 hours)
- Verify API key in `.env.local`
- Check rate limits

**No outfit ideas**
- SerpAPI quota may be exceeded
- Check API key
- Try with mock data

**CORS errors**
- Ensure API routes in `pages/api/`
- Check Next.js config
- Verify domain settings

### Debug Mode

Add debug logging:
```javascript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Analysis request:', { artist, genre, weather });
}
```

## Support & Maintenance

### Regular Tasks
- Monitor API usage monthly
- Review and optimize costs
- Update outfit trend data
- Refresh artist database

### User Feedback
- Track most requested features
- Monitor analysis accuracy
- Collect outfit rating data
- Iterate on prompt engineering

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Maintainer**: UT Student Dev Team
