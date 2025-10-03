function getWeatherCondition(code) {
    const weatherCodes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy", 
        3: "Overcast",
        45: "Fog",
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
    
    return weatherCodes[code] || "Unknown";
}

function getWeatherIcon(code) {
    const iconBaseUrl = "https://basmilius.github.io/weather-icons/production/fill/all/";
    const iconMap = {
        0: "clear-day.svg",
        1: "partly-cloudy-day.svg",
        2: "partly-cloudy-day.svg",
        3: "cloudy.svg",
        45: "fog.svg",
        48: "fog.svg",
        51: "drizzle.svg",
        53: "drizzle.svg",
        55: "drizzle.svg",
        56: "sleet.svg",
        57: "sleet.svg",
        61: "rain.svg",
        63: "rain.svg",
        65: "rain.svg",
        66: "sleet.svg",
        67: "sleet.svg",
        71: "snow.svg",
        73: "snow.svg",
        75: "snow.svg",
        77: "snow.svg",
        80: "showers.svg",
        81: "showers.svg",
        82: "showers.svg",
        85: "snow.svg",
        86: "snow.svg",
        95: "thunderstorms.svg",
        96: "thunderstorms-rain.svg",
        99: "thunderstorms-rain.svg",
    };
    const iconName = iconMap[code] || "not-available.svg";
    return `${iconBaseUrl}${iconName}`;
}

const btn = document.querySelector(".detect-location");
btn.addEventListener("click", () => {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
                const response = await fetch(url);
                const data = await response.json();
                
                const temperatureValue = data.current_weather.temperature;
                const weatherCode = data.current_weather.weathercode;
                
                // Update DOM elements
                const temperatureElement = document.querySelector(".temp-number");
                const conditionElement = document.querySelector(".condition");
                const weatherIconElement = document.querySelector(".weather-icon img");
                
                conditionElement.textContent = getWeatherCondition(weatherCode);
                temperatureElement.textContent = Math.trunc(temperatureValue);
                weatherIconElement.src = getWeatherIcon(weatherCode);
            }, (error) => {alert("Unable to retrieve your location");
        });
    } else {
        alert("your browser does not support geolocation");
    }
});
