import { useEffect, useRef, useState } from 'react'
function Weather(){
    const inputRef = useRef();
    const [weatherData, setWeatherData] = useState(null);
    const [locData, setLocData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [animate, setAnimate] = useState(false);
    const [unit, setUnit] = useState('metric');
    const [localTime, setLocalTime] = useState('');

    const getLocalTime = (timezoneOffsetInSeconds) => {
        const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
        const localTime = new Date(nowUTC.getTime() + timezoneOffsetInSeconds * 1000);
        return localTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
    }

    const search = async (city) => {
        setAnimate(false);
        try{
            const cur_url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${import.meta.env.VITE_APP_ID}`;
            const cur_response = await fetch(cur_url);
            const cur_data = await cur_response.json();

            const loc_url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${import.meta.env.VITE_APP_ID}`
            const loc_response = await fetch(loc_url);
            const loc_data = await loc_response.json();

            const forecast_url = `https://api.openweathermap.org/data/2.5/forecast?lat=${cur_data.coord.lat}&lon=${cur_data.coord.lon}&appid=${import.meta.env.VITE_APP_ID}&units=${unit}`;
            const forecast_response = await fetch(forecast_url);
            const forecast_data = await forecast_response.json();

            console.log(cur_data);
            console.log(loc_data);
            console.log(forecast_data.list);

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

            const dailyForecast = forecast_data.list.filter(itme => itme.dt_txt.includes("06:00:00")).slice(0, 5);

            const formattedData = dailyForecast.map(itme => {
                const date = new Date(itme.dt * 1000);
                const options = {weekday: 'short', day: 'numeric', month: 'short'};
                return {
                    date: date.toLocaleDateString(undefined, options),
                    temp: Math.round(itme.main.temp),
                    icon: itme.weather[0].icon,
                    description: itme.weather[0].description
                };
            });

            setForecastData(formattedData);

            setTimeout(() => {
                setAnimate(true);
            },50)

        }
        catch(error) {

        }
    };

    useEffect(()=> {
        search('Navi Mumbai')
    }, []);

    useEffect(() => {
        if (!weatherData) return;

        const updatTime = () => {
            setLocalTime(getLocalTime(weatherData.timezone));
        };

        updatTime();
        const intervalId = setInterval(updatTime, 60000);
        return () => clearInterval(intervalId);
    })

    useEffect(() => {
        const city = inputRef.current?.value || 'Navi Mumbai';
        search(city);
    }, [unit]);

            if (!weatherData || !locData || !forecastData) {
                return <p style={{ padding: "2rem" }}>Loading weather data...</p>;
            }

        
    return(
        <div>
        <div className="navbar poppins-medium">
            <div className="navbar-left heading">
                <h1>🌈 HeySky</h1>
            </div>
            <div class="navbar-right search-bar">
                <input type="text" id="search" placeholder="Search City" ref={inputRef} onKeyDown={(e) => {
                    if (e.key == 'Enter') {
                        search(inputRef.current.value);
                    }
                }}/>
                <button className="search-btn" onClick={() => search(inputRef.current.value)}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg></button>
            </div>
        </div>
        <div className='poppins-medium'>
            <div className='unit-toggle'>
                <button onClick={() => {
                const newUnit = unit === 'metric' ? 'imperial' : 'metric';
                setUnit(newUnit);
            }}>
                {unit === 'metric'? '°C → °F': '°F → °C'}
            </button>
            </div>
            
            <div className={`weather-header top-container ${animate? 'fade-in': ''}`}>
                <div className='location-info'>
                    <div className='main-location'>
                        <h1>{weatherData.name}</h1>
                        <h3>{locData.state}</h3> 
                    </div>                
                    <p className='coords'>Latitude: {weatherData.lat}</p>
                    <p className='coords'>Longitude: {weatherData.lon}</p>
                    <p className='local-time'>{localTime}</p>
                </div>
                <div className='icon-weather'>
                    <p className='temp'>{weatherData.temp}{unit === 'metric' ? '°C' : '°F'}</p>
                    <div className='weather-info'>
                        <img src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`} alt='weather-icon' />
                        <p className='description'>{weatherData.description}</p>
                    </div> 
                </div>
            </div>
            <div className={`temp-header container ${animate? 'fade-in': ''}`}>
                <div>
                    <h2>🌡Temperature</h2>
                </div>
                <div className='temp-info'>
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
            <div className={`weather-cards ${animate? 'fade-in': ''}`}>
                <div className='weather-card'>
                    <h3 className='title'>Humidity</h3>
                    <div className='content'>
                        <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" fill="#fff"><path d="M491-200q12-1 20.5-9.5T520-230q0-14-9-22.5t-23-7.5q-41 3-87-22.5T343-375q-2-11-10.5-18t-19.5-7q-14 0-23 10.5t-6 24.5q17 91 80 130t127 35ZM480-80q-137 0-228.5-94T160-408q0-100 79.5-217.5T480-880q161 137 240.5 254.5T800-408q0 140-91.5 234T480-80Zm0-80q104 0 172-70.5T720-408q0-73-60.5-165T480-774Q361-665 300.5-573T240-408q0 107 68 177.5T480-160Zm0-320Z"/></svg> 
                        <h2>{weatherData.humidity}</h2>
                    </div>
                </div>
                <div className='weather-card'>
                    <h3 className='title'>Pressure</h3>
                    <div className='content'>
                        <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#fff"><path d="m317-160-42-42 121-121H80v-60h316L275-504l42-42 193 193-193 193Zm326-254L450-607l193-193 42 42-121 121h316v60H564l121 121-42 42Z"/></svg>
                        <h2>{weatherData.pressure}</h2><p>hpa</p>

                    </div>
                </div>
                <div className='weather-card'>
                    <h3 className='title'>Sea Level</h3>
                    <div className='content'>
                        <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#fff"><path d="M80-251v-60q38 0 61.5-23t68.5-23q45 0 70 27t64 27q39 0 65-27t71-27q45 0 70.5 27t64.5 27q39 0 64.5-27t70.5-27q45 0 68.5 23t61.5 23v60q-47 0-69.5-23T750-297q-38 0-64 27t-71 27q-45 0-71-27t-64-27q-38 0-64.5 27T344-243q-45 0-70.5-27T210-297q-38 0-60.5 23T80-251Zm0-160v-60q38 0 61.5-23t68.5-23q45 0 70 27t64 27q39 0 65-27t71-27q45 0 70.5 27t64.5 27q39 0 64.5-27t70.5-27q45 0 68.5 23t61.5 23v60q-47 0-69.5-23T750-457q-38 0-64 27t-71 27q-45 0-71-27t-64-27q-38 0-64.5 27T344-403q-45 0-70.5-27T210-457q-38 0-60.5 23T80-411Zm0-160v-60q38 0 61.5-23t68.5-23q45 0 70 27t64 27q39 0 65-27t71-27q45 0 70.5 27t64.5 27q39 0 64.5-27t70.5-27q45 0 68.5 23t61.5 23v60q-47 0-69.5-23T750-617q-38 0-64 27t-71 27q-45 0-71-27t-64-27q-38 0-64.5 27T344-563q-45 0-70.5-27T210-617q-38 0-60.5 23T80-571Z"/></svg>
                        <h2>{weatherData.seaLevel}</h2>
                    </div>
                </div>
                <div className='weather-card'>
                    <h3 className='title'>Wind Speed</h3>
                    <div className='content'>
                        <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" fill="#fff">
                    <path d="M460-160q-50 0-85-35t-35-85h80q0 17 11.5 28.5T460-240q17 0 28.5-11.5T500-280q0-17-11.5-28.5T460-320H80v-80h380q50 0 85 35t35 85q0 50-35 85t-85 35ZM80-560v-80h540q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43h-80q0-59 40.5-99.5T620-840q59 0 99.5 40.5T760-700q0 59-40.5 99.5T620-560H80Zm660 320v-80q26 0 43-17t17-43q0-26-17-43t-43-17H80v-80h660q59 0 99.5 40.5T880-380q0 59-40.5 99.5T740-240Z"/>
                    </svg> 
                    <h2>{weatherData.wind}</h2>
                    <p>{unit === 'metric' ? 'm/s' : 'mph'}</p>
                    </div>
                </div>
            </div>
            {forecastData && (
                <div className='forecast-section'>
                <h3 style={{padding: '1rem'}}>5-Day Forecast</h3>
                <div className='forecast-cards'>
                    {forecastData.map((day,index) => (
                        <div key={index} className='forecast-card'>
                            <h4>{day.date}</h4>
                            <img src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} alt={day.description}  />
                            <p>{day.description}</p>
                            <h2 className='forecast-temp'>{day.temp}{unit === 'metric' ? '°C' : '°F'}</h2>
                        </div>
                    ))}
                </div>
            </div>
            )}
            
        </div>
        </div>
    )
}
export default Weather