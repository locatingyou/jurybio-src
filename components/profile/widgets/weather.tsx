"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { WeatherData } from "@/lib/types/weather";

export type TemperatureUnit = "celsius" | "fahrenheit";

export type WeatherWidgetOptions = {
  show_feels_like: boolean;
  temperature_unit: TemperatureUnit;
  show_location: boolean;
  show_condition: boolean;
};

export default function WeatherWidget({
  location,
  options,
  textColor = "#ffffff",
  secondaryTextColor = "rgba(255,255,255,0.6)",
}: {
  location?: string;
  options: WeatherWidgetOptions;
  textColor?: string;
  secondaryTextColor?: string;
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!location) {
      setWeather(null);
      return;
    }

    let cancelled = false;

    fetch(`/api/weather/${encodeURIComponent(location)}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.data) {
          setWeather(json.data);
          setError(false);
        } else {
          setWeather(null);
          setError(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWeather(null);
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [location]);

  if (!location) {
    return (
      <p style={{ color: secondaryTextColor }} className="text-xs">
        Enter a location to preview
      </p>
    );
  }

  if (error || !weather) return null;

  const isFahrenheit = options.temperature_unit === "fahrenheit";
  const unitLabel = isFahrenheit ? "°F" : "°C";
  const temperature = isFahrenheit
    ? weather.temperatureF
    : weather.temperatureC;
  const feelsLike = isFahrenheit ? weather.feelsLikeF : weather.feelsLikeC;

  return (
    <section className="flex flex-row items-center justify-between w-full h-full min-w-0">
      <div className="flex flex-row items-center min-w-0">
        <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-white/5">
          {weather.icon && (
            <Image
              src={weather.icon}
              alt={weather.condition}
              fill
              sizes="56px"
              className="object-contain"
            />
          )}
        </div>
        <div className="flex flex-col justify-center ml-3 min-w-0">
          <h1
            style={{ color: textColor }}
            className="text-sm font-semibold truncate"
          >
            {Math.round(temperature)}
            {unitLabel}
            {options.show_condition && ` · ${weather.condition}`}
          </h1>
          <p
            style={{ color: secondaryTextColor }}
            className="text-xs flex flex-row gap-2"
          >
            {options.show_location && (
              <span className="truncate">
                {weather.location}, {weather.region}
              </span>
            )}
            {options.show_feels_like && (
              <span className="shrink-0">
                Feels like {Math.round(feelsLike)}
                {unitLabel}
              </span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
