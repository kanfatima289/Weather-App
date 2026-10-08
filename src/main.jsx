import { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const POPULAR_CITIES = ["New York", "London", "Tokyo", "Paris", "Dubai", "Singapore", "Mumbai", "Sydney", "Toronto", "Cape Town"];

function moodFor({ temp_c: temp, humidity, wind_kph: wind }) {
  if (temp >= 35 || (temp >= 30 && humidity >= 70)) return { label: "Hot", icon: "☀", detail: "High heat conditions" };
  if (temp < 10) return { label: "Cold", icon: "❄", detail: "Bundle up outside" };
  if (wind >= 35) return { label: "Windy", icon: "〰", detail: "Strong winds reported" };
  if (humidity >= 85 || (humidity >= 75 && temp >= 27)) return { label: "Uncomfortable", icon: "≈", detail: "Humidity is elevated" };
  return { label: "Pleasant", icon: "✦", detail: "Comfortable conditions" };
}

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function getWeather(nextCity) {
    const query = nextCity.trim();
    if (!query) return setError("Enter a city name to see its weather.");
    setCity(query); setStatus("loading"); setError(""); setWeather(null);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || data.error || "Weather is unavailable for this city.");
      setWeather(data); setStatus("success");
    } catch (err) { setError(err.message); setStatus("error"); }
  }

  const current = weather?.current;
  const mood = current && moodFor(current);
  return <main>
    <section className="hero">
      <p className="eyebrow">LIVE CONDITIONS, CLEARLY EXPLAINED</p>
      <h1>Find the forecast.<br /><em>Feel the mood.</em></h1>
      <form onSubmit={(e) => { e.preventDefault(); getWeather(city); }} className="search">
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Search a city…" aria-label="City name" />
        <button disabled={status === "loading"}>{status === "loading" ? "Searching…" : "Check weather"}</button>
      </form>
      <div className="chips" aria-label="Popular cities">{POPULAR_CITIES.map((item) => <button key={item} onClick={() => getWeather(item)} disabled={status === "loading"}>{item}</button>)}</div>
    </section>

    {error && <div className="notice error" role="alert">{error}</div>}
    {status === "loading" && <div className="notice loading">Fetching live weather data…</div>}

    {weather && <section className="results" aria-live="polite">
      <article className="weather-card">
        <div className="place"><div><p>NOW IN</p><h2>{weather.location.name}, {weather.location.country}</h2></div><span>{weather.current.condition.text}</span></div>
        <div className="temperature"><strong>{Math.round(current.temp_c)}°</strong><span>Celsius<br />feels like {Math.round(current.feelslike_c)}°</span></div>
        <div className="metrics"><div><span>HUMIDITY</span><b>{current.humidity}%</b></div><div><span>WIND SPEED</span><b>{Math.round(current.wind_kph)} <small>km/h</small></b></div><div><span>LOCAL TIME</span><b>{weather.location.localtime.split(" ")[1]}</b></div></div>
      </article>
      <article className="mood-card"><span className="mood-icon">{mood.icon}</span><p>WEATHER MOOD</p><h2>{mood.label}</h2><span>{mood.detail}</span><div className="thresholds">Hot ≥35°C or ≥30°C + ≥70% humidity · Cold &lt;10°C · Windy ≥35 km/h · Uncomfortable ≥85% humidity or ≥75% + ≥27°C · otherwise Pleasant</div></article>
    </section>}
    <footer>Data from WeatherAPI.com · Temperature in °C · Updated when you search</footer>
  </main>;
}

createRoot(document.getElementById("root")).render(<App />);
