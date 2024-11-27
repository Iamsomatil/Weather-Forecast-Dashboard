
const API_KEY = '2a0c6576f9c80562c5831df719988cee';

// DOM Elements
const locationInput = document.getElementById('locationInput');
const searchBtn = document.getElementById('searchBtn');
const currentWeatherEl = document.getElementById('currentWeather');
const forecastContainer = document.getElementById('forecastContainer');
const errorMessage = document.getElementById('error-message');
const loader = document.getElementById('loader');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Handle search functionality
function handleSearch() {
    const city = locationInput.value.trim();
    if (city) {
        errorMessage.textContent = '';
        fetchWeatherData(city);
    } else {
        showError('Please enter a city name');
    }
}

function showError(message) {
    errorMessage.textContent = message;
    currentWeatherEl.innerHTML = '';
    forecastContainer.innerHTML = '';
}


function showLoading() {
    currentWeatherEl.innerHTML = '<div class="loader"></div>';
    forecastContainer.innerHTML = '';
}


async function fetchWeatherData(city) {
    showLoading();
    
    try {
        
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;


        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            }),
            fetch(forecastUrl).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
        ]);

        displayCurrentWeather(currentResponse);
        displayForecast(forecastResponse);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        if (error.message.includes('404')) {
            showError('City not found. Please check the spelling and try again.');
        } else {
            showError('Failed to fetch weather data. Please try again later.');
        }
    }
}

// Display current weather
function displayCurrentWeather(data) {
    if (!data) {
        showError('No weather data available');
        return;
    }

    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    currentWeatherEl.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img 
            src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" 
            alt="${data.weather[0].description}"
            class="weather-icon"
        >
        <div class="temperature">${Math.round(data.main.temp)}°C</div>
        <div class="weather-description">${data.weather[0].description}</div>
        
        <div class="weather-details">
            <div class="detail-item">
                <div class="detail-label">Feels Like</div>
                <div class="detail-value">${Math.round(data.main.feels_like)}°C</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Humidity</div>
                <div class="detail-value">${data.main.humidity}%</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Wind</div>
                <div class="detail-value">${(data.wind.speed * 3.6).toFixed(1)} km/h</div>
            </div>
        </div>
        
        <div class="weather-details">
            <div class="detail-item">
                <div class="detail-label">Sunrise</div>
                <div class="detail-value">${sunrise}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Sunset</div>
                <div class="detail-value">${sunset}</div>
            </div>
        </div>
    `;
}

function displayForecast(data) {
    if (!data || !data.list) {
        showError('No forecast data available');
        return;
    }

    const dailyData = data.list.filter(reading => reading.dt_txt.includes('12:00:00')).slice(0, 5);
    
    forecastContainer.innerHTML = dailyData.map(day => `
        <div class="forecast-card">
            <div class="forecast-date">
                ${new Date(day.dt * 1000).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}
            </div>
            <img 
                src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" 
                alt="${day.weather[0].description}"
                class="forecast-icon"
            >
            <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
            <div class="forecast-desc">${day.weather[0].description}</div>
        </div>
    `).join('');
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoords(lat, lon);
        },
        error => {
            console.error('Geolocation error:', error);
            fetchWeatherData('London'); // Default city
        }
    );
} else {
    fetchWeatherData('London'); // Default city
}

// Fetch weather data by coordinates
async function fetchWeatherByCoords(lat, lon) {
    showLoading();
    
    try {
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            }),
            fetch(forecastUrl).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
        ]);

        displayCurrentWeather(currentResponse);
        displayForecast(forecastResponse);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('Failed to fetch weather data. Please try again later.');
    }
}

// Initial load with default city
fetchWeatherData('London');