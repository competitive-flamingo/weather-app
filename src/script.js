import "./index.css"
import loadingIcon from "./images/loading-icon.svg"

const API_KEY = "78YSBZTU7WRJJJMAFNB27N3DN"
const weatherForm = document.querySelector(".weatherForm");
const weatherFormButton = document.querySelector(".weatherForm button");
const errorMessage = document.querySelector(".error-message");
const cityInput = document.querySelector(".weatherForm input");
const loadingIconImage = document.createElement("img");
loadingIconImage.src = loadingIcon;
loadingIconImage.classList.add("loading-icon");

async function getWeatherData(city) {
    const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?key=${API_KEY}`)
    if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return await response.json()
}

weatherForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = cityInput.value;
    weatherFormButton.innerHTML = "";
    weatherFormButton.classList.add("loading");
    weatherFormButton.append(loadingIconImage);
    try {
        const weatherData = await getWeatherData(city)
        localStorage.setItem("weatherData", JSON.stringify(weatherData));
        window.location.href = "./weatherData.html";
    } catch(error) {
        console.error("Error", error.message);
        errorMessage.style.display = "grid";
        errorMessage.textContent = "Invalid city name or a network error";
        setTimeout(() => {
            errorMessage.style.display = "none";
        }, 3000);
    } finally {
        weatherFormButton.classList.remove("loading");
        weatherFormButton.textContent = "Get Weather";
        weatherForm.reset();
    }
})
