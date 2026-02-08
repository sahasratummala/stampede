import { NextResponse } from 'next/server';
import axios from 'axios';

const AUSTIN_LAT = 30.2672;
const AUSTIN_LON = -97.7431;

export async function GET() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${AUSTIN_LAT}&longitude=${AUSTIN_LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
    
    const response = await axios.get(url);
    const current = response.data.current;

    const { condition, description, icon } = getWeatherDescription(current.weather_code);

    const weatherData: any = {
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.temperature_2m), 
      condition: condition,
      description: description,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      icon: icon,
      timestamp: new Date().toISOString()
    };

    weatherData.outfitTips = generateWeatherTips(weatherData);

    return NextResponse.json(weatherData);

  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json({
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

// Fixed Helper: This was cut off in your last message
function getWeatherDescription(code: number) {
  if (code === 0) return { condition: 'Clear', description: 'Clear sky', icon: '01d' };
  if (code >= 1 && code <= 3) return { condition: 'Cloudy', description: 'Partly cloudy', icon: '03d' };
  if (code >= 51 && code <= 67) return { condition: 'Rain', description: 'Rainy', icon: '09d' };
  if (code >= 95 && code <= 99) return { condition: 'Storm', description: 'Thunderstorm', icon: '11d' };
  return { condition: 'Clear', description: 'Clear sky', icon: '01d' };
}

function generateWeatherTips(weather: any) {
  const tips = [];
  if (weather.temp > 85) tips.push("Stay cool! Lightweight fabrics only.");
  else if (weather.temp > 70) tips.push("Perfect weather! A light layer is fine.");
  else tips.push("It's a bit chilly—bring a jacket for the walk to the venue.");
  return tips;
}