// Select DOM elements
const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const weatherDisplay = document.getElementById('weatherDisplay');
const body = document.body; // To change background dynamically

// OpenWeather API details
const API_KEY = 'f3c2e89590cb7ec272a7b825728855a9'; 
const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// Function to set dynamic background based on weather
function setDynamicBackground(weatherCondition) {
    const conditions = {
        clear: 'linear-gradient(135deg, #FFD700, #87CEEB)', // Sunny
        clouds: 'linear-gradient(135deg, #B0C4DE, #778899)', // Cloudy
        rain: 'linear-gradient(135deg, #00C6FF, #0072FF)', // Rainy
        snow: 'linear-gradient(135deg, #FFFFFF, #D3D3D3)', // Snowy
        default: 'linear-gradient(135deg, #74b9ff, #0984e3)', // Default (fallback)
    };

    const lowerCaseCondition = weatherCondition.toLowerCase();
    if (lowerCaseCondition.includes('clear')) {
        body.style.background = conditions.clear;
    } else if (lowerCaseCondition.includes('cloud')) {
        body.style.background = conditions.clouds;
    } else if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle')) {
        body.style.background = conditions.rain;
    } else if (lowerCaseCondition.includes('snow')) {
        body.style.background = conditions.snow;
    } else {
        body.style.background = conditions.default;
    }
}

// Function to fetch current weather
async function fetchWeather(city) {
    try {
        weatherDisplay.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `; // Show loading spinner

        const response = await fetch(`${CURRENT_WEATHER_URL}?q=${city}&units=metric&appid=${API_KEY}`);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        displayWeather(data);
        setDynamicBackground(data.weather[0].main); // Set dynamic background
    } catch (error) {
        weatherDisplay.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
    }
}

// Function to fetch 5-day forecast
async function fetchForecast(city) {
    try {
        const response = await fetch(`${FORECAST_URL}?q=${city}&units=metric&appid=${API_KEY}`);
        if (!response.ok) {
            throw new Error('Forecast data not available');
        }
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        weatherDisplay.innerHTML += `<p class="text-danger">Error: ${error.message}</p>`;
    }
}

// Function to display current weather
function displayWeather(data) {
    const { name, main, weather, wind } = data;

    weatherDisplay.innerHTML = `
        <h3 class="text-primary">${name}</h3>
        <p>Temperature: ${main.temp}°C</p>
        <p>Weather: ${weather[0].description}</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind Speed: ${wind.speed} m/s</p>
    `;
}

// Function to display 5-day forecast
function displayForecast(data) {
    const forecastHTML = data.list
        .filter((entry) => entry.dt_txt.includes('12:00:00')) // Get data for 12:00 PM each day
        .map((entry) => {
            const date = new Date(entry.dt_txt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
            const { main, weather } = entry;

            return `
                <div class="forecast-card p-2 border rounded bg-light text-dark m-2">
                    <p class="fw-bold">${date}</p>
                    <p>${weather[0].description}</p>
                    <p>Temp: ${main.temp}°C</p>
                    <p>Humidity: ${main.humidity}%</p>
                </div>
            `;
        })
        .join('');

    weatherDisplay.innerHTML += `
        <h4 class="mt-4">5-Day Forecast</h4>
        <div class="d-flex flex-wrap justify-content-center">
            ${forecastHTML}
        </div>
    `;
}

// Event listener for form submission
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city); // Fetch current weather
        fetchForecast(city); // Fetch forecast
        cityInput.value = ''; // Clear input field
    }
});

