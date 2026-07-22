import React, { useState } from 'react';
import { Clock, Umbrella, Wind, Thermometer, Droplets } from 'lucide-react';
import { FullWeatherData } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { getWMOInfo } from '../utils/wmoCodes';

interface HourlyForecastProps {
  weather: FullWeatherData;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ weather }) => {
  const [viewMode, setViewMode] = useState<'temp' | 'rain' | 'wind'>('temp');
  const hourly = weather.hourly;
  const tempSymbol = weather.units.temperature === 'fahrenheit' ? '°F' : '°C';
  const speedUnit = weather.units.speed;

  if (!hourly || !hourly.times || hourly.times.length === 0) {
    return null;
  }

  // Slice next 24 hours starting from current local hour
  const now = new Date();
  const currentIsoHour = now.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"

  let startIndex = hourly.times.findIndex((t) => t.startsWith(currentIsoHour));
  if (startIndex === -1) startIndex = 0;

  const next24Hours = hourly.times.slice(startIndex, startIndex + 24).map((timeStr, idx) => {
    const actualIndex = startIndex + idx;
    const dateObj = new Date(timeStr);
    const hourLabel = idx === 0 
      ? 'Now' 
      : dateObj.toLocaleTimeString([], { hour: 'numeric', hour12: true });

    return {
      timeStr,
      hourLabel,
      temp: Math.round(hourly.temperatures[actualIndex] ?? 0),
      weatherCode: hourly.weatherCodes[actualIndex] ?? 0,
      rainProb: hourly.precipitationProbabilities[actualIndex] ?? 0,
      precip: hourly.precipitations[actualIndex] ?? 0,
      windSpeed: Math.round(hourly.windSpeeds[actualIndex] ?? 0),
      humidity: hourly.humidities[actualIndex] ?? 0,
      uv: hourly.uvIndices[actualIndex] ?? 0,
    };
  });

  // Calculate min/max for temperature bar heights
  const temps = next24Hours.map((h) => h.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(1, maxTemp - minTemp);

  return (
    <div className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">24-Hour Forecast</h2>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 p-1 rounded-2xl text-xs">
          <button
            onClick={() => setViewMode('temp')}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1 ${
              viewMode === 'temp' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" /> Temp
          </button>
          <button
            onClick={() => setViewMode('rain')}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1 ${
              viewMode === 'rain' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" /> Rain %
          </button>
          <button
            onClick={() => setViewMode('wind')}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1 ${
              viewMode === 'wind' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" /> Wind
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Hour Cards */}
      <div className="overflow-x-auto pb-3 pt-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/40">
        <div className="flex items-stretch gap-3 min-w-max">
          {next24Hours.map((item, idx) => {
            const wmo = getWMOInfo(item.weatherCode);
            // Calculate height percentage for temp bar graph
            const barPercent = Math.max(15, Math.min(100, ((item.temp - minTemp) / tempRange) * 100));

            return (
              <div
                key={`hour-${idx}`}
                className={`w-24 p-3 rounded-2xl border flex flex-col items-center justify-between transition-all ${
                  idx === 0
                    ? 'bg-sky-500/15 border-sky-500/50 shadow-lg shadow-sky-500/5'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                {/* Time Label */}
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  {item.hourLabel}
                </div>

                {/* Weather Icon */}
                <div className="my-1">
                  <WeatherIcon code={item.weatherCode} className={`w-8 h-8 ${wmo.accentColor}`} />
                </div>

                {/* Content based on View Mode */}
                {viewMode === 'temp' && (
                  <div className="w-full flex flex-col items-center gap-1 mt-2">
                    <span className="text-sm font-bold text-slate-100">
                      {item.temp}{tempSymbol}
                    </span>
                    {/* Relative height bar */}
                    <div className="w-full h-10 flex items-end justify-center py-1">
                      <div
                        className="w-2.5 bg-gradient-to-t from-sky-500 to-amber-400 rounded-full transition-all duration-300"
                        style={{ height: `${barPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {viewMode === 'rain' && (
                  <div className="w-full flex flex-col items-center gap-1.5 mt-2">
                    <span className="text-xs font-bold text-sky-400">
                      {item.rainProb}%
                    </span>
                    <div className="w-full bg-slate-700/60 rounded-full h-12 flex flex-col justify-end overflow-hidden p-0.5">
                      <div
                        className="w-full bg-sky-500 rounded-full transition-all duration-300"
                        style={{ height: `${Math.max(5, item.rainProb)}%` }}
                      />
                    </div>
                  </div>
                )}

                {viewMode === 'wind' && (
                  <div className="w-full flex flex-col items-center gap-1 mt-2">
                    <span className="text-xs font-bold text-teal-300">
                      {item.windSpeed} <span className="text-[10px] font-normal">{speedUnit}</span>
                    </span>
                    <Wind className="w-4 h-4 text-slate-400 mt-1" />
                  </div>
                )}

                {/* Sub-label badge */}
                <div className="mt-2 text-[10px] text-slate-400 truncate max-w-full text-center">
                  {item.rainProb > 20 ? (
                    <span className="text-sky-300 font-medium">{item.rainProb}% rain</span>
                  ) : (
                    wmo.label
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
