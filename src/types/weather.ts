export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type SpeedUnit = 'kmh' | 'mph';

export interface CityResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  admin1?: string;
  timezone?: string;
  population?: number;
}

export interface WMOWeatherInfo {
  code: number;
  label: string;
  description: string;
  iconName: string;
  category: 'clear' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';
  bgGradient: string;
  accentColor: string;
}

export interface CurrentWeatherData {
  time: string;
  temperature: number;
  apparentTemperature: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weatherCode: number;
  cloudCover: number;
  pressure: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
}

export interface HourlyWeatherData {
  times: string[];
  temperatures: number[];
  apparentTemperatures: number[];
  precipitationProbabilities: number[];
  precipitations: number[];
  weatherCodes: number[];
  humidities: number[];
  windSpeeds: number[];
  uvIndices: number[];
  pressures: number[];
}

export interface DailyForecastDay {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windDirectionDominant: number;
}

export interface FullWeatherData {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  timezoneAbbreviation: string;
  current: CurrentWeatherData;
  hourly: HourlyWeatherData;
  daily: DailyForecastDay[];
  units: {
    temperature: TemperatureUnit;
    speed: SpeedUnit;
  };
}

export interface ActivityRating {
  name: string;
  score: number; // 0 - 100
  status: 'Ideal' | 'Good' | 'Moderate' | 'Poor' | 'Unfavorable';
  icon: string;
  reason: string;
}

export interface PackingItem {
  item: string;
  category: 'Clothing' | 'Gear' | 'Protection' | 'Footwear';
  icon: string;
  note: string;
  essential: boolean;
}

export interface TravelIntelligence {
  overallScore: number; // 0 - 10
  verdict: string;
  summary: string;
  bestTimeWindow: string;
  activities: ActivityRating[];
  packingList: PackingItem[];
  advisories: {
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
  }[];
}
