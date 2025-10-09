import { useEffect, useRef, useState } from 'react';

function Weather() {
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(null);
  const [locData, setLocData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [unit, setUnit] = useState('metric');
  const [localTime, setLocalTime] = useState('');

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

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
            <h1 className="temp">{weatherData.temp}{unit === 'metric' ? '°C' : '°F'}</h1>
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
          <div className='weather-card'>
            <h3>Humidity</h3>
            <div className='content'>
              <svg xmlns="http://www.w3.org/2000/svg" height="75px" viewBox="0 -960 960 960" width="75px" fill="#fff"><path d="M479-208q16 0 24.5-5.5T512-230q0-11-8.5-17t-25.5-6q-42 0-85.5-26.5T337-373q-2-9-9-14.5t-15-5.5q-11 0-17 8.5t-4 17.5q15 84 71 121.5T479-208Zm1 128q-137 0-228.5-94T160-408q0-100 79.5-217.5T480-880q161 137 240.5 254.5T800-408q0 140-91.5 234T480-80Zm0-60q112 0 186-76.5T740-408q0-79-66.5-179.5T480-800Q353-688 286.5-587.5T220-408q0 115 74 191.5T480-140Zm0-340Z"/></svg>
              <h2>{weatherData.humidity}</h2>
            </div>
          </div>
          <div className='weather-card'>
            <h3>Pressure</h3>
            <div className='content'>
              <svg xmlns="http://www.w3.org/2000/svg" height="75px" viewBox="0 -960 960 960" width="75px" fill="#fff"><path d="m317-160-42-42 121-121H80v-60h316L275-504l42-42 193 193-193 193Zm326-254L450-607l193-193 42 42-121 121h316v60H564l121 121-42 42Z"/></svg>
              <h2>{weatherData.pressure}</h2>
            </div>
          </div>
          <div className='weather-card'>
            <h3>Sea Level</h3>
            <div className='content'>
              <svg xmlns="http://www.w3.org/2000/svg" height="75px" viewBox="0 -960 960 960" width="75px" fill="#fff"><path d="M80-251v-60q38 0 61.5-23t68.5-23q45 0 70 27t64 27q39 0 65-27t71-27q45 0 70.5 27t64.5 27q39 0 64.5-27t70.5-27q45 0 68.5 23t61.5 23v60q-47 0-69.5-23T750-297q-38 0-64 27t-71 27q-45 0-71-27t-64-27q-38 0-64.5 27T344-243q-45 0-70.5-27T210-297q-38 0-60.5 23T80-251Zm0-160v-60q38 0 61.5-23t68.5-23q45 0 70 27t64 27q39 0 65-27t71-27q45 0 70.5 27t64.5 27q39 0 64.5-27t70.5-27q45 0 68.5 23t61.5 23v60q-47 0-69.5-23T750-457q-38 0-64 27t-71 27q-45 0-71-27t-64-27q-38 0-64.5 27T344-403q-45 0-70.5-27T210-457q-38 0-60.5 23T80-411Zm0-160v-60q38 0 61.5-23t68.5-23q45 0 70 27t64 27q39 0 65-27t71-27q45 0 70.5 27t64.5 27q39 0 64.5-27t70.5-27q45 0 68.5 23t61.5 23v60q-47 0-69.5-23T750-617q-38 0-64 27t-71 27q-45 0-71-27t-64-27q-38 0-64.5 27T344-563q-45 0-70.5-27T210-617q-38 0-60.5 23T80-571Z"/></svg>
              <h2>{weatherData.seaLevel}</h2>
            </div>
          </div>
          <div className='weather-card'>
            <h3>Wind</h3>
            <div className='content'>
              <svg xmlns="http://www.w3.org/2000/svg" height="75px" viewBox="0 -960 960 960" width="75px" fill="#fff"><path d="M465-160q-54 0-85.5-28T348-273h68q0 26 11.5 39.5T465-220q27 0 38.5-12t11.5-41q0-29-11.5-42.5T465-329H80v-60h385q54 0 82 28t28 88q0 57-28 85t-82 28ZM80-568v-60h548q37 0 54-17.5t17-58.5q0-41-17-58.5T628-780q-38 0-55 20.5T556-708h-60q0-58 35-95t97-37q61 0 96 35.5T759-704q0 65-35 100.5T628-568H80Zm672 330v-60q35 0 51.5-19.5T820-374q0-38-18.5-55T748-446H80v-60h668q62 0 97 35t35 97q0 64-33 100t-95 36Z"/></svg>
              <h2>{weatherData.wind}</h2>
            </div>
          </div>
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
