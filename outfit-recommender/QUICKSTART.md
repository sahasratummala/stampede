# Quick Start Guide - Outfit Recommender

Get the Moody Center Outfit Recommender running in 15 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Text editor (VS Code recommended)

## Step 1: Get Your API Keys (10 minutes)

### OpenAI API Key ⚡ REQUIRED
1. Visit https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Create new secret key
5. **Important**: Add payment method (GPT-4 Vision requires credits)
6. Copy your key starting with `sk-...`

### SerpAPI Key 🔍 REQUIRED
1. Visit https://serpapi.com/
2. Sign up for free account
3. Free tier: 100 searches/month (enough for testing)
4. Copy API key from dashboard

### OpenWeather API Key ☀️ REQUIRED
1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Get API key (may take 1-2 hours to activate)
4. Copy your key

### Microsoft Azure (Optional for UT Auth)
1. Visit Azure Portal
2. Register app for OAuth
3. Get Client ID and Secret
4. We'll skip this for initial testing

## Step 2: Installation (2 minutes)

```bash
# Create project directory
mkdir moody-outfit-recommender
cd moody-outfit-recommender

# Copy all the provided files into this directory
# - outfit-recommender.jsx
# - api-analyze-outfit.js
# - api-outfit-ideas.js
# - api-weather.js
# - api-artist-info.js
# - package.json
# - etc.

# Install dependencies
npm install

# Or if you prefer yarn
yarn install
```

## Step 3: Configure Environment (1 minute)

```bash
# Copy the environment template
cp .env.template .env.local

# Edit .env.local with your API keys
nano .env.local  # or use any text editor
```

Your `.env.local` should look like:
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
SERPAPI_KEY=your_serpapi_key_here
OPENWEATHER_API_KEY=your_openweather_key_here
```

## Step 4: Set Up Project Structure

Create this folder structure:
```
moody-outfit-recommender/
├── components/
│   └── outfit-recommender.jsx
├── pages/
│   ├── api/
│   │   ├── analyze-outfit.js
│   │   ├── outfit-ideas.js
│   │   ├── weather.js
│   │   └── artist-info.js
│   └── events/
│       └── [eventId].jsx
├── public/
│   └── images/
├── .env.local
├── .env.template
├── package.json
├── README.md
└── test-data.js
```

Move files to correct locations:
```bash
mkdir -p components pages/api pages/events public/images
mv outfit-recommender.jsx components/
mv api-*.js pages/api/
mv example-event-page.jsx pages/events/[eventId].jsx
```

## Step 5: Test API Keys (1 minute)

Create a test script `test-apis.js`:

```javascript
// test-apis.js
require('dotenv').config({ path: '.env.local' });

async function testAPIs() {
  console.log('Testing API keys...\n');
  
  // Test OpenAI
  if (process.env.OPENAI_API_KEY) {
    console.log('✓ OpenAI key found');
  } else {
    console.log('✗ OpenAI key missing');
  }
  
  // Test SerpAPI
  if (process.env.SERPAPI_KEY) {
    console.log('✓ SerpAPI key found');
  } else {
    console.log('✗ SerpAPI key missing');
  }
  
  // Test OpenWeather
  if (process.env.OPENWEATHER_API_KEY) {
    console.log('✓ OpenWeather key found');
  } else {
    console.log('✗ OpenWeather key missing');
  }
}

testAPIs();
```

Run it:
```bash
node test-apis.js
```

## Step 6: Run Development Server (1 minute)

```bash
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Step 7: Test the Application

### Test 1: Basic Page Load
1. Open browser to http://localhost:3000/events/1
2. Should see event page (may show "Event not found" - that's OK)

### Test 2: Weather API
1. Open http://localhost:3000/api/weather
2. Should see JSON with Austin weather data:
```json
{
  "temp": 75,
  "condition": "Clear",
  "description": "clear sky",
  ...
}
```

### Test 3: Outfit Recommender Component
1. Create a simple test page: `pages/test-outfit.jsx`

```javascript
import OutfitRecommender from '../components/outfit-recommender';

export default function TestOutfit() {
  const testEvent = {
    artist: "Taylor Swift",
    genre: "pop",
    venue: "Moody Center"
  };
  
  const testArtistInfo = {
    name: "Taylor Swift",
    genre: "pop"
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <OutfitRecommender 
        event={testEvent}
        artistInfo={testArtistInfo}
      />
    </div>
  );
}
```

2. Visit http://localhost:3000/test-outfit
3. Try uploading a photo of an outfit
4. Should get AI analysis back in ~5-10 seconds

## Common Issues & Solutions

### Issue: "Module not found: Can't resolve 'openai'"
**Solution**: Run `npm install openai`

### Issue: OpenAI API returns 401 Unauthorized
**Solution**: 
- Verify your API key is correct
- Check you have credits in your OpenAI account
- Make sure key starts with `sk-`

### Issue: Weather API returns empty or error
**Solution**:
- OpenWeather keys take 1-2 hours to activate
- Try again after waiting
- Check key is in `.env.local`

### Issue: No outfit ideas returned
**Solution**:
- Check SerpAPI quota (100 free/month)
- Verify API key
- Use test data temporarily: import from `test-data.js`

### Issue: Image upload doesn't trigger analysis
**Solution**:
- Check browser console for errors
- Verify image is < 20MB
- Check OpenAI API key is set
- Try a smaller/different image

## Using Test Data (No API Calls)

While testing the UI without using API credits:

```javascript
// In outfit-recommender.jsx, replace API calls with:
import { mockAnalyzeOutfit, mockFetchWeather } from '../test-data';

// Replace:
const response = await fetch('/api/analyze-outfit', ...);

// With:
const result = await mockAnalyzeOutfit(imageData, event, weather);
```

## Next Steps

### 1. Add Tailwind CSS (if not styled correctly)
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to `styles/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2. Set Up Event Data
- Create `pages/api/events/[eventId].js` to serve event data
- Or integrate with SerpAPI to pull real Moody Center events
- Use test data from `test-data.js` for now

### 3. Add UT Email Authentication
- Set up Microsoft Azure OAuth
- Implement NextAuth.js
- Restrict access to @utexas.edu emails

### 4. Deploy to Production
- Vercel (recommended for Next.js)
- Netlify
- AWS/Digital Ocean

## Production Deployment Quick Commands

### Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel

# Add environment variables in Vercel dashboard
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy

# Set environment variables in Netlify dashboard
```

## Monitoring & Maintenance

### Check API Usage
- OpenAI: https://platform.openai.com/usage
- SerpAPI: Check dashboard
- OpenWeather: Check dashboard

### Set Spending Limits
- OpenAI: Set monthly budget limit
- Consider adding usage alerts

### Track Costs
- Log each API call
- Monitor monthly spending
- Optimize expensive operations

## Support

If you get stuck:

1. **Check logs**: Browser console + terminal output
2. **Verify API keys**: Run `test-apis.js`
3. **Read error messages**: They usually tell you what's wrong
4. **Use test data**: Develop UI without API calls
5. **Check documentation**:
   - OpenAI: https://platform.openai.com/docs
   - SerpAPI: https://serpapi.com/docs
   - Next.js: https://nextjs.org/docs

## Success Checklist

- [ ] All API keys obtained and working
- [ ] Dependencies installed
- [ ] Development server running
- [ ] Weather API returns Austin data
- [ ] Can upload outfit photo
- [ ] Photo analysis returns results
- [ ] Results display nicely
- [ ] Ready to integrate into main Moody Center site!

**Estimated setup time**: 15 minutes  
**Estimated first analysis**: 5-10 seconds  
**Cost per analysis**: ~$0.01-0.03

---

🤘 **Hook 'em Horns! You're ready to analyze some concert fits!** 🤘
