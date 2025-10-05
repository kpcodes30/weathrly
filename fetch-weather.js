async function getCoordinates() {
    console.log('Starting geolocation request...');
    if(navigator.geolocation) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => {
                    console.log('Geolocation successful');
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    let errorMessage = 'Unable to get your location. ';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Please allow location access.';
                            console.log('Permission denied by user');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Location information unavailable.';
                            console.log('Position unavailable');
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'Location request timed out.';
                            console.log('Request timeout');
                            break;
                        default:
                            errorMessage += 'Unknown error occurred.';
                            console.log('Unknown error');
                    }
                    reject(errorMessage);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 15000,
                    maximumAge: 60000
                }
            );
        });
    } else {
        console.error('Geolocation not supported');
        throw new Error('Geolocation is not supported by this browser.');
    }
}

function getDayAndTime() {
    console.log('Getting current day and time...');
    const now=new Date();
    const day= new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now);
    const time= new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true , timeZone:"Asia/Kolkata"}).format(now);
    console.log('Current day and time retrieved');
    return { day, time };
}

async function getCityname() {
    console.log('Fetching city name...');
    try {
        const { latitude, longitude } = await getCoordinates();
        console.log('Calling reverse geocoding API...');
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
            headers: {
                'User-Agent': 'Weathrly-App'
            }
        });
        if (!res.ok) {
            console.error('Reverse geocoding API failed');
            throw new Error('Failed to fetch location name');
        }
        const data = await res.json();
        console.log('Received location data');
        const state = data.address.state || "Unknown";
        const address = data.address.village || data.address.town || data.address.city || "Unknown";
        console.log('City name resolved');
        return { address, state };
    } catch (error) {
        console.error('Error getting city name:', error);
        return { address: "Unknown", state: "Location" };
    }
}

async function fetchWeather() {
    console.log('Fetching weather data...');
    const { latitude, longitude } = await getCoordinates();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise&timezone=auto`;
    
    console.log('Calling weather API...');
    const res = await fetch(url);
    if (!res.ok) {
        console.error('Weather API failed');
        throw new Error('Weather API error');
    }
    
    console.log('Parsing weather data...');
    const data = await res.json();
    
    const temp = data.current.temperature_2m;
    const humidity = data.current.relative_humidity_2m;
    const windSpeed = data.current.wind_speed_10m;
    const weatherCode = data.current.weather_code;
    const maxTemp = data.daily.temperature_2m_max[0];
    const minTemp = data.daily.temperature_2m_min[0];
    const sunrise = data.daily.sunrise[0];
    
    console.log('Current weather data extracted');
    console.log('Daily stats extracted');
    
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
    console.log('Forecast data extracted');
    console.log('Weather data fetched successfully');
    
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
    console.log('Getting weather icon');
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
    const icon = icons[weatherCode] || "❔";
    console.log('Icon resolved');
    return icon;
}

function getCondition(weatherCode) {
    console.log('Getting weather condition');
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
    const condition = conditions[weatherCode] || "Unknown";
    console.log('Condition resolved');
    return condition;
}

async function updateUI(weatherData) {
    console.log('Starting UI update...');
    console.log('Fetching city name for UI...');
    let city = await getCityname();
    console.log('Updating city-state display');
    document.querySelector('.city-state').textContent = `${city.address}, ${city.state}`;

    console.log('Updating day and time display');
    const { day, time } = getDayAndTime();
    document.querySelector('.day-time').textContent = `${day}, ${time}`;

    console.log('Updating temperature display');
    const tempElement = document.querySelector('.current-temp');
    tempElement.innerHTML = `${Math.round(weatherData.temp)}<span class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-orange-500 align-super">°</span>`;

    console.log('Updating main weather icon');
    document.querySelector('.weather-icon').textContent = getWeatherIcon(weatherData.weatherCode);

    console.log('Updating high/low temperatures');
    document.querySelector('.high-low').textContent = `${Math.round(weatherData.maxTemp)}° / ${Math.round(weatherData.minTemp)}°`;

    console.log('Updating wind speed');
    document.querySelector('.wind').textContent = `${Math.round(weatherData.windSpeed)} km/h`;

    console.log('Updating humidity');
    document.querySelector('.humidity').textContent = `${weatherData.humidity}%`;

    console.log('Updating weather condition');
    document.querySelector('.weather-condition').textContent = getCondition(weatherData.weatherCode);

    console.log('Updating sunrise time');
    const sunriseTime = new Intl.DateTimeFormat('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    }).format(new Date(weatherData.sunrise));
    document.querySelector('.sunrise').textContent = sunriseTime;

    console.log('Updating forecast temperatures...');
    if (weatherData.forecastTemps && weatherData.forecastTemps.length === 5) {
        document.querySelector('.temp-9am').textContent = `${Math.round(weatherData.forecastTemps[0])}°`;
        document.querySelector('.temp-12pm').textContent = `${Math.round(weatherData.forecastTemps[1])}°`;
        document.querySelector('.temp-3pm').textContent = `${Math.round(weatherData.forecastTemps[2])}°`;
        document.querySelector('.temp-6pm').textContent = `${Math.round(weatherData.forecastTemps[3])}°`;
        document.querySelector('.temp-9pm').textContent = `${Math.round(weatherData.forecastTemps[4])}°`;
        console.log('Forecast temps updated');
    } else {
        console.warn('Forecast temps not available or incorrect length');
    }

    console.log('Updating forecast icons...');
    if (weatherData.forecastWeatherCodes && weatherData.forecastWeatherCodes.length === 5) {
        document.querySelector('.icon-9am').textContent = getWeatherIcon(weatherData.forecastWeatherCodes[0]);
        document.querySelector('.icon-12pm').textContent = getWeatherIcon(weatherData.forecastWeatherCodes[1]);
        document.querySelector('.icon-3pm').textContent = getWeatherIcon(weatherData.forecastWeatherCodes[2]);
        document.querySelector('.icon-6pm').textContent = getWeatherIcon(weatherData.forecastWeatherCodes[3]);
        document.querySelector('.icon-9pm').textContent = getWeatherIcon(weatherData.forecastWeatherCodes[4]);
        console.log('Forecast icons updated');
    } else {
        console.warn('Forecast weather codes not available or incorrect length');
    }

    console.log('UI update completed successfully');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized - DOM ready');
    const button = document.querySelector('.detect-location-btn');
    console.log('Button element found');
    
    button.addEventListener('click', async () => {
        console.log('Button clicked - Starting weather fetch process');
        button.disabled = true;
        button.textContent = 'Loading...';
        console.log('Button disabled, showing loading state');
        
        try {
            console.log('Calling fetchWeather...');
            const weatherData = await fetchWeather();
            console.log('Weather data received, updating UI...');
            await updateUI(weatherData);
            button.textContent = 'Detect Location';
            console.log('All processes completed successfully!');
        } catch (error) {
            console.error('Error in weather fetch process:', error);
            const errorMsg = typeof error === 'string' ? error : error.message || 'Failed to fetch weather data. Please try again.';
            console.log('Showing error to user');
            alert(errorMsg);
            button.textContent = 'Try Again';
            console.log('Button text changed to "Try Again"');
        } finally {
            button.disabled = false;
            console.log('Button re-enabled');
        }
    });
    
    console.log('Event listener attached to button');
});