const input = document.getElementById("location");
const button = document.getElementById("submit");
const panel = document.querySelector(".panel");
// Remove .weather-info from DOM if present (avoid duplicate result areas)
const oldWeatherInfo = document.querySelector(".weather-info");
if (oldWeatherInfo) oldWeatherInfo.remove();

// Create or get result div inside panel
let resultDiv = document.getElementById("weather-result");
if (!resultDiv) {
  resultDiv = document.createElement("div");
  resultDiv.id = "weather-result";
  resultDiv.style.width = "100%";
  resultDiv.style.marginTop = "1.5rem";
  panel.appendChild(resultDiv);
}

function showSpinner() {
  resultDiv.innerHTML = `<div class="spinner" style="display:flex;justify-content:center;align-items:center;height:60px;"><div style="border:4px solid #5c7cfa;border-top:4px solid #28336e;border-radius:50%;width:32px;height:32px;animation:spin 1s linear infinite;"></div></div>`;
  // Add spinner keyframes if not present
  if (!document.getElementById("spinner-style")) {
    const style = document.createElement("style");
    style.id = "spinner-style";
    style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`;
    document.head.appendChild(style);
  }
}

function hideInputAndButton() {
  input.style.display = "none";
  button.style.display = "none";
}

function showInputAndButton() {
  input.style.display = "";
  button.style.display = "";
}

function styleResultText() {
  // Add modern styles to resultDiv content
  const h2 = resultDiv.querySelector("h2");
  if (h2) {
    h2.style.fontFamily = "Quicksand, Montserrat, Poppins, sans-serif";
    h2.style.fontWeight = "600";
    h2.style.fontSize = "1.5rem";
    h2.style.letterSpacing = "0.5px";
    h2.style.color = "#b3c7f7";
  }
  const ps = resultDiv.querySelectorAll("p");
  ps.forEach((p) => {
    p.style.fontFamily = "Poppins, sans-serif";
    p.style.fontSize = "1.1rem";
    p.style.color = "#e0e6f7";
    p.style.margin = "0.4rem 0";
  });
}

async function fetchWeather(city) {
  try {
    showSpinner();
    hideInputAndButton();
    const response = await fetch(
      `/.netlify/functions/fetchWeather?city=${encodeURIComponent(city)}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    if (data.cod && data.cod !== 200) {
      resultDiv.innerHTML = `<p style="color:#fff;text-align:center;">${
        data.message || "City not found."
      }</p>`;
      showInputAndButton();
      return;
    }
    resultDiv.innerHTML = `
        <div style="color:#fff; text-align:center;">
          <h2 style="margin-bottom:0.5rem;">${data.name}, ${
      data.sys.country
    }</h2>
          <p style="font-size:2rem; margin:0.5rem 0;">${Math.round(
            data.main.temp
          )}°C</p>
          <p style="margin:0.5rem 0;">${data.weather[0].main} - ${
      data.weather[0].description
    }</p>
          <p style="margin:0.5rem 0;">Humidity: ${data.main.humidity}%</p>
          <p style="margin:0.5rem 0;">Wind: ${data.wind.speed} m/s</p>
        </div>
      `;
    styleResultText();
    showInputAndButton();
  } catch (error) {
    resultDiv.innerHTML =
      '<p style="color:#fff;text-align:center;">Failed to fetch weather.</p>';
    showInputAndButton();
  }
}

button.addEventListener("click", () => {
  const city = input.value.trim();
  if (city) {
    fetchWeather(city);
  } else {
    resultDiv.innerHTML =
      '<p style="color:#fff;text-align:center;">Please enter a location.</p>';
  }
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    button.click();
  }
});

function showInputAndButton() {
  input.style.display = "";
  button.style.display = "";
}

async function fetchWeather(city) {
  try {
    showSpinner();
    hideInputAndButton();
    const response = await fetch(
      `/.netlify/functions/fetchWeather?city=${encodeURIComponent(city)}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    if (data.cod && data.cod !== 200) {
      resultDiv.innerHTML = `<p style="color:#fff;text-align:center;">${
        data.message || "City not found."
      }</p>`;
      showInputAndButton();
      return;
    }
    resultDiv.innerHTML = `
          <div style="color:#fff; text-align:center;">
            <h2 style="margin-bottom:0.5rem;">${data.name}, ${
      data.sys.country
    }</h2>
            <p style="font-size:2rem; margin:0.5rem 0;">${Math.round(
              data.main.temp
            )}°C</p>
            <p style="margin:0.5rem 0;">${data.weather[0].main} - ${
      data.weather[0].description
    }</p>
            <p style="margin:0.5rem 0;">Humidity: ${data.main.humidity}%</p>
            <p style="margin:0.5rem 0;">Wind: ${data.wind.speed} m/s</p>
          </div>
        `;
    showInputAndButton();
  } catch (error) {
    resultDiv.innerHTML =
      '<p style="color:#fff;text-align:center;">Failed to fetch weather.</p>';
    showInputAndButton();
  }
}

button.addEventListener("click", () => {
  const city = input.value.trim();
  if (city) {
    fetchWeather(city);
  } else {
    resultDiv.innerHTML =
      '<p style="color:#fff;text-align:center;">Please enter a location.</p>';
  }
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    button.click();
  }
});
