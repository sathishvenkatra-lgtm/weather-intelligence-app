# WeatherIQ - Weather Intelligence & Travel Planner

WeatherIQ is a modern, responsive weather forecast and travel intelligence web application built with React, Vite, Tailwind CSS, and Open-Meteo API.

## Features

- 🌤️ **Current Weather Overview**: Live metrics for temperature, apparent "feels like" temp, humidity, wind speed & direction, precipitation, UV index, air pressure, and cloud cover.
- ⏱️ **24-Hour Forecast**: Interactive hourly forecast with visual sliders for temperature curves, rain probability, and wind speeds.
- 📅 **7-Day Extended Forecast**: Detailed day-by-day weather breakdown with interactive modal trays showing temperature ranges, peak wind speeds, UV indices, and sunrise/sunset times.
- ✈️ **Travel Intelligence & Smart Packing**: Automated activity suitability scores (Hiking, Sightseeing, Swimming, Photography, Dining out) and dynamic gear/packing checklists tailored to current weather conditions.
- 🔍 **Global City Search & Geolocation**: Instant location search with debounced geocoding and standard browser GPS location detection.
- 📌 **Favorite Cities**: Local bookmarking for quick one-click access to saved locations.
- 🌡️ **Temperature Unit Toggle**: Seamless switching between Celsius (°C) and Fahrenheit (°F).

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Animations**: Motion / Tailwind transitions
- **API**: Open-Meteo API (Geocoding & Forecast APIs, zero API key required)
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Scripts

- `npm run dev`: Starts the local Vite development server on port 3000.
- `npm run build`: Bundles the application for production deployment in `dist/`.
- `npm run lint`: Runs TypeScript type checking.
