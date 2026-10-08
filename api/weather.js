/**
 * GET /api/weather?city=London
 * Server-side proxy: keeps WEATHER_API_KEY out of the browser bundle.
 */
export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const city = typeof request.query.city === "string" ? request.query.city.trim() : "";
  if (!city) return response.status(400).json({ error: "A city is required." });
  if (!process.env.WEATHER_API_KEY) {
    return response.status(500).json({ error: "Weather service is not configured." });
  }

  try {
    const params = new URLSearchParams({ key: process.env.WEATHER_API_KEY, q: city });
    const weatherResponse = await fetch(`https://api.weatherapi.com/v1/current.json?${params}`);
    const data = await weatherResponse.json();
    return response.status(weatherResponse.status).json(data);
  } catch {
    return response.status(502).json({ error: "Could not reach the weather service. Please try again." });
  }
}
