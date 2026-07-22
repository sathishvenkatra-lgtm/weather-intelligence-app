import React from 'react';
import { CloudSun, RefreshCw, Sparkles } from 'lucide-react';
import { TemperatureUnit, SpeedUnit } from '../types/weather';

interface HeaderProps {
  tempUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
  onToggleTempUnit: () => void;
  onToggleSpeedUnit: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  tempUnit,
  speedUnit,
  onToggleTempUnit,
  onToggleSpeedUnit,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-2 border-b border-slate-800/80 mb-6">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-sky-500/20 text-white">
          <CloudSun className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-100">
              Weather<span className="text-sky-400">IQ</span>
            </h1>
            <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time Open-Meteo forecasts &amp; smart travel recommendations
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Unit Selectors */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-2xl text-xs">
          <button
            id="header-temp-toggle"
            onClick={onToggleTempUnit}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition"
          >
            {tempUnit === 'celsius' ? '°C' : '°F'}
          </button>
          <button
            id="header-speed-toggle"
            onClick={onToggleSpeedUnit}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition"
          >
            {speedUnit.toUpperCase()}
          </button>
        </div>

        {/* Refresh button */}
        <button
          id="header-refresh-button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-2xl transition disabled:opacity-50"
          title="Refresh weather data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
