import React from 'react';
import { Bookmark, MapPin, X } from 'lucide-react';
import { CityResult } from '../types/weather';

interface FavoriteCitiesProps {
  favorites: CityResult[];
  activeCityId: number;
  onSelectCity: (city: CityResult) => void;
  onRemoveFavorite: (cityId: number) => void;
}

export const FavoriteCities: React.FC<FavoriteCitiesProps> = ({
  favorites,
  activeCityId,
  onSelectCity,
  onRemoveFavorite,
}) => {
  if (favorites.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 font-medium mr-1">
        <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span>Saved Places:</span>
      </div>

      {favorites.map((city) => {
        const isActive = city.id === activeCityId;
        return (
          <div
            key={`fav-${city.id}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium shrink-0 transition ${
              isActive
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-200'
                : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <button
              id={`fav-select-${city.id}`}
              onClick={() => onSelectCity(city)}
              className="flex items-center gap-1 hover:underline"
            >
              <MapPin className="w-3 h-3 text-sky-400" />
              <span>{city.name}</span>
            </button>

            <button
              id={`fav-remove-${city.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFavorite(city.id);
              }}
              className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition"
              title="Remove bookmark"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
