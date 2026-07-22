import React from 'react';
import {
  Sun,
  SunMedium,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudHail,
  CloudSnow,
  Snowflake,
  CloudLightning,
  LucideProps,
} from 'lucide-react';
import { getWMOInfo } from '../utils/wmoCodes';

interface WeatherIconProps extends Omit<LucideProps, 'ref'> {
  code?: number;
  iconName?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, iconName, className = 'w-6 h-6', ...props }) => {
  const name = iconName || (code !== undefined ? getWMOInfo(code).iconName : 'Cloud');

  switch (name) {
    case 'Sun':
      return <Sun className={className} {...props} />;
    case 'SunMedium':
      return <SunMedium className={className} {...props} />;
    case 'CloudSun':
      return <CloudSun className={className} {...props} />;
    case 'Cloud':
      return <Cloud className={className} {...props} />;
    case 'CloudFog':
      return <CloudFog className={className} {...props} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={className} {...props} />;
    case 'CloudRain':
      return <CloudRain className={className} {...props} />;
    case 'CloudRainWind':
      return <CloudRainWind className={className} {...props} />;
    case 'CloudHail':
      return <CloudHail className={className} {...props} />;
    case 'CloudSnow':
      return <CloudSnow className={className} {...props} />;
    case 'Snowflake':
      return <Snowflake className={className} {...props} />;
    case 'CloudLightning':
      return <CloudLightning className={className} {...props} />;
    default:
      return <Cloud className={className} {...props} />;
  }
};
