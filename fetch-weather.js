async function getCoordinates() {
    if(navigator.geolocation) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    console.log(position.coords.accuracy + " meters");
                },
                () => {
                    reject('Geolocation permission denied or unavailable.');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    } else {
        throw new Error('Geolocation is not supported by this browser.');
    }
}

function getDayAndTime() {
    const now=new Date();
    const day= new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now);
    const time= new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true , timeZone:"Asia/Kolkata"}).format(now);
    return { day, time };
}

async function getCityname() {
    const { latitude, longitude } = await getCoordinates();
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
    const data = await res.json();
    const state = data.address.state || "Unknown";
    const address = data.address.village || data.address.town || data.address.city || "Unknown";
    return { address, state };
}

async function fetchWeather() {
    const { latitude, longitude } = await getCoordinates();
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise&timezone=auto`);
    const data = await res.json();
    
    const temp = data.current.temperature_2m;
    const humidity = data.current.relative_humidity_2m;
    const windSpeed = data.current.wind_speed_10m;
    const weatherCode = data.current.weather_code;
    const maxTemp = data.daily.temperature_2m_max[0];
    const minTemp = data.daily.temperature_2m_min[0];
    const sunrise = data.daily.sunrise[0];
    const forecastTemps = [
        data.hourly.temperature_2m[9],
        data.hourly.temperature_2m[12],
        data.hourly.temperature_2m[15],
        data.hourly.temperature_2m[18],
        data.hourly.temperature_2m[21]
    ];

    const forecastWeatherCodes = [
        data.hourly.weather_code[9],
        data.hourly.weather_code[12],
        data.hourly.weather_code[15],
        data.hourly.weather_code[18],
        data.hourly.weather_code[21]
    ];
    console.log('Forecast weather codes:', forecastWeatherCodes);
    return {
        temp,
        humidity,
        windSpeed,
        weatherCode,
        maxTemp,
        minTemp,
        sunrise,
        forecastTemps,
        forecastWeatherCodes
    };
}

function getWeatherIcon(weatherCode) {
    const icons = {
        0: "☀️",
        1: "🌤️",
        2: "⛅️",
        3: "☁️",
        45: "🌫️",
        48: "🌫️",
        51: "🌦️",
        53: "🌦️",
        55: "🌧️",
        56: "🌧️",
        57: "🌧️",
        61: "🌦️",
        63: "🌧️",
        65: "🌧️",
        66: "🌧️",
        67: "🌧️",
        71: "🌨️",
        73: "🌨️",
        75: "❄️",
        77: "❄️",
        80: "🌦️",
        81: "🌧️",
        82: "🌧️",
        85: "🌨️",
        86: "❄️",
        95: "⛈️",
        96: "⛈️",
        99: "⛈️"
    };
    return icons[weatherCode] || "❔";
}

function getCondition(weatherCode) {
    const conditions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Light freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snow fall",
        73: "Moderate snow fall",
        75: "Heavy snow fall",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
    };
    return conditions[weatherCode] || "Unknown";
}

async function updateUI(weatherData) {
    let city = await getCityname();
    document.querySelector('.city-state').textContent = `${city.address}, ${city.state}`;

    const { day, time } = getDayAndTime();
    document.querySelector('.day-time').textContent = `${day}, ${time}`;

    const tempElement = document.querySelector('.current-temp');
    tempElement.innerHTML = `${Math.round(weatherData.temp)}<span class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-orange-500 align-super">°</span>`;

    document.querySelector('.weather-icon').textContent = getWeatherIcon(weatherData.weatherCode);

    document.querySelector('.high-low').textContent = `${Math.round(weatherData.maxTemp)}° / ${Math.round(weatherData.minTemp)}°`;

    document.querySelector('.wind').textContent = `${Math.round(weatherData.windSpeed)} km/h`;

    document.querySelector('.humidity').textContent = `${weatherData.humidity}%`;

    document.querySelector('.weather-condition').textContent = getCondition(weatherData.weatherCode);

    const sunriseTime = new Intl.DateTimeFormat('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    }).format(new Date(weatherData.sunrise));
    document.querySelector('.sunrise').textContent = sunriseTime;

    if (weatherData.forecastTemps && weatherData.forecastTemps.length === 5) {
        console.log('Forecast temps:', weatherData.forecastTemps);
        document.querySelector('.temp-9am').textContent = `${Math.round(weatherData.forecastTemps[0])}°`;
        document.querySelector('.temp-12pm').textContent = `${Math.round(weatherData.forecastTemps[1])}°`;
        document.querySelector('.temp-3pm').textContent = `${Math.round(weatherData.forecastTemps[2])}°`;
        document.querySelector('.temp-6pm').textContent = `${Math.round(weatherData.forecastTemps[3])}°`;
        document.querySelector('.temp-9pm').textContent = `${Math.round(weatherData.forecastTemps[4])}°`;
        console.log('Forecast temps updated successfully');
    } else {
        console.warn('Forecast temps not available or incorrect length:', weatherData.forecastTemps);
    }

    if (weatherData.forecastWeatherCodes && weatherData.forecastWeatherCodes.length === 5) {
        console.log('Forecast weather codes:', weatherData.forecastWeatherCodes);
        document.querySelector('.icon-9am').textContent = getWeatherIcon(weatherData.forecastWeatherCodes[0]);
        document.querySelector('.icon-12pm').textContent = getWeatherIcon(weatherData.forecastWeatherCodes[1]);
        document.querySelector('.icon-3pm').textContent = getWeatherIcon(weatherData.forecastWeatherCodes[2]);
        document.querySelector('.icon-6pm').textContent = getWeatherIcon(weatherData.forecastWeatherCodes[3]);
        document.querySelector('.icon-9pm').textContent = getWeatherIcon(weatherData.forecastWeatherCodes[4]);
        console.log('Forecast weather icons updated successfully');
    } else {
        console.warn('Forecast weather codes not available or incorrect length:', weatherData.forecastWeatherCodes);
    }

}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('button').addEventListener('click', async () => {
        try {
            const weatherData = await fetchWeather();
            updateUI(weatherData);
        } catch (error) {
            console.error('Error fetching weather:', error);
            alert('Failed to fetch weather data. Please try again.');
        }
    });
});