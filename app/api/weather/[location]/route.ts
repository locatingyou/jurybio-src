export async function GET(
  request: Request,
  { params }: { params: Promise<{ location: string }> },
) {
  const { location } = await params;
  const apiKey = process.env.WEATHER_API_KEY;
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=no`,
      { next: { revalidate: 0 } },
    );
    const json = await response.json();

    if (!response.ok || !json.current || !json.location) {
      return Response.json(
        { error: json.error?.message ?? "Failed to fetch weather" },
        { status: response.status === 200 ? 502 : response.status },
      );
    }

    const data = {
      location: json.location.name,
      region: json.location.region,
      country: json.location.country,
      temperatureC: json.current.temp_c,
      temperatureF: json.current.temp_f,
      feelsLikeC: json.current.feelslike_c,
      feelsLikeF: json.current.feelslike_f,
      condition: json.current.condition.text,
      humidity: json.current.humidity,
      windSpeed: json.current.wind_kph,
      icon: `https:${json.current.condition.icon}`,
    };
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
