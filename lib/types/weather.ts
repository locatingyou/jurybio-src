export interface WeatherData {
  location: string;
  region: string;
  country: string;
  temperatureC: number;
  temperatureF: number;
  feelsLikeC: number;
  feelsLikeF: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface WeatherResponse {
  data?: WeatherData;
  error?: string;
}
