import React, { useEffect, useState } from 'react';
import './WeatherWidget.css';
import API from '../../api';

function WeatherWidget({ city = 'Colombo' }) {
  const [weather, setWeather] = useState(null);
  const [advice, setAdvice] = useState('');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await API.get(`/api/weather?city=${city}`);
        const { current, forecast } = res.data;

        setWeather({
          temp: Math.round(current.main.temp),
          condition: current.weather[0].main.toLowerCase(),
          icon: current.weather[0].icon
        });

        const nextHours = forecast.list.slice(0, 6);
        const rainSoon = nextHours.some(item =>
          item.weather[0].main.toLowerCase().includes('rain')
        );
        const snowSoon = nextHours.some(item =>
          item.weather[0].main.toLowerCase().includes('snow')
        );

        if (rainSoon) setAdvice('🌧️ Rain expected soon! Grab an umbrella before heading to hall.');
        else if (snowSoon) setAdvice('❄️ Snow incoming! Dress warmly before heading out.');
        else setAdvice('☀️ Weather looks clear. You are good to go!');
      } catch (err) {
        console.error('Weather fetch error:', err);
        setAdvice('⚠️ Unable to fetch weather.');
      }
    };

    fetchWeather();
  }, [city]);

  if (!weather) return <p className="weather-loading">Loading weather...</p>;

  return (
    <div className={`weather-widget weather-${weather.condition}`}>
      <div className="weather-info">
        <h3>{city}</h3>
        <p className="weather-temp">{weather.temp}°C</p>
        <p className="weather-condition">{weather.condition}</p>
        <p className="weather-advice">{advice}</p>
      </div>
    </div>
  );
}

export default WeatherWidget;
