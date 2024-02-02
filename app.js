"use strict";

// getCoordinates()
// Demande au navigateur de détecter la position actuelle de l'utilisateur et retourne une Promise
const getCoordinates = () => {
  return new Promise((res, rej) =>
    navigator.geolocation.getCurrentPosition(res, rej)
  );
};

// getPosition()
// Résout la promesse de getCoordinates et retourne un objet {lat: x, long: y}
const getPosition = async () => {
  const position = await getCoordinates();
  return {
    lat: position.coords.latitude,
    long: position.coords.longitude
  };
};

// renderWeather(min, max)
// Affiche la valeu des deux paramêtres dans le widget de météo
const renderWeather = (min, max) => {
  document.querySelector(".min").textContent = `${min}°C`;
  document.querySelector(".max").textContent = `${max}°C`;
  return;
};

// parseStationData(rawData)
// Reçoit la réponse JSON de l'API Transport/stationboard et recrache un objet
// ne contenant que les informations pertinentes.
const parseStationData = (rawData) => {
  const { stationboard } = rawData;
  const departures = stationboard.map((el) => {
    const date = new Date(el.stop.departure);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = date.getHours() < 10 ? "0" + hours : hours;
    const formattedMinutes = date.getMinutes() < 10 ? "0" + minutes : minutes;
    return {
      departure: `${formattedHours}:${formattedMinutes}`,
      destination: el.to,
      category: el.category
    };
  });
  return {
    station: rawData.station.name,
    departures
  };
};

// renderTrain(train)
// Affiche une ligne de départ dans le widget CFF.
const renderTrain = (train) => {
  const board = document.querySelector(".departures");
  const html = `
    <article>
        <div class="time">${train.departure}</div>
        <div class="category" data-category="${train.category}">${train.category}</div>
        <div class="destination">${train.destination}</div>
    </article>
    `;
  board.insertAdjacentHTML("beforeend", html);
  return;
};

// renderStationName(station)
// Affiche le mot passé en paramettre dans le widget CFF. 
const renderStationName = (station) => {
  const stationElement = document.querySelector(".departures header p");
  stationElement.textContent = station;
};

// Votre code peut se trouver dans cette fonction. L'appel vers getPosition est
// déjà implémenté. Si vous jetez un coup d'oeil à votre console vous verrez un objet
// contenant votre position

const getForecastInfo = async () => {
  
  const position = await getPosition(); 
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${position.lat}&longitude=${position.long}&daily=apparent_temperature_max,apparent_temperature_min&timezone=auto`;

  const response = await fetch(apiUrl); 

  if (!response.ok) {
    throw new Error("Failed to load data");
  }

  const responseData = await response.json(); 

  const maxTemp = responseData.daily.apparent_temperature_max[0]; 
  const minTemp = responseData.daily.apparent_temperature_min[0]; 

  renderWeather(minTemp, maxTemp); 
}

const getTrainInfo = async () => {
  
  const position = await getPosition(); 
  const apiUrl = `https://transport.opendata.ch/v1/locations?x=${position.lat}&y=${position.long}&type=station`; 
  const response = await fetch(apiUrl); 

  if (!response.ok) {
    throw new Error("Failed to load data");
  }

  const responseData = await response.json(); 
  const stationName = responseData.stations[1].name; 

  const response2 = await fetch(`https://transport.opendata.ch/v1/stationboard?station=${stationName}&limit=6`)
  const departureData = await response2.json(); 

  const stationData = parseStationData(departureData);
  renderStationName(stationData.station); 
  console.log(stationData);  
  stationData.departures.forEach(train => {
    renderTrain(train); 
  });
  
}

getForecastInfo(); 
getTrainInfo(); 


