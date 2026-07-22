import { CityResult, FullWeatherData, TemperatureUnit, SpeedUnit } from '../types/weather';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Search cities using Open-Meteo Geocoding API
 */
export async function searchCities(query: string): Promise<CityResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.results) {
      return [];
    }

    return data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      elevation: item.elevation,
      feature_code: item.feature_code,
      country_code: item.country_code,
      country: item.country,
      admin1: item.admin1,
      timezone: item.timezone,
      population: item.population,
    }));
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
}

/**
 * Fetch detailed forecast data using Open-Meteo Forecast API
 */
export async function getWeatherData(
  latitude: number,
  longitude: number,
  tempUnit: TemperatureUnit = 'celsius',
  speedUnit: SpeedUnit = 'kmh'
): Promise<FullWeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current_weather: 'true',
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'pressure_msl',
      'cloud_cover',
      'visibility',
      'wind_speed_10m',
      'uv_index',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant',
    ].join(','),
    timezone: 'auto',
    temperature_unit: tempUnit,
    wind_speed_unit: speedUnit,
  });

  const response = await fetch(`${FORECAST_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Open-Meteo Weather request failed (${response.status})`);
  }

  const raw = await response.json();

  // Parse current weather
  const c = raw.current || {};
  const cw = raw.current_weather || {};
  const h0 = raw.hourly;

  const tempVal = c.temperature_2m ?? c.temperature ?? cw.temperature ?? h0?.temperature_2m?.[0] ?? 0;
  const apparentVal = c.apparent_temperature ?? h0?.apparent_temperature?.[0] ?? tempVal;
  const weatherCodeVal = c.weather_code ?? c.weathercode ?? cw.weathercode ?? h0?.weather_code?.[0] ?? 0;
  const windSpeedVal = c.wind_speed_10m ?? c.windspeed ?? cw.windspeed ?? h0?.wind_speed_10m?.[0] ?? 0;
  const windDirVal = c.wind_direction_10m ?? c.winddirection ?? cw.winddirection ?? 0;
  const isDayVal = c.is_day === 1 || cw.is_day === 1;

  const current = {
    time: c.time || cw.time || new Date().toISOString(),
    temperature: tempVal,
    apparentTemperature: apparentVal,
    isDay: isDayVal,
    precipitation: c.precipitation ?? h0?.precipitation?.[0] ?? 0,
    rain: c.rain ?? 0,
    showers: c.showers ?? 0,
    snowfall: c.snowfall ?? 0,
    weatherCode: weatherCodeVal,
    cloudCover: c.cloud_cover ?? h0?.cloud_cover?.[0] ?? 0,
    pressure: c.pressure_msl ?? h0?.pressure_msl?.[0] ?? 1013,
    humidity: c.relative_humidity_2m ?? h0?.relative_humidity_2m?.[0] ?? 50,
    windSpeed: windSpeedVal,
    windDirection: windDirVal,
    windGusts: c.wind_gusts_10m ?? windSpeedVal,
  };

  // Parse hourly weather
  const h = raw.hourly || {};
  const hourly = {
    times: h.time || [],
    temperatures: h.temperature_2m || [],
    apparentTemperatures: h.apparent_temperature || [],
    precipitationProbabilities: h.precipitation_probability || [],
    precipitations: h.precipitation || [],
    weatherCodes: h.weather_code || [],
    humidities: h.relative_humidity_2m || [],
    windSpeeds: h.wind_speed_10m || [],
    uvIndices: h.uv_index || [],
    pressures: h.pressure_msl || [],
  };

  // Parse daily forecast days
  const d = raw.daily || {};
  const dailyDates: string[] = d.time || [];
  const dailyDays = dailyDates.map((date: string, index: number) => ({
    date,
    weatherCode: d.weather_code?.[index] ?? 0,
    tempMax: d.temperature_2m_max?.[index] ?? 0,
    tempMin: d.temperature_2m_min?.[index] ?? 0,
    apparentTempMax: d.apparent_temperature_max?.[index] ?? 0,
    apparentTempMin: d.apparent_temperature_min?.[index] ?? 0,
    sunrise: d.sunrise?.[index] || '',
    sunset: d.sunset?.[index] || '',
    uvIndexMax: d.uv_index_max?.[index] ?? 0,
    precipitationSum: d.precipitation_sum?.[index] ?? 0,
    precipitationProbabilityMax: d.precipitation_probability_max?.[index] ?? 0,
    windSpeedMax: d.wind_speed_10m_max?.[index] ?? 0,
    windDirectionDominant: d.wind_direction_10m_dominant?.[index] ?? 0,
  }));

  return {
    latitude: raw.latitude,
    longitude: raw.longitude,
    elevation: raw.elevation ?? 0,
    timezone: raw.timezone || 'UTC',
    timezoneAbbreviation: raw.timezone_abbreviation || 'UTC',
    current,
    hourly,
    daily: dailyDays,
    units: {
      temperature: tempUnit,
      speed: speedUnit,
    },
  };
}

/**
 * Reverse geocoding helper using BigDataCloud free API or Open-Meteo fallback
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<CityResult> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const cityName = data.city || data.locality || data.principalSubdivision || 'Current Location';
      return {
        id: Math.floor(Math.random() * 100000),
        name: cityName,
        latitude,
        longitude,
        country: data.countryName || '',
        country_code: data.countryCode || '',
        admin1: data.principalSubdivision || '',
      };
    }
  } catch (err) {
    console.warn('Reverse geocoding failed, falling back:', err);
  }

  // Fallback
  return {
    id: 99999,
    name: 'Current Location',
    latitude,
    longitude,
  };
}
