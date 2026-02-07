// api/weather.js
import axios from 'axios';

// Austin, TX Coordinates
const AUSTIN_LAT = 30.2672;
const AUSTIN_LON = -97.7431;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch from Open-Meteo (No API Key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${AUSTIN_LAT}&longitude=${AUSTIN_LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
    
    const response = await axios.get(url);
    const current = response.data.current;

    // Map WMO Weather Codes to text
    const { condition, description, icon } = getWeatherDescription(current.weather_code);

    const weatherData = {
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.temperature_2m), // Open-Meteo basic doesn't calculate feels_like without more data, using temp is safe
      condition: condition,
      description: description,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      icon: icon,
      timestamp: new Date().toISOString()
    };

    // Add outfit recommendations
    weatherData.outfitTips = generateWeatherTips(weatherData);

    res.status(200).json(weatherData);

  } catch (error) {
    console.error('Weather API Error:', error);
    
    // Fallback if Open-Meteo is down
    res.status(200).json({
      temp: 75,
      condition: 'Clear',
      description: 'clear sky',
      humidity: 50,
      windSpeed: 5,
      outfitTips: ['Check weather before your concert', 'Austin weather can change quickly'],
      fallback: true
    });
  }
}

// Helper: Map WMO codes to readable text/icons
function getWeatherDescription(code) {
  // 0: Clear
  if (code === 0) return { condition: 'Clear', description: 'Clear sky', icon: '01d' };
  
  // 1-3: Cloudy
  if (code >= 1 && code <= 3) return { condition: 'Cloudy', description: 'Partly cloudy', icon: '03d' };
  
  // 45, 48: Fog
  if (code === 45 || code === 48) return { condition: 'Foggy', description: 'Foggy', icon: '50d' };
  
  // 51-67: Rain / Drizzle
  if (code >= 51 && code <= 67) return { condition: 'Rain', description: 'Light rain or drizzle', icon: '09d' };
  
  // 71-77: Snow
  if (code >= 71 && code <= 77) return { condition: 'Snow', description: 'Snowfall', icon: '13d' };
  
  // 80-82: Showers
  if (code >= 80 && code <= 82) return { condition: 'Rain', description: 'Rain showers', icon: '10d' };
  
  // 95-99: Thunderstorm
  if (code >= 95 && code <= 99) return { condition: 'Storm', description: 'Thunderstorm', icon: '11d' };

  return { condition: 'Clear', description: 'Clear sky', icon: '01d' };
}

function generateWeatherTips(weather) {
  const tips = [];

  // Temperature-based tips
  if (weather.temp > 85) {
    tips.push("It's hot! Wear breathable, light fabrics");
    tips.push("Moody Center has strong AC - bring a light layer");
    tips.push("Stay hydrated before the show");
  } else if (weather.temp > 70) {
    tips.push("Perfect Austin weather! Light layers work best");
    tips.push("Indoor venue will be cooler than outside");
  } else if (weather.temp > 50) {
    tips.push("Mild weather - bring a jacket or sweater");
    tips.push("Layer up for comfort indoors");
  } else {
    tips.push("Cool evening - dress warmly");
    tips.push("Consider a jacket or hoodie");
  }

  // Condition-based tips
  const cond = weather.condition.toLowerCase();
  if (cond.includes('rain') || cond.includes('storm')) {
    tips.push("Rain expected - water-resistant jacket recommended");
    tips.push("Avoid suede or canvas shoes");
  }

  if (weather.humidity > 70) {
    tips.push("High humidity - choose moisture-wicking fabrics");
  }

  if (weather.windSpeed > 15) {
    tips.push("Windy conditions - secure loose items");
  }

  return tips;
}