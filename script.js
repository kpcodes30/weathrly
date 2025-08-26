document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("location");
  const button = document.getElementById("submit");
  const weatherInfo = document.querySelector(".weather-info");

  async function fetchWeather(city) {
    try {
      weatherInfo.textContent = "Loading...";
      const response = await fetch(
        `/.netlify/functions/fetchWeather?city=${encodeURIComponent(city)}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data.cod && data.cod !== 200) {
        weatherInfo.textContent = data.message || "City not found.";
        return;
      }
      weatherInfo.innerHTML = `
				<div style="color:#fff; text-align:center;">
					<h2 style="margin-bottom:0.5rem;">${data.name}, ${data.sys.country}</h2>
					<p style="font-size:2rem; margin:0.5rem 0;">${Math.round(data.main.temp)}°C</p>
					<p style="margin:0.5rem 0;">${data.weather[0].main} - ${
        data.weather[0].description
      }</p>
					<p style="margin:0.5rem 0;">Humidity: ${data.main.humidity}%</p>
					<p style="margin:0.5rem 0;">Wind: ${data.wind.speed} m/s</p>
				</div>
			`;
    } catch (error) {
      weatherInfo.textContent = "Failed to fetch weather.";
    }
  }

  button.addEventListener("click", () => {
    const city = input.value.trim();
    if (city) {
      fetchWeather(city);
    } else {
      weatherInfo.textContent = "Please enter a location.";
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      button.click();
    }
  });
});
