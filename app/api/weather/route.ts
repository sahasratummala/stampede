import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const AUSTIN_LAT = 30.2672;
const AUSTIN_LON = -97.7431;

export async function GET(request: NextRequest) {
  try {
    // Get date parameter from query string
    const searchParams = request.nextUrl.searchParams;
    const eventDate = searchParams.get('date');

    // If no date provided, use today
    const targetDate = eventDate || new Date().toISOString().split('T')[0];

    // Parse dates
    const dateObj = new Date(targetDate + 'T12:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate days difference
    const daysFromNow = Math.floor((dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let weatherData: any;

    // TODAY or PAST - use current weather
    if (daysFromNow <= 0) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${AUSTIN_LAT}&longitude=${AUSTIN_LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;

      const response = await axios.get(url);
      const current = response.data.current;

      const { condition, description, icon } = getWeatherDescription(current.weather_code);

      weatherData = {
        temp: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.temperature_2m),
        condition: condition,
        description: description,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        icon: icon,
        date: targetDate,
        isForecast: false
      };
    }
    // FUTURE (1-16 days) - use forecast
    else if (daysFromNow > 0 && daysFromNow <= 16) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${AUSTIN_LAT}&longitude=${AUSTIN_LON}&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=16`;

      const response = await axios.get(url);
      const daily = response.data.daily;

      // Find the index for our target date
      const dateIndex = daily.time.findIndex((d: string) => d === targetDate);

      if (dateIndex !== -1) {
        const { condition, description, icon } = getWeatherDescription(daily.weather_code[dateIndex]);

        // Average of high and low for the day
        const avgTemp = (daily.temperature_2m_max[dateIndex] + daily.temperature_2m_min[dateIndex]) / 2;

        weatherData = {
          temp: Math.round(avgTemp),
          feelsLike: Math.round(avgTemp),
          condition: condition,
          description: description,
          humidity: Math.round(daily.relative_humidity_2m_mean[dateIndex]),
          windSpeed: Math.round(daily.wind_speed_10m_max[dateIndex]),
          icon: icon,
          date: targetDate,
          isForecast: true,
          highTemp: Math.round(daily.temperature_2m_max[dateIndex]),
          lowTemp: Math.round(daily.temperature_2m_min[dateIndex])
        };
      } else {
        // Fallback if date not found in forecast
        throw new Error('Date not found in forecast range');
      }
    }
    // FAR FUTURE (beyond 16 days) - use seasonal averages
    else {
      weatherData = getSeasonalAverage(dateObj);
      weatherData.date = targetDate;
      weatherData.isForecast = false;
      weatherData.note = 'Based on historical averages';
    }

    // Add outfit tips
    weatherData.outfitTips = generateWeatherTips(weatherData);
    weatherData.timestamp = new Date().toISOString();

    return NextResponse.json(weatherData);

  } catch (error) {
    console.error('Weather API Error:', error);

    // Fallback to seasonal average if API fails
    const eventDate = request.nextUrl.searchParams.get('date');
    const dateObj = eventDate ? new Date(eventDate + 'T12:00:00') : new Date();
    const fallbackData = getSeasonalAverage(dateObj);

    return NextResponse.json({
      ...fallbackData,
      date: eventDate || new Date().toISOString().split('T')[0],
      outfitTips: generateWeatherTips(fallbackData),
      fallback: true,
      note: 'Using seasonal averages (API unavailable)'
    });
  }
}

function getWeatherDescription(code: number) {
  if (code === 0) return { condition: 'Clear', description: 'Clear sky', icon: '01d' };
  if (code >= 1 && code <= 3) return { condition: 'Cloudy', description: 'Partly cloudy', icon: '03d' };
  if (code >= 45 && code <= 48) return { condition: 'Foggy', description: 'Foggy', icon: '50d' };
  if (code >= 51 && code <= 67) return { condition: 'Rain', description: 'Rainy', icon: '09d' };
  if (code >= 71 && code <= 77) return { condition: 'Snow', description: 'Snowy', icon: '13d' };
  if (code >= 80 && code <= 82) return { condition: 'Rain', description: 'Rain showers', icon: '09d' };
  if (code >= 95 && code <= 99) return { condition: 'Storm', description: 'Thunderstorm', icon: '11d' };
  return { condition: 'Clear', description: 'Clear sky', icon: '01d' };
}

function getSeasonalAverage(date: Date) {
  const month = date.getMonth(); // 0-11

  // Austin, TX seasonal averages
  const seasonalData: Record<number, any> = {
    // Winter (Dec, Jan, Feb)
    0: { temp: 50, condition: 'Partly Cloudy', description: 'Cool', humidity: 65, windSpeed: 8, icon: '03d' },
    1: { temp: 54, condition: 'Partly Cloudy', description: 'Cool', humidity: 65, windSpeed: 9, icon: '03d' },
    11: { temp: 51, condition: 'Partly Cloudy', description: 'Cool', humidity: 70, windSpeed: 9, icon: '03d' },
    // Spring (Mar, Apr, May)
    2: { temp: 64, condition: 'Sunny', description: 'Mild and pleasant', humidity: 60, windSpeed: 10, icon: '01d' },
    3: { temp: 72, condition: 'Sunny', description: 'Pleasant', humidity: 60, windSpeed: 10, icon: '01d' },
    4: { temp: 80, condition: 'Sunny', description: 'Warm', humidity: 65, windSpeed: 9, icon: '01d' },
    // Summer (Jun, Jul, Aug)
    5: { temp: 89, condition: 'Sunny', description: 'Hot', humidity: 60, windSpeed: 8, icon: '01d' },
    6: { temp: 95, condition: 'Sunny', description: 'Very hot', humidity: 55, windSpeed: 7, icon: '01d' },
    7: { temp: 97, condition: 'Sunny', description: 'Very hot', humidity: 50, windSpeed: 7, icon: '01d' },
    // Fall (Sep, Oct, Nov)
    8: { temp: 89, condition: 'Sunny', description: 'Hot', humidity: 60, windSpeed: 8, icon: '01d' },
    9: { temp: 78, condition: 'Sunny', description: 'Pleasant', humidity: 65, windSpeed: 9, icon: '01d' },
    10: { temp: 64, condition: 'Partly Cloudy', description: 'Mild', humidity: 65, windSpeed: 9, icon: '03d' },
  };

  return {
    ...seasonalData[month],
    feelsLike: seasonalData[month].temp,
    isForecast: false
  };
}

function generateWeatherTips(weather: any) {
  const tips = [];

  // Temperature-based tips
  if (weather.temp > 95) {
    tips.push("Extreme heat! Wear breathable, light-colored fabrics.");
    tips.push("Stay hydrated and consider a hat for sun protection.");
  } else if (weather.temp > 85) {
    tips.push("Stay cool! Lightweight fabrics only.");
    tips.push("Shorts and tank tops are perfect for this weather.");
  } else if (weather.temp > 70) {
    tips.push("Perfect weather! A light layer is fine.");
    tips.push("Comfortable temps - wear what feels good!");
  } else if (weather.temp > 55) {
    tips.push("It's a bit chilly—bring a jacket for the walk to the venue.");
    tips.push("Jeans and a long-sleeve shirt should be comfortable.");
  } else {
    tips.push("Bundle up! It's cold out there.");
    tips.push("Jacket or coat recommended, maybe layers too.");
  }

  // Condition-based tips
  if (weather.condition === 'Rain' || weather.description.includes('rain')) {
    tips.push("Rain expected! Bring a jacket or umbrella.");
  } else if (weather.condition === 'Storm') {
    tips.push("Thunderstorms possible—plan for wet weather.");
  }

  // Wind-based tips
  if (weather.windSpeed > 20) {
    tips.push("It'll be windy—secure loose items and maybe skip the hat!");
  }

  return tips.slice(0, 3); // Max 3 tips
}