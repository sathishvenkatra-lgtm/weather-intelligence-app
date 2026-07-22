import React, { useState } from 'react';
import { Calendar, Droplets, Sun, Wind, ChevronRight, X, Sunrise, Sunset, ShieldAlert } from 'lucide-react';
import { DailyForecastDay, FullWeatherData } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { getWMOInfo } from '../utils/wmoCodes';

interface Forecast7DaysProps {
  weather: FullWeatherData;
}

export const Forecast7Days: React.FC<Forecast7DaysProps> = ({ weather }) => {
  const [selectedDay, setSelectedDay] = useState<DailyForecastDay | null>(null);
  const daily = weather.daily || [];
  const tempSymbol = weather.units.temperature === 'fahrenheit' ? '°F' : '°C';
  const speedUnit = weather.units.speed;

  if (daily.length === 0) return null;

  // Calculate overall week min and max temp for range bar positioning
  const weekMin = Math.min(...daily.map((d) => d.tempMin));
  const weekMax = Math.max(...daily.map((d) => d.tempMax));
  const tempRange = Math.max(1, weekMax - weekMin);

  const formatDayName = (dateStr: string, idx: number) => {
    if (idx === 0) return 'Today';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--:--';
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return timeStr.slice(11, 16);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">7-Day Weather Forecast</h2>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Click any day for detailed breakdown
        </span>
      </div>

      {/* Days List */}
      <div className="space-y-3">
        {daily.slice(0, 7).map((day, idx) => {
          const wmo = getWMOInfo(day.weatherCode);

          // Calculate range bar width & position percentage relative to full week
          const leftPercent = Math.max(0, ((day.tempMin - weekMin) / tempRange) * 100);
          const barWidthPercent = Math.max(10, ((day.tempMax - day.tempMin) / tempRange) * 100);

          return (
            <button
              key={day.date}
              id={`forecast-day-${idx}`}
              onClick={() => setSelectedDay(day)}
              className="w-full p-3.5 sm:p-4 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group text-left"
            >
              {/* Day & Icon */}
              <div className="flex items-center gap-3 min-w-[170px]">
                <WeatherIcon code={day.weatherCode} className={`w-8 h-8 shrink-0 ${wmo.accentColor}`} />
                <div>
                  <div className="text-sm font-bold text-slate-100 group-hover:text-sky-300 transition">
                    {formatDayName(day.date, idx)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatDateLabel(day.date)} • {wmo.label}
                  </div>
                </div>
              </div>

              {/* Rain Chance Badge */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 sm:w-28">
                {day.precipitationProbabilityMax > 10 ? (
                  <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-sky-400" />
                    {day.precipitationProbabilityMax}%
                  </span>
                ) : (
                  <span className="text-slate-500 text-[11px]">Dry conditions</span>
                )}
              </div>

              {/* Temp Bar Indicator */}
              <div className="flex items-center gap-3 flex-1 max-w-xs w-full">
                <span className="text-xs font-semibold text-slate-400 w-10 text-right">
                  {Math.round(day.tempMin)}{tempSymbol}
                </span>

                <div className="flex-1 bg-slate-700/50 rounded-full h-2 relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-sky-500 to-amber-400 rounded-full transition-all"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidthPercent}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-semibold text-slate-100 w-10">
                  {Math.round(day.tempMax)}{tempSymbol}
                </span>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition hidden sm:block" />
            </button>
          );
        })}
      </div>

      {/* Selected Day Detail Modal / Tray */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedDay(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                <WeatherIcon
                  code={selectedDay.weatherCode}
                  className={`w-10 h-10 ${getWMOInfo(selectedDay.weatherCode).accentColor}`}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">
                  {new Date(selectedDay.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <p className="text-sm text-sky-400 font-medium">
                  {getWMOInfo(selectedDay.weatherCode).label}
                </p>
              </div>
            </div>

            {/* Modal Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                <div className="text-xs text-slate-400 mb-1">Temperature Range</div>
                <div className="text-lg font-bold text-slate-100">
                  {Math.round(selectedDay.tempMin)}° / {Math.round(selectedDay.tempMax)}° {tempSymbol}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Feels like up to {Math.round(selectedDay.apparentTempMax)}°
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                <div className="text-xs text-slate-400 mb-1">Rain & Snow</div>
                <div className="text-lg font-bold text-sky-400">
                  {selectedDay.precipitationProbabilityMax}% Chance
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Volume: {selectedDay.precipitationSum} mm
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                <div className="text-xs text-slate-400 mb-1">Peak Wind</div>
                <div className="text-lg font-bold text-slate-100">
                  {Math.round(selectedDay.windSpeedMax)} <span className="text-xs">{speedUnit}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-sky-400" /> Dominant direction
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                <div className="text-xs text-slate-400 mb-1">Peak UV Index</div>
                <div className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-400" />
                  {selectedDay.uvIndexMax}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {selectedDay.uvIndexMax > 6 ? 'High solar intensity' : 'Moderate UV'}
                </div>
              </div>
            </div>

            {/* Sun Times */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-around text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Sunrise className="w-4 h-4 text-amber-400" />
                <span>Sunrise: <strong>{formatTime(selectedDay.sunrise)}</strong></span>
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <Sunset className="w-4 h-4 text-indigo-400" />
                <span>Sunset: <strong>{formatTime(selectedDay.sunset)}</strong></span>
              </div>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="mt-6 w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-2xl transition shadow-lg shadow-sky-500/20"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
