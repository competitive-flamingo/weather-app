import "./weatherData.css"
import imageMap from "./imageMap"
import loadingIcon from "./images/loading-icon.svg"
import {format, parse} from "date-fns"
let weatherData = JSON.parse(localStorage.getItem("weatherData"));
const API_KEY = "78YSBZTU7WRJJJMAFNB27N3DN";
const weatherForm = document.querySelector(".weatherForm");
const weatherFormButton = document.querySelector(".weatherForm button");
const cityInput = document.querySelector(".weatherForm input");
const dataRetrievalMessage = document.querySelector(".data-retrieval-message");
const cityName = document.querySelector(".city-name");
const cityTemperature = document.querySelector(".city-temperature");
const cityConditionDescription = document.querySelector(".description");
const cityConditionImage = document.querySelector(".city-condition-icon img");
const todayForecastCards = document.querySelectorAll(".todayForecast-card");
const realFeelCondition = document.querySelector(".real-feel-val");
const windCondition = document.querySelector(".wind-val");
const humidityCondition = document.querySelector(".humidity-val");
const uvIndexCondition = document.querySelector(".uv-index-val");
const daysForecastCards = document.querySelectorAll(".day-card");
const unitToggle = document.querySelector("#unitToggle");
const refreshButton = document.querySelector("#refreshButton");
const loadingIconImage = document.createElement("img");
loadingIconImage.src = loadingIcon;
loadingIconImage.className = "loading-icon";
unitToggle.value = localStorage.getItem("tempUnit") || unitToggle.value;
const temperatureUnitMap = {
    "fahrenheit": c => Math.round(c * (9 / 5) + 32),
    "celsius": f =>  Math.round((f - 32) * 5 / 9),
}

console.log(weatherData);

async function getWeatherData(city) {
    const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?key=${API_KEY}`)
    if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return await response.json()
}

unitToggle.addEventListener("change", renderTemperatureUnitChanges);

function renderTemperatureUnitChanges() {
    const tempUnit = unitToggle.value;
    localStorage.setItem("tempUnit", tempUnit);
    cityTemperature.textContent = `${temperatureUnitMap[tempUnit](+cityTemperature.textContent.slice(0, -1))}°`;
    for(let i = 0 ;  i < todayForecastCards.length ; i++) {
        const currentCardTemp = todayForecastCards[i].children[2].textContent
        todayForecastCards[i].children[2].textContent = `${temperatureUnitMap[tempUnit](+currentCardTemp.slice(0, -1))}°`;
    }
    const realFeelTemp = +realFeelCondition.textContent.slice(0, -1);
    realFeelCondition.textContent = `${temperatureUnitMap[tempUnit](realFeelTemp)}°`;
    for(let i = 0 ; i < daysForecastCards.length ; i++) {
        const maxTemp = +daysForecastCards[i].children[2].children[0].textContent;
        const minTemp = +daysForecastCards[i].children[2].children[1].textContent.slice(1);
        daysForecastCards[i].children[2].children[0].textContent = temperatureUnitMap[tempUnit](maxTemp);
        daysForecastCards[i].children[2].children[1].textContent = `/${temperatureUnitMap[tempUnit](minTemp)}`; 
    }
}

function renderRoundedTemperatures() {
    cityTemperature.textContent = `${Math.round(+cityTemperature.textContent.slice(0, -1))}°`;
    for(let i = 0 ;  i < todayForecastCards.length ; i++) {
        const currentCardTemp = todayForecastCards[i].children[2].textContent
        todayForecastCards[i].children[2].textContent = `${Math.round(+currentCardTemp.slice(0, -1))}°`;
    }
    const realFeelTemp = +realFeelCondition.textContent.slice(0, -1);
    realFeelCondition.textContent = `${Math.round(realFeelTemp)}°`;
    for(let i = 0 ; i < daysForecastCards.length ; i++) {
        const maxTemp = +daysForecastCards[i].children[2].children[0].textContent;
        const minTemp = +daysForecastCards[i].children[2].children[1].textContent.slice(1);
        daysForecastCards[i].children[2].children[0].textContent = Math.round(maxTemp);
        daysForecastCards[i].children[2].children[1].textContent = `/${Math.round(minTemp)}`; 
    }
}

async function renderWeatherData(city) {
    try {
        weatherData = await getWeatherData(city);
        dataRetrievalMessage.classList.remove("failure");
        dataRetrievalMessage.textContent = "Successful Data Retrieval";
        renderCurrentForecast();
        renderTodaysForecast();
        renderAirCondition();
        renderDaysForecast();
        renderRoundedTemperatures();
        localStorage.setItem("weatherData", JSON.stringify(weatherData));
        console.log(weatherData);
    } catch(error) {
        dataRetrievalMessage.textContent = "Invalid city name or network error";
        dataRetrievalMessage.classList.add("failure");
        console.error(error.message);
    }
}

weatherForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = cityInput.value;
    localStorage.setItem("cityName", city);
    weatherFormButton.innerHTML = "";
    weatherFormButton.classList.add("loading");
    weatherFormButton.append(loadingIconImage);
    await renderWeatherData(city);
    weatherFormButton.textContent = "Get Weather";
    weatherForm.classList.remove("loading");
    weatherForm.reset();
});

refreshButton.addEventListener("click", async (event) => {
    const city = localStorage.getItem("cityName");
    refreshButton.classList.add("loading");
    refreshButton.innerHTML = "";
    refreshButton.appendChild(loadingIconImage);
    await renderWeatherData(city);
    refreshButton.textContent = "Refresh";
    refreshButton.classList.remove("loading");
});

function renderCurrentForecast() {
    cityName.textContent = weatherData.resolvedAddress;
    cityTemperature.textContent = `${unitToggle.value === 'celsius' ? temperatureUnitMap['celsius'](weatherData.currentConditions.temp) : weatherData.currentConditions.temp}°`;
    cityConditionDescription.textContent = `${weatherData.currentConditions.conditions}. ${weatherData.description}`;
    cityConditionImage.src = imageMap[weatherData.currentConditions.icon];
}

function renderTodaysForecast() {
    const daytimesIndexes = [6, 9, 12, 15, 18, 21];
    for(let i = 0 ; i < daytimesIndexes.length ; i++) {
        Array.from(todayForecastCards[i].children).forEach((child) => {
            switch(child.className) {
                case "time":
                    child.textContent = formatHour(weatherData.days[0].hours[daytimesIndexes[i]].datetime);
                    break;
                case "icon-container":
                    child.children[0].src = imageMap[weatherData.days[0].hours[daytimesIndexes[i]].icon];
                    break;
                case "temp":
                    child.textContent =`${unitToggle.value === 'celsius' ? temperatureUnitMap['celsius'](weatherData.days[0].hours[daytimesIndexes[i]].temp) : weatherData.days[0].hours[daytimesIndexes[i]].temp}°`;
            }
        })
    }
}

function renderAirCondition() {
    windCondition.textContent = `${weatherData.currentConditions.windspeed} km/h`;
    realFeelCondition.textContent = `${unitToggle.value === 'celsius' ? temperatureUnitMap['celsius'](weatherData.currentConditions.feelslike) : weatherData.currentConditions.feelslike}°`;
    humidityCondition.textContent = `${weatherData.currentConditions.humidity}%`;
    uvIndexCondition.textContent = weatherData.currentConditions.uvindex;
}

function renderDaysForecast() {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayIndex = new Date().getDay();
    Array.from(daysForecastCards).forEach((card, index) => {
        Array.from(card.children).forEach((child) => {
            const moduledIndex = (index + todayIndex) % 7;
            const dayName = (index === 0) ? "Today" : daysOfWeek[moduledIndex];
            switch(child.className) {
                case "dayName":
                    child.textContent = dayName;
                    break;
                case "dayCondition":
                    child.children[0].children[0].src = imageMap[weatherData.days[index].icon];
                    child.children[1].textContent = weatherData.days[index].conditions;
                    break;
                case "maxminTemp":
                    child.children[0].textContent = unitToggle.value === 'celsius' ? temperatureUnitMap['celsius'](weatherData.days[index].tempmax) : weatherData.days[index].tempmax;
                    child.children[1].textContent = `/${unitToggle.value === 'celsius' ? temperatureUnitMap['celsius'](weatherData.days[index].tempmin) : weatherData.days[index].tempmin}`;
                    break;
            }
        })
    });
}

function formatHour(datetime) {
    const parsedTime = parse(datetime, "HH:mm:ss", new Date());
    const formattedTime = format(parsedTime, "hh:mm a");
    return formattedTime;
}


renderCurrentForecast();
renderTodaysForecast();
renderAirCondition();
renderDaysForecast();
renderRoundedTemperatures();