import { FullWeatherData, TravelIntelligence, ActivityRating, PackingItem } from '../types/weather';
import { getWMOInfo } from './wmoCodes';

export function calculateTravelAdvice(data: FullWeatherData): TravelIntelligence {
  const current = data.current;
  const today = data.daily[0];
  const hourly = data.hourly;

  const tempC = data.units.temperature === 'fahrenheit' 
    ? (current.temperature - 32) * (5 / 9) 
    : current.temperature;
  
  const windKmh = data.units.speed === 'mph' 
    ? current.windSpeed * 1.60934 
    : current.windSpeed;

  const wmo = getWMOInfo(current.weatherCode);
  const uvMax = today?.uvIndexMax ?? 3;
  const rainProb = today?.precipitationProbabilityMax ?? 0;

  // --- Calculate Overall Score (0 - 10) ---
  let score = 8.0;

  // Temp factor
  if (tempC >= 18 && tempC <= 26) {
    score += 1.5;
  } else if (tempC >= 12 && tempC < 18) {
    score += 0.5;
  } else if (tempC > 26 && tempC <= 32) {
    score += 0.2;
  } else if (tempC > 32) {
    score -= 2.0;
  } else if (tempC < 5) {
    score -= 2.5;
  } else if (tempC < 12) {
    score -= 1.0;
  }

  // Rain factor
  if (rainProb > 70) {
    score -= 3.0;
  } else if (rainProb > 40) {
    score -= 1.5;
  } else if (rainProb > 20) {
    score -= 0.5;
  } else {
    score += 0.5;
  }

  // Wind factor
  if (windKmh > 35) {
    score -= 2.0;
  } else if (windKmh > 20) {
    score -= 0.8;
  }

  // Weather category factor
  if (wmo.category === 'thunderstorm') {
    score -= 3.5;
  } else if (wmo.category === 'snow') {
    score -= 1.5;
  } else if (wmo.category === 'rain') {
    score -= 2.0;
  } else if (wmo.category === 'clear') {
    score += 0.5;
  }

  // Clamp overall score
  score = Math.max(1.0, Math.min(10.0, Math.round(score * 10) / 10));

  // --- Verdict & Summary ---
  let verdict = 'Excellent Travel Conditions';
  let summary = 'Optimal weather for outdoor exploration, sightseeing, and outdoor activities.';

  if (score >= 8.5) {
    verdict = 'Ideal Outdoor Weather';
    summary = 'Pleasant temperatures and clear skies make this a fantastic day for travel and outdoor tours.';
  } else if (score >= 7.0) {
    verdict = 'Favorable for Travel';
    summary = 'Good conditions overall. Perfect for casual walking tours and outdoor exploring with light layers.';
  } else if (score >= 5.0) {
    verdict = 'Moderate Conditions';
    summary = 'Acceptable weather, but keep an eye on minor rain chances or temperature swings.';
  } else if (score >= 3.5) {
    verdict = 'Challenging Outdoor Weather';
    summary = 'Expect damp, windy, or chilly weather. Prioritize indoor activities or prepare proper gear.';
  } else {
    verdict = 'Unfavorable for Outdoor Travel';
    summary = 'Adverse conditions ahead (heavy precipitation, severe cold/heat, or high winds). Indoor plans recommended.';
  }

  // --- Activities Ratings ---
  const activities: ActivityRating[] = [
    calcSightseeingRating(tempC, rainProb, windKmh, wmo.category),
    calcOutdoorSportsRating(tempC, rainProb, windKmh, current.humidity, wmo.category),
    calcBeachWaterRating(tempC, uvMax, windKmh, rainProb, wmo.category),
    calcPhotographyRating(wmo.category, current.cloudCover, rainProb),
    calcOutdoorDiningRating(tempC, windKmh, rainProb, wmo.category),
  ];

  // --- Packing & Gear List ---
  const packingList: PackingItem[] = [];

  // Clothing
  if (tempC < 5) {
    packingList.push({
      item: 'Heavy Thermal Coat & Gloves',
      category: 'Clothing',
      icon: 'Shirt',
      note: 'Sub-zero insulation required',
      essential: true,
    });
  } else if (tempC < 15) {
    packingList.push({
      item: 'Layered Sweater / Jacket',
      category: 'Clothing',
      icon: 'Shirt',
      note: 'Crisp air requires warm outer layer',
      essential: true,
    });
  } else if (tempC <= 24) {
    packingList.push({
      item: 'Light Jacket / Long Sleeve',
      category: 'Clothing',
      icon: 'Shirt',
      note: 'Comfortable breathable fabric',
      essential: false,
    });
  } else {
    packingList.push({
      item: 'Lightweight Cotton T-Shirt',
      category: 'Clothing',
      icon: 'Shirt',
      note: 'Breathable heat-friendly attire',
      essential: true,
    });
  }

  // Rain Gear
  if (rainProb >= 40 || ['rain', 'drizzle', 'thunderstorm'].includes(wmo.category)) {
    packingList.push({
      item: 'Compact Windproof Umbrella',
      category: 'Gear',
      icon: 'Umbrella',
      note: `${rainProb}% chance of precipitation`,
      essential: true,
    });
    packingList.push({
      item: 'Waterproof Footwear',
      category: 'Footwear',
      icon: 'Footprints',
      note: 'Keep feet dry on damp walking paths',
      essential: true,
    });
  } else {
    packingList.push({
      item: 'Comfortable Walking Sneakers',
      category: 'Footwear',
      icon: 'Footprints',
      note: 'Ideal for city pavements',
      essential: true,
    });
  }

  // UV Protection
  if (uvMax >= 3) {
    packingList.push({
      item: `Sunscreen (SPF ${uvMax > 7 ? '50+' : '30+'})`,
      category: 'Protection',
      icon: 'Sun',
      note: `Peak UV Index: ${uvMax}`,
      essential: true,
    });
    packingList.push({
      item: 'UV-Blocking Sunglasses',
      category: 'Protection',
      icon: 'Glasses',
      note: 'Protect eyes during daytime tours',
      essential: true,
    });
  }

  // Wind Protection
  if (windKmh > 22) {
    packingList.push({
      item: 'Windbreaker Shell',
      category: 'Clothing',
      icon: 'Wind',
      note: `Breezy conditions up to ${Math.round(windKmh)} km/h`,
      essential: true,
    });
  }

  // Hydration
  if (tempC > 25 || uvMax > 6) {
    packingList.push({
      item: 'Reusable Water Bottle',
      category: 'Gear',
      icon: 'Droplets',
      note: 'Stay hydrated during outdoor excursions',
      essential: true,
    });
  }

  // --- Best Outdoor Time Window ---
  const bestTimeWindow = calculateBestTimeWindow(hourly, data.units.temperature);

  // --- Advisories ---
  const advisories: TravelIntelligence['advisories'] = [];

  if (uvMax >= 8) {
    advisories.push({
      type: 'warning',
      title: 'Very High UV Radiation Hazard',
      description: `Peak UV Index will reach ${uvMax}. Avoid direct sun exposure between 11:00 AM and 3:00 PM without SPF 50+ and headgear.`,
    });
  }

  if (rainProb >= 60 || wmo.category === 'thunderstorm') {
    advisories.push({
      type: 'warning',
      title: 'High Rainfall & Storm Probability',
      description: `Precipitation risk is ${rainProb}%. Carry waterproof gear and check radar before starting long outdoor trips.`,
    });
  }

  if (windKmh >= 35) {
    advisories.push({
      type: 'info',
      title: 'Gusty Wind Advisory',
      description: `Sustained winds up to ${Math.round(windKmh)} km/h. Secure loose outdoor belongings and take caution on elevated coastal viewings.`,
    });
  }

  if (tempC <= 0) {
    advisories.push({
      type: 'warning',
      title: 'Freezing Weather Hazard',
      description: 'Sub-zero temperatures present. Watch out for icy footpaths and potential road black ice.',
    });
  }

  if (advisories.length === 0) {
    advisories.push({
      type: 'success',
      title: 'No Active Severe Weather Warnings',
      description: 'Conditions are stable and well suited for standard outdoor activities.',
    });
  }

  return {
    overallScore: score,
    verdict,
    summary,
    bestTimeWindow,
    activities,
    packingList,
    advisories,
  };
}

function calcSightseeingRating(tempC: number, rainProb: number, windKmh: number, category: string): ActivityRating {
  let score = 90;
  if (tempC < 10 || tempC > 30) score -= 25;
  if (rainProb > 40) score -= 35;
  if (windKmh > 25) score -= 15;
  if (category === 'thunderstorm' || category === 'rain') score -= 30;

  score = Math.max(10, Math.min(100, score));

  return {
    name: 'City Sightseeing & Walking',
    score,
    status: getStatusLabel(score),
    icon: 'Compass',
    reason: score > 75 
      ? 'Comfortable temperatures and minimal rain risk for walking tours' 
      : score > 50 
        ? 'Decent conditions; bring a light jacket or umbrella' 
        : 'Rain or harsh temps make indoor museums/venues preferred',
  };
}

function calcOutdoorSportsRating(tempC: number, rainProb: number, windKmh: number, humidity: number, category: string): ActivityRating {
  let score = 85;
  if (tempC < 8 || tempC > 26) score -= 20;
  if (humidity > 80) score -= 15;
  if (rainProb > 30) score -= 30;
  if (windKmh > 20) score -= 20;
  if (category === 'thunderstorm') score -= 50;

  score = Math.max(10, Math.min(100, score));

  return {
    name: 'Outdoor Sports & Running',
    score,
    status: getStatusLabel(score),
    icon: 'Activity',
    reason: score > 75 
      ? 'Great temperature and low wind for jogging, cycling, or tennis' 
      : score > 50 
        ? 'Moderate suitability; watch out for humidity or breeze' 
        : 'High humidity, rain, or gusty winds make workouts tiring',
  };
}

function calcBeachWaterRating(tempC: number, uvMax: number, windKmh: number, rainProb: number, category: string): ActivityRating {
  let score = 50;
  if (tempC >= 25) score += 30;
  else if (tempC >= 21) score += 15;
  else score -= 30;

  if (uvMax >= 5) score += 10;
  if (category === 'clear') score += 10;
  if (rainProb > 25) score -= 35;
  if (windKmh > 25) score -= 20;

  score = Math.max(5, Math.min(100, score));

  return {
    name: 'Beach & Swimming',
    score,
    status: getStatusLabel(score),
    icon: 'Sun',
    reason: score > 75 
      ? 'Warm sunshine and mild sea breeze create ideal beach conditions' 
      : score > 50 
        ? 'Warm enough, but clouds or cool breeze might dampen swimming' 
        : 'Cool temperatures or rain make water activities uncomfortable',
  };
}

function calcPhotographyRating(category: string, cloudCover: number, rainProb: number): ActivityRating {
  let score = 70;
  if (category === 'clear') score += 15;
  if (cloudCover >= 20 && cloudCover <= 60) score += 25; // Golden clouds
  if (rainProb > 50) score -= 30;

  score = Math.max(15, Math.min(100, score));

  return {
    name: 'Landscape & Architecture Photo',
    score,
    status: getStatusLabel(score),
    icon: 'Camera',
    reason: score > 75 
      ? 'Dramatic cloud formations or crisp atmospheric visibility for photos' 
      : score > 50 
        ? 'Fair lighting conditions; ideal around sunrise and golden hour' 
        : 'Overcast, fog, or rain limits scenic visibility and contrast',
  };
}

function calcOutdoorDiningRating(tempC: number, windKmh: number, rainProb: number, category: string): ActivityRating {
  let score = 80;
  if (tempC < 16 || tempC > 28) score -= 25;
  if (windKmh > 18) score -= 20;
  if (rainProb > 20) score -= 35;
  if (category === 'rain' || category === 'thunderstorm') score -= 40;

  score = Math.max(10, Math.min(100, score));

  return {
    name: 'Outdoor Patio & Picnic',
    score,
    status: getStatusLabel(score),
    icon: 'Utensils',
    reason: score > 75 
      ? 'Calm breezes and pleasant temperatures for outdoor patio dining' 
      : score > 50 
        ? 'Acceptable for covered patios with heaters or umbrellas' 
        : 'Cool winds or drizzle make indoor dining far more cozy',
  };
}

function getStatusLabel(score: number): ActivityRating['status'] {
  if (score >= 82) return 'Ideal';
  if (score >= 65) return 'Good';
  if (score >= 45) return 'Moderate';
  if (score >= 25) return 'Poor';
  return 'Unfavorable';
}

function calculateBestTimeWindow(hourly: FullWeatherData['hourly'], tempUnit: string): string {
  if (!hourly || !hourly.times || hourly.times.length < 12) {
    return '10:00 AM - 4:00 PM';
  }

  // Evaluate the next 16 hours starting from current hour
  const now = new Date();
  const currentHour = now.getHours();

  let bestStartIndex = 0;
  let lowestRainChance = 999;

  for (let i = 0; i < Math.min(16, hourly.times.length - 3); i++) {
    const p1 = hourly.precipitationProbabilities[i] ?? 0;
    const p2 = hourly.precipitationProbabilities[i + 1] ?? 0;
    const p3 = hourly.precipitationProbabilities[i + 2] ?? 0;
    const avgRain = (p1 + p2 + p3) / 3;

    if (avgRain < lowestRainChance) {
      lowestRainChance = avgRain;
      bestStartIndex = i;
    }
  }

  const startTimeStr = hourly.times[bestStartIndex];
  const endTimeStr = hourly.times[Math.min(bestStartIndex + 3, hourly.times.length - 1)];

  if (!startTimeStr || !endTimeStr) {
    return '10:00 AM - 2:00 PM';
  }

  const startDate = new Date(startTimeStr);
  const endDate = new Date(endTimeStr);

  const formatHour = (d: Date) => {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return `${formatHour(startDate)} - ${formatHour(endDate)} (${Math.round(lowestRainChance)}% rain risk)`;
}
