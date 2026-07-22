import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, RefreshCw, CloudSun, Compass, Calendar, MapPin } from 'lucide-react';
import { CityResult, FullWeatherData, TemperatureUnit, SpeedUnit } from './types/weather';
import { getWeatherData, reverseGeocode } from './services/openMeteo';
import { Header } from './components/Header';
import { CitySearch } from './components/CitySearch';
import { CurrentWeather } from './components/CurrentWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { Forecast7Days } from './components/Forecast7Days';
import { TravelRecommendations } from './components/TravelRecommendations';
import { FavoriteCities } from './components/FavoriteCities';

const DEFAULT_CITY: CityResult = {
  id: 2643743,
  name: 'London',
  latitude: 51.5085,
  longitude: -0.1257,
  country: 'United Kingdom',
  country_code: 'GB',
  admin1: 'England',
};

export default function App() {
  const [activeCity, setActiveCity] = useState<CityResult>(() => {
    try {
      const saved = localStorage.getItem('weather_active_city');
      return saved ? JSON.parse(saved) : DEFAULT_CITY;
    } catch {
      return DEFAULT_CITY;
    }
  });

  const [weatherData, setWeatherData] = useState<FullWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [tempUnit, setTempUnit] = useState<TemperatureUnit>(() => {
    return (localStorage.getItem('weather_temp_unit') as TemperatureUnit) || 'celsius';
  });

  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>(() => {
    return (localStorage.getItem('weather_speed_unit') as SpeedUnit) || 'kmh';
  });

  const [favorites, setFavorites] = useState<CityResult[]>(() => {
    try {
      const saved = localStorage.getItem('weather_favorites');
      return saved ? JSON.parse(saved) : [DEFAULT_CITY];
    } catch {
      return [DEFAULT_CITY];
    }
  });

  // Fetch weather data
  const loadWeather = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWeatherData(
        activeCity.latitude,
        activeCity.longitude,
        tempUnit,
        speedUnit
      );
      setWeatherData(data);
    } catch (err: any) {
      console.error('Failed to load weather:', err);
      setError(err?.message || 'Failed to connect to Open-Meteo services. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [activeCity, tempUnit, speedUnit]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  // Persist active city and units
  useEffect(() => {
    try {
      localStorage.setItem('weather_active_city', JSON.stringify(activeCity));
    } catch (e) {
      console.error(e);
    }
  }, [activeCity]);

  useEffect(() => {
    localStorage.setItem('weather_temp_unit', tempUnit);
  }, [tempUnit]);

  useEffect(() => {
    localStorage.setItem('weather_speed_unit', speedUnit);
  }, [speedUnit]);

  // Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const locationCity = await reverseGeocode(latitude, longitude);
          setActiveCity(locationCity);
        } catch (err) {
          console.error(err);
          setActiveCity({
            id: Date.now(),
            name: 'Current Position',
            latitude,
            longitude,
          });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setIsLocating(false);
        setError('Location permission denied or unavailable. Please search for a city manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Toggle Favorites
  const toggleFavorite = () => {
    const isFav = favorites.some((f) => f.id === activeCity.id || f.name === activeCity.name);
    let updated: CityResult[];
    if (isFav) {
      updated = favorites.filter((f) => f.id !== activeCity.id && f.name !== activeCity.name);
    } else {
      updated = [...favorites, activeCity];
    }
    setFavorites(updated);
    try {
      localStorage.setItem('weather_favorites', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const isCurrentFavorite = favorites.some(
    (f) => f.id === activeCity.id || f.name === activeCity.name
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Navigation Header */}
        <Header
          tempUnit={tempUnit}
          speedUnit={speedUnit}
          onToggleTempUnit={() => setTempUnit(tempUnit === 'celsius' ? 'fahrenheit' : 'celsius')}
          onToggleSpeedUnit={() => setSpeedUnit(speedUnit === 'kmh' ? 'mph' : 'kmh')}
          onRefresh={loadWeather}
          isRefreshing={isLoading}
        />

        {/* Search & Favorites Bar */}
        <section className="space-y-4">
          <CitySearch
            onSelectCity={(city) => setActiveCity(city)}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLocating={isLocating}
          />

          <FavoriteCities
            favorites={favorites}
            activeCityId={activeCity.id}
            onSelectCity={(city) => setActiveCity(city)}
            onRemoveFavorite={(cityId) => {
              const updated = favorites.filter((f) => f.id !== cityId);
              setFavorites(updated);
              localStorage.setItem('weather_favorites', JSON.stringify(updated));
            }}
          />
        </section>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-rose-200 text-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadWeather}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !weatherData && (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-sky-400" />
            <p className="text-sm font-medium">Fetching Open-Meteo weather intelligence for {activeCity.name}...</p>
          </div>
        )}

        {/* Weather Main Content */}
        {weatherData && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Current Weather Card */}
            <CurrentWeather
              weather={weatherData}
              city={activeCity}
              isFavorite={isCurrentFavorite}
              onToggleFavorite={toggleFavorite}
              onToggleTempUnit={() => setTempUnit(tempUnit === 'celsius' ? 'fahrenheit' : 'celsius')}
            />

            {/* 24-Hour Forecast Timeline */}
            <HourlyForecast weather={weatherData} />

            {/* Weather Intelligence & Travel Planner */}
            <TravelRecommendations weather={weatherData} />

            {/* 7-Day Forecast */}
            <Forecast7Days weather={weatherData} />
          </div>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-sky-400" />
            <span>Weather Intelligence App • Data provided by Open-Meteo Geocoding &amp; Forecast APIs</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Lat: {activeCity.latitude.toFixed(2)}°</span>
            <span>Lon: {activeCity.longitude.toFixed(2)}°</span>
            {activeCity.country && <span>{activeCity.country}</span>}
          </div>
        </footer>
      </div>
    </div>
  );

}
