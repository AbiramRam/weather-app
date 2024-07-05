const apikey = "6a815d7524c4fd665073f396f1c39b82";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const geocodingUrl = "https://api.openweathermap.org/geo/1.0/direct?limit=5&appid=" + apikey + "&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const suggestionsBox = document.querySelector(".suggestions");

let currentSuggestions = [];
let suggestionIndex = -1;

async function checkWeather(city) {
    const response = await fetch(apiUrl + city + `&appid=${apikey}`);

    if (response.status == 404) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    } else {
        var data = await response.json();

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector('.temp').innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + " % ";
        document.querySelector(".wind").innerHTML = data.wind.speed + "km/h ";

        // Display country name using country code and API
        const countryCode = data.sys.country;
        const countryName = await getCountryName(countryCode);
        document.querySelector(".country").innerHTML = countryName;

        if (data.weather[0].main == "Clouds") {
            weatherIcon.src = "images/clouds.png";
        } else if (data.weather[0].main == "Clear") {
            weatherIcon.src = "images/clear.png";
        } else if (data.weather[0].main == "Rain") {
            weatherIcon.src = "images/rain.png";
        } else if (data.weather[0].main == "Drizzle") {
            weatherIcon.src = "images/drizzle.png";
        } else if (data.weather[0].main == "Mist") {
            weatherIcon.src = "images/mist.png";
        }

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";
    }
}

async function getCountryName(countryCode) {
    // Fetch country name from an API or use a predefined map
    const countryResponse = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    const countryData = await countryResponse.json();
    return countryData[0].name.common;
}

async function getSuggestions(query) {
    const response = await fetch(geocodingUrl + query);
    if (response.ok) {
        const data = await response.json();
        currentSuggestions = data;
        suggestionIndex = -1;
        displaySuggestions(data);
    }
}

function displaySuggestions(cities) {
    suggestionsBox.innerHTML = "";
    cities.forEach((city, index) => {
        const suggestion = document.createElement("div");
        suggestion.classList.add("suggestion");
        suggestion.textContent = `${city.name}, ${city.country}`;
        suggestion.addEventListener("click", () => {
            searchBox.value = city.name;
            checkWeather(city.name);
            suggestionsBox.innerHTML = "";
        });
        suggestionsBox.appendChild(suggestion);
    });
}

searchBox.addEventListener("input", () => {
    const query = searchBox.value.trim();
    if (query.length > 2) {
        getSuggestions(query);
    } else {
        suggestionsBox.innerHTML = "";
    }
});

searchBox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (currentSuggestions.length > 0) {
            if (event.key === "ArrowDown") {
                suggestionIndex = (suggestionIndex + 1) % currentSuggestions.length;
            } else if (event.key === "ArrowUp") {
                suggestionIndex = (suggestionIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
            }
            searchBox.value = `${currentSuggestions[suggestionIndex].name}, ${currentSuggestions[suggestionIndex].country}`;
        }
    }
});

searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});

checkWeather();
