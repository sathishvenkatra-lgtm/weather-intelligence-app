import React from 'react';
import {
  Sparkles,
  Compass,
  Activity,
  Sun,
  Camera,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ShieldAlert,
  Luggage,
  Shirt,
  Umbrella,
  Footprints,
  Glasses,
  Droplets,
  Wind,
} from 'lucide-react';
import { FullWeatherData } from '../types/weather';
import { calculateTravelAdvice } from '../utils/travelAdvice';

interface TravelRecommendationsProps {
  weather: FullWeatherData;
}

export const TravelRecommendations: React.FC<TravelRecommendationsProps> = ({ weather }) => {
  const advice = calculateTravelAdvice(weather);

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-5 h-5 text-sky-400" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'Camera':
        return <Camera className="w-5 h-5 text-purple-400" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-rose-400" />;
      default:
        return <Compass className="w-5 h-5 text-sky-400" />;
    }
  };

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt':
        return <Shirt className="w-4 h-4 text-sky-400" />;
      case 'Umbrella':
        return <Umbrella className="w-4 h-4 text-indigo-400" />;
      case 'Footprints':
        return <Footprints className="w-4 h-4 text-amber-400" />;
      case 'Sun':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'Glasses':
        return <Glasses className="w-4 h-4 text-purple-400" />;
      case 'Wind':
        return <Wind className="w-4 h-4 text-teal-400" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      default:
        return <Luggage className="w-4 h-4 text-sky-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ideal':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Good':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Poor':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500 to-sky-500 rounded-2xl text-slate-950 shadow-md">
            <Sparkles className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">
              Weather Intelligence & Travel Planner
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Smart activity suitability scores, best outdoor windows, and gear checklist
            </p>
          </div>
        </div>

        {/* Travel Score Badge */}
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-4 py-2.5 rounded-2xl">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Travel Score
            </div>
            <div className="text-xs text-sky-400 font-semibold">{advice.verdict}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-extrabold text-slate-100 text-lg shadow">
            {advice.overallScore}
          </div>
        </div>
      </div>

      {/* Summary Banner & Best Window */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Weather Summary
            </div>
            <p className="text-slate-200 text-sm leading-relaxed">{advice.summary}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Clock className="w-4 h-4 text-sky-400" /> Best Outdoor Window
          </div>
          <div className="text-base font-bold text-slate-100">{advice.bestTimeWindow}</div>
          <div className="text-xs text-slate-400 mt-2">
            Calculated lowest precipitation & temperature comfort range
          </div>
        </div>
      </div>

      {/* Activity Suitability Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-400" /> Activity Suitability Index
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {advice.activities.map((act) => (
            <div
              key={act.name}
              className="bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition hover:bg-slate-800/60"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-900 border border-slate-700 rounded-xl">
                    {getActivityIcon(act.icon)}
                  </div>
                  <div className="font-semibold text-slate-200 text-sm">{act.name}</div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(act.status)}`}>
                  {act.status}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Score</span>
                  <span className="font-semibold text-slate-200">{act.score}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${act.score}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-snug">{act.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Packing & Gear Checklist */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Luggage className="w-4 h-4 text-sky-400" /> Smart Packing & Gear Checklist
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {advice.packingList.map((item, idx) => (
            <div
              key={`pack-${idx}`}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 transition ${
                item.essential
                  ? 'bg-sky-500/10 border-sky-500/30'
                  : 'bg-slate-800/40 border-slate-700/50'
              }`}
            >
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-700/80 shrink-0">
                {getItemIcon(item.icon)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-200">{item.item}</div>
                  {item.essential && (
                    <span className="text-[10px] font-bold text-sky-400 uppercase bg-sky-500/20 px-1.5 py-0.5 rounded">
                      Essential
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{item.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Advisories */}
      {advice.advisories.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Weather Advisories & Safety Notes
          </h3>

          <div className="space-y-3">
            {advice.advisories.map((adv, idx) => (
              <div
                key={`adv-${idx}`}
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  adv.type === 'warning'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                    : adv.type === 'info'
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-200'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                }`}
              >
                {adv.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                ) : adv.type === 'info' ? (
                  <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}

                <div>
                  <h4 className="text-sm font-bold">{adv.title}</h4>
                  <p className="text-xs mt-1 opacity-90 leading-relaxed">{adv.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
