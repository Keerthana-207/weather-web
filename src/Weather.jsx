import { useEffect, useRef, useState } from 'react';

function Weather() {
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(null);
  const [locData, setLocData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [unit, setUnit] = useState('metric');
  const [localTime, setLocalTime] = useState('');

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const getLocalTime = (timezoneOffsetInSeconds) => {
    const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
    const localTime = new Date(nowUTC.getTime() + timezoneOffsetInSeconds * 1000);
    return localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const search = async (city) => {
    setAnimate(false);
    try {
      const [weatherRes, forecastRes, geoRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`),
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`)
      ]);

      const cur_data = await weatherRes.json();
      const forecast_data = await forecastRes.json();
      const loc_data = await geoRes.json();

      setWeatherData({
        name: cur_data.name,
        humidity: cur_data.main.humidity,
        tempFeel: cur_data.main.feels_like,
        pressure: cur_data.main.pressure,
        temp: Math.floor(cur_data.main.temp),
        icon: cur_data.weather[0].icon,
        description: cur_data.weather[0].description,
        lat: cur_data.coord.lat,
        lon: cur_data.coord.lon,
        seaLevel: cur_data.main.sea_level,
        tempMax: cur_data.main.temp_max,
        tempMin: cur_data.main.temp_min,
        wind: cur_data.wind.speed,
        timezone: cur_data.timezone
      });

      setLocData({
        state: loc_data[0]?.state || 'Unknown',
      });

      const dailyForecast = forecast_data.list
        .filter(item => item.dt_txt.includes("06:00:00"))
        .slice(0, 5);

      const formattedData = dailyForecast.map(item => {
        const date = new Date(item.dt * 1000);
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return {
          date: date.toLocaleDateString(undefined, options),
          temp: Math.round(item.main.temp),
          icon: item.weather[0].icon,
          description: item.weather[0].description
        };
      });

      setForecastData(formattedData);
      setTimeout(() => setAnimate(true), 50);

    } catch (error) {
      console.error("Failed to fetch weather data", error);
    }
  };

  useEffect(() => {
    search('Navi Mumbai');
  }, []);

  useEffect(() => {
    if (!weatherData) return;
    const updateTime = () => setLocalTime(getLocalTime(weatherData.timezone));
    updateTime();
    const intervalId = setInterval(updateTime, 60000);
    return () => clearInterval(intervalId);
  }, [weatherData]);

  useEffect(() => {
    const city = inputRef.current?.value || 'Navi Mumbai';
    search(city);
  }, [unit]);

  if (!weatherData || !locData || !forecastData) {
    return <p style={{ padding: "2rem" }}>Loading weather data...</p>;
  }

  return (
    <div>
      <div className="navbar poppins-medium">
        <div className="navbar-left heading">
          <h1>🌈 HeySky</h1>
        </div>
        <div className="navbar-right search-bar">
          <input
            type="text"
            id="search"
            placeholder="Search City"
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                search(inputRef.current.value);
              }
            }}
          />
          <button className="search-btn" onClick={() => search(inputRef.current.value)}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff">
              <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="poppins-medium">
        <div className="unit-toggle">
          <button onClick={() => {
            const newUnit = unit === 'metric' ? 'imperial' : 'metric';
            setUnit(newUnit);
          }}>
            {unit === 'metric' ? '°C → °F' : '°F → °C'}
          </button>
        </div>

        <div className={`weather-header top-container ${animate ? 'fade-in' : ''}`}>
          <div className="location-info">
            <div className="main-location">
              <h1>{weatherData.name}</h1>
              <h3>{locData.state}</h3>
            </div>
            <p className="coords">Latitude: {weatherData.lat}</p>
            <p className="coords">Longitude: {weatherData.lon}</p>
            <p className="local-time">{localTime}</p>
          </div>
          <div className="icon-weather">
            <p className="temp">{weatherData.temp}{unit === 'metric' ? '°C' : '°F'}</p>
            <div className="weather-info">
              <img src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`} alt="weather-icon" />
              <p className="description">{weatherData.description}</p>
            </div>
          </div>
        </div>

        {/* Temperature Info */}
        <div className={`temp-header container ${animate ? 'fade-in' : ''}`}>
          <div>
            <h2>🌡Temperature</h2>
          </div>
          <div className="temp-info">
            <div>
              <h2>{weatherData.tempFeel}{unit === 'metric' ? '°C' : '°F'}</h2>
              <p>Feels Like</p>
            </div>
            <div>
              <h2>{weatherData.tempMin}{unit === 'metric' ? '°C' : '°F'}</h2>
              <p>Minimum</p>
            </div>
            <div>
              <h2>{weatherData.tempMax}{unit === 'metric' ? '°C' : '°F'}</h2>
              <p>Maximum</p>
            </div>
          </div>
        </div>

        {/* Weather Cards (Humidity, Pressure, Sea Level, Wind) */}
        <div className={`weather-cards ${animate ? 'fade-in' : ''}`}>
          {/* Cards... (unchanged, as per your original structure) */}
          {/* You can copy them from your current file if you didn't change styles/icons. */}
        </div>

        {/* Forecast */}
        {forecastData && (
          <div className="forecast-section">
            <h3 style={{ padding: '1rem' }}>5-Day Forecast</h3>
            <div className="forecast-cards">
              {forecastData.map((day, index) => (
                <div key={index} className="forecast-card">
                  <h4>{day.date}</h4>
                  <img src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} alt={day.description} />
                  <p>{day.description}</p>
                  <h2 className="forecast-temp">{day.temp}{unit === 'metric' ? '°C' : '°F'}</h2>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Weather;
