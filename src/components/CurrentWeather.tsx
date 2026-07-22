import React from 'react';
import {
  Wind,
  Droplets,
  Sun,
  Eye,
  Compass,
  Gauge,
  CloudRain,
  Thermometer,
  Cloud,
  Sunset,
  Sunrise,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { FullWeatherData, CityResult } from '../types/weather';
import { getWMOInfo } from '../utils/wmoCodes';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherProps {
  weather: FullWeatherData;
  city: CityResult;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onToggleTempUnit: () => void;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  weather,
  city,
  isFavorite,
  onToggleFavorite,
  onToggleTempUnit,
}) => {
  const current = weather.current;
  const today = weather.daily[0];
  const wmo = getWMOInfo(current.weatherCode);

  const isFahrenheit = weather.units.temperature === 'fahrenheit';
  const tempSymbol = isFahrenheit ? '°F' : '°C';
  const speedUnit = weather.units.speed;

  // Format local date
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Calculate wind direction compass
  const getWindDirectionLabel = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(deg / 45) % 8;
    return directions[idx];
  };

  // Calculate UV Status
  const uvIndex = today?.uvIndexMax ?? 0;
  const getUVCategory = (uv: number) => {
    if (uv <= 2) return { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (uv <= 5) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    if (uv <= 7) return { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    if (uv <= 10) return { label: 'Very High', color: 'text-rose-400', bg: 'bg-rose-500/20' };
    return { label: 'Extreme', color: 'text-purple-400', bg: 'bg-purple-500/20' };
  };

  const uvStatus = getUVCategory(uvIndex);

  // Format Sunrise & Sunset
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--:--';
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return timeStr.slice(11, 16);
    }
  };

  // Sun Arc Progress calculation
  let sunProgressPercent = 50;
  if (today?.sunrise && today?.sunset) {
    const sunriseMs = new Date(today.sunrise).getTime();
    const sunsetMs = new Date(today.sunset).getTime();
    const nowMs = now.getTime();
    if (nowMs < sunriseMs) {
      sunProgressPercent = 0;
    } else if (nowMs > sunsetMs) {
      sunProgressPercent = 100;
    } else {
      sunProgressPercent = Math.round(((nowMs - sunriseMs) / (sunsetMs - sunriseMs)) * 100);
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br ${wmo.bgGradient} bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all`}>
      {/* Background Subtle Accent Orb */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
              {city.name}
            </h1>
            {city.country && (
              <span className="px-2.5 py-0.5 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs font-medium text-slate-300">
                {city.country}
              </span>
            )}
            <button
              id="favorite-toggle-button"
              onClick={onToggleFavorite}
              className={`p-1.5 rounded-full border transition ${
                isFavorite
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              {isFavorite ? <BookmarkCheck className="w-4 h-4 fill-amber-400" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {dateStr} • {weather.timezoneAbbreviation}
          </p>
        </div>

        {/* Temperature Unit Toggle Button */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 p-1 rounded-2xl">
          <button
            id="unit-celsius-btn"
            onClick={() => isFahrenheit && onToggleTempUnit()}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
              !isFahrenheit ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            °C
          </button>
          <button
            id="unit-fahrenheit-btn"
            onClick={() => !isFahrenheit && onToggleTempUnit()}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
              isFahrenheit ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            °F
          </button>
        </div>
      </div>

      {/* Main Temp & Condition Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-8 relative z-10">
        {/* Left: Big Temp */}
        <div className="md:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-3xl shadow-inner flex items-center justify-center">
            <WeatherIcon code={current.weatherCode} className={`w-16 h-16 sm:w-20 sm:h-20 ${wmo.accentColor}`} />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-7xl font-extrabold text-slate-100 tracking-tight">
                {Math.round(current.temperature)}
              </span>
              <span className="text-2xl sm:text-3xl font-medium text-slate-400">{tempSymbol}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/90 border border-slate-700 ${wmo.accentColor}`}>
                {wmo.label}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                Feels like {Math.round(current.apparentTemperature)}{tempSymbol}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2 max-w-sm">
              {wmo.description}
            </p>
          </div>
        </div>

        {/* Right: Today's High / Low & Quick Overview */}
        <div className="md:col-span-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-700/50">
            <span>Today&apos;s Temperature Range</span>
            <span className="font-semibold text-slate-200">
              {Math.round(today?.tempMin ?? 0)}° / {Math.round(today?.tempMax ?? 0)}° {tempSymbol}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Precipitation Risk</span>
            <span className="font-semibold text-sky-400">
              {today?.precipitationProbabilityMax ?? 0}% max
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cloud Cover</span>
            <span className="font-semibold text-slate-200">
              {current.cloudCover}%
            </span>
          </div>

          {/* Sun Arc Curve */}
          <div className="mt-1 pt-2 border-t border-slate-700/50">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Sunrise className="w-3.5 h-3.5 text-amber-400" /> {formatTime(today?.sunrise)}
              </span>
              <span className="flex items-center gap-1">
                <Sunset className="w-3.5 h-3.5 text-indigo-400" /> {formatTime(today?.sunset)}
              </span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${sunProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
        {/* Wind Speed */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-slate-800/70 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Wind</span>
            <Wind className="w-4 h-4 text-sky-400" />
          </div>
          <div className="my-2">
            <div className="text-lg font-bold text-slate-100">
              {Math.round(current.windSpeed)} <span className="text-xs font-normal text-slate-400">{speedUnit}</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Compass className="w-3 h-3 text-slate-400" style={{ transform: `rotate(${current.windDirection}deg)` }} />
              {getWindDirectionLabel(current.windDirection)} ({current.windDirection}°)
            </div>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-slate-800/70 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Humidity</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="text-lg font-bold text-slate-100">{current.humidity}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {current.humidity > 70 ? 'High Moisture' : current.humidity < 30 ? 'Dry Air' : 'Comfortable'}
            </div>
          </div>
        </div>

        {/* UV Index */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-slate-800/70 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>UV Index</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-100">{uvIndex}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${uvStatus.bg} ${uvStatus.color}`}>
                {uvStatus.label}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Max solar radiation</div>
          </div>
        </div>

        {/* Precipitation */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-slate-800/70 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Precipitation</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2">
            <div className="text-lg font-bold text-slate-100">
              {current.precipitation} <span className="text-xs font-normal text-slate-400">mm</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {today?.precipitationProbabilityMax ?? 0}% max chance
            </div>
          </div>
        </div>

        {/* Air Pressure */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-slate-800/70 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pressure</span>
            <Gauge className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-2">
            <div className="text-lg font-bold text-slate-100">
              {Math.round(current.pressure)} <span className="text-xs font-normal text-slate-400">hPa</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {current.pressure >= 1013 ? 'High Barometer' : 'Low Barometer'}
            </div>
          </div>
        </div>

        {/* Wind Gusts */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-slate-800/70 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Wind Gusts</span>
            <Wind className="w-4 h-4 text-teal-400" />
          </div>
          <div className="my-2">
            <div className="text-lg font-bold text-slate-100">
              {Math.round(current.windGusts)} <span className="text-xs font-normal text-slate-400">{speedUnit}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Max gust velocity</div>
          </div>
        </div>
      </div>
    </div>
  );
};
