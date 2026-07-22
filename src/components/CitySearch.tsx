import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Clock, Loader2, Navigation } from 'lucide-react';
import { CityResult } from '../types/weather';
import { searchCities } from '../services/openMeteo';

interface CitySearchProps {
  onSelectCity: (city: CityResult) => void;
  onUseCurrentLocation: () => void;
  isLocating?: boolean;
}

const POPULAR_CITIES: CityResult[] = [
  { id: 2643743, name: 'London', latitude: 51.5085, longitude: -0.1257, country: 'United Kingdom', country_code: 'GB' },
  { id: 2988507, name: 'Paris', latitude: 48.8534, longitude: 2.3488, country: 'France', country_code: 'FR' },
  { id: 5128581, name: 'New York', latitude: 40.7143, longitude: -74.006, country: 'United States', country_code: 'US' },
  { id: 1850147, name: 'Tokyo', latitude: 35.6895, longitude: 139.6917, country: 'Japan', country_code: 'JP' },
  { id: 2147714, name: 'Sydney', latitude: -33.8678, longitude: 151.2073, country: 'Australia', country_code: 'AU' },
  { id: 5391959, name: 'San Francisco', latitude: 37.7749, longitude: -122.4194, country: 'United States', country_code: 'US' },
];

export const CitySearch: React.FC<CitySearchProps> = ({
  onSelectCity,
  onUseCurrentLocation,
  isLocating = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentCities, setRecentCities] = useState<CityResult[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent cities from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('weather_recent_cities');
      if (saved) {
        setRecentCities(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load recent cities', e);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced city search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const res = await searchCities(query);
      setResults(res);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (city: CityResult) => {
    onSelectCity(city);
    setQuery('');
    setIsOpen(false);

    // Update recent cities
    try {
      const filtered = recentCities.filter((c) => c.id !== city.id && c.name !== city.name);
      const updated = [city, ...filtered].slice(0, 5);
      setRecentCities(updated);
      localStorage.setItem('weather_recent_cities', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recent city', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (results.length > 0) {
      handleSelect(results[0]);
    } else {
      setIsLoading(true);
      const res = await searchCities(query);
      setIsLoading(false);
      if (res && res.length > 0) {
        handleSelect(res[0]);
      }
    }
  };

  const handleClearRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentCities([]);
    localStorage.removeItem('weather_recent_cities');
  };

  return (
    <div className="relative w-full max-w-xl mx-auto" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-slate-400 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>

        <input
          id="city-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search city or country (e.g., Tokyo, Paris, San Francisco)..."
          className="w-full pl-12 pr-28 py-3.5 bg-slate-900/80 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-400 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all shadow-lg backdrop-blur-md"
        />

        {query && (
          <button
            id="clear-search-button"
            onClick={() => setQuery('')}
            className="absolute right-20 text-slate-400 hover:text-slate-200 p-1 rounded-full transition"
            title="Clear text"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          id="use-location-button"
          onClick={onUseCurrentLocation}
          disabled={isLocating}
          className="absolute right-2 px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-sky-200 border border-sky-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
          title="Use my current location"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">GPS</span>
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden max-h-96 overflow-y-auto divide-y divide-slate-800">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-4 flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              Searching cities via Open-Meteo...
            </div>
          )}

          {/* Search Results */}
          {!isLoading && query.trim().length >= 2 && results.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/40">
                Matching Cities
              </div>
              {results.map((city) => (
                <button
                  id={`city-result-${city.id}`}
                  key={city.id}
                  onClick={() => handleSelect(city)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-sky-500/10 hover:text-sky-200 transition group"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-sky-400 mt-1 shrink-0 group-hover:scale-110 transition" />
                    <div>
                      <div className="text-slate-100 font-medium text-sm group-hover:text-sky-300">
                        {city.name}
                        {city.admin1 ? `, ${city.admin1}` : ''}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {city.country || 'Unknown Country'} • Lat: {city.latitude.toFixed(2)}°, Lon: {city.longitude.toFixed(2)}°
                      </div>
                    </div>
                  </div>
                  {city.population && (
                    <span className="text-[11px] text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full">
                      Pop: {(city.population / 1000).toFixed(0)}k
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No results state */}
          {!isLoading && query.trim().length >= 2 && results.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-sm">
              No matching cities found for &quot;{query}&quot;. Try a major city or country name.
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentCities.length > 0 && (
            <div>
              <div className="px-4 py-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/40">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Recent Searches
                </span>
                <button
                  onClick={handleClearRecent}
                  className="text-slate-500 hover:text-slate-300 hover:underline capitalize font-normal text-[11px]"
                >
                  Clear
                </button>
              </div>
              {recentCities.map((city) => (
                <button
                  id={`recent-city-${city.id}`}
                  key={`recent-${city.id}`}
                  onClick={() => handleSelect(city)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/60 transition"
                >
                  <div className="flex items-center gap-2.5 text-slate-200 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{city.name}</span>
                    <span className="text-slate-500 text-xs font-normal">
                      ({city.country || city.admin1})
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Popular Cities Quick Picks */}
          {!query && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/40">
                Popular Destinations
              </div>
              <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POPULAR_CITIES.map((city) => (
                  <button
                    id={`popular-city-${city.id}`}
                    key={`popular-${city.id}`}
                    onClick={() => handleSelect(city)}
                    className="px-3 py-2 bg-slate-800/50 hover:bg-sky-500/20 border border-slate-700/50 hover:border-sky-500/40 rounded-xl text-left transition group"
                  >
                    <div className="text-slate-200 group-hover:text-sky-300 font-medium text-xs">
                      {city.name}
                    </div>
                    <div className="text-slate-400 text-[10px]">{city.country}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
