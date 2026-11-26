const API = "https://api.open-meteo.com/v1/forecast";
const GEO = "https://geocoding-api.open-meteo.com/v1/search";
const $ = (id) => document.getElementById(id);

const weatherCodes = {
  0:["Clear sky","☀️"],1:["Mainly clear","🌤️"],2:["Partly cloudy","⛅"],3:["Overcast","☁️"],
  45:["Fog","🌫️"],48:["Rime fog","🌫️"],51:["Light drizzle","🌦️"],53:["Drizzle","🌦️"],55:["Dense drizzle","🌧️"],
  56:["Freezing drizzle","🌧️"],57:["Freezing drizzle","🌧️"],61:["Slight rain","🌦️"],63:["Moderate rain","🌧️"],65:["Heavy rain","🌧️"],
  66:["Freezing rain","🌧️"],67:["Heavy freezing rain","🌧️"],71:["Slight snow","🌨️"],73:["Moderate snow","🌨️"],75:["Heavy snow","❄️"],
  77:["Snow grains","❄️"],80:["Rain showers","🌦️"],81:["Rain showers","🌧️"],82:["Violent rain showers","⛈️"],
  85:["Snow showers","🌨️"],86:["Heavy snow showers","❄️"],95:["Thunderstorm","⛈️"],96:["Thunderstorm with hail","⛈️"],99:["Thunderstorm with hail","⛈️"]
};
function weatherInfo(code){ return weatherCodes[code] || ["Weather conditions","🌤️"]; }
function timeOnly(value){ return value ? new Date(value).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : "—"; }
function dateLabel(value, opts){ return new Date(value).toLocaleDateString([], opts); }
function setStatus(message, error=false){ $("status").textContent=message; $("status").classList.toggle("error",error); }

async function searchCity(query){
  setStatus("Finding location…");
  try{
    const response=await fetch(`${GEO}?name=${encodeURIComponent(query)}&count=8&language=en&format=json`);
    if(!response.ok) throw new Error("Could not search locations. Please try again.");
    const data=await response.json();
    if(!data.results?.length) throw new Error("No matching place found. Try another city or area name.");
    // Prefer exact city-name matches, otherwise use the first geocoding result.
    const result=data.results.find(x=>x.name.toLowerCase()===query.trim().toLowerCase()) || data.results[0];
    await loadWeather(result);
  }catch(err){ setStatus(err.message || "Something went wrong.",true); }
}

async function loadWeather(place){
  setStatus(`Loading live weather for ${place.name}…`);
  $("searchBtn").disabled=true;
  try{
    const params=new URLSearchParams({
      latitude:place.latitude,longitude:place.longitude,
      current:"temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m",
      hourly:"temperature_2m,precipitation_probability,weather_code",
      daily:"weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max",
      timezone:"auto",forecast_days:"7"
    });
    const response=await fetch(`${API}?${params}`);
    if(!response.ok) throw new Error("Weather service is temporarily unavailable.");
    const data=await response.json();
    renderWeather(place,data);
    setStatus(`Showing the latest available weather for ${place.name}.`);
  }catch(err){ setStatus(err.message || "Unable to load weather. Check your internet connection.",true); }
  finally{$("searchBtn").disabled=false;}
}

function renderWeather(place,data){
  const c=data.current, daily=data.daily;
  const [desc,icon]=weatherInfo(c.weather_code);
  $("placeName").textContent=place.name;
  $("placeMeta").textContent=[place.admin1,place.country].filter(Boolean).join(", ") || "Worldwide location";
  $("mainIcon").textContent=icon;
  $("temperature").textContent=`${Math.round(c.temperature_2m)}°`;
  $("condition").textContent=desc;
  $("feelsLike").textContent=`Feels like ${Math.round(c.apparent_temperature)}°C`;
  $("humidity").textContent=`${c.relative_humidity_2m}%`;
  $("wind").textContent=`${c.wind_speed_10m} km/h`;
  $("feelsMetric").textContent=`${Math.round(c.apparent_temperature)}°C`;
  $("pressure").textContent=`${Math.round(c.pressure_msl)} hPa`;
  $("sunrise").textContent=timeOnly(daily.sunrise[0]);
  $("sunset").textContent=timeOnly(daily.sunset[0]);
  $("localTime").textContent=`Local time ${timeOnly(c.time)}`;
  $("updatedAt").textContent=`Updated ${timeOnly(c.time)}`;
  renderHourly(data.hourly,c.time);
  renderDaily(daily);
  $("weatherContent").hidden=false;$("hourlySection").hidden=false;$("dailySection").hidden=false;
}

function renderHourly(hourly,currentTime){
  const start=Math.max(0,hourly.time.findIndex(t=>t>=currentTime));
  const items=hourly.time.slice(start,start+24);
  $("hourlyList").innerHTML=items.map((time,index)=>{
    const i=start+index,[,icon]=weatherInfo(hourly.weather_code[i]);
    const label=index===0?"Now":dateLabel(time,{hour:"numeric"});
    const rain=hourly.precipitation_probability?.[i] ?? 0;
    return `<div class="hour-item"><div class="hour-time">${label}</div><div class="hour-icon">${icon}</div><strong>${Math.round(hourly.temperature_2m[i])}°</strong><div class="rain">💧 ${rain}%</div></div>`;
  }).join("");
}
function renderDaily(daily){
  $("dailyList").innerHTML=daily.time.map((date,i)=>{
    const [desc,icon]=weatherInfo(daily.weather_code[i]);
    const day=i===0?"Today":dateLabel(date,{weekday:"short"});
    const rain=daily.precipitation_probability_max?.[i];
    return `<div class="day-row"><span class="day-name">${day} <span style="font-weight:400;color:#9aa5b6">${dateLabel(date,{month:"short",day:"numeric"})}</span></span><span class="day-icon">${icon}</span><span class="day-desc">${desc}${rain!=null?` · ${rain}% rain`:""}</span><span class="day-temps">${Math.round(daily.temperature_2m_max[i])}° <span>${Math.round(daily.temperature_2m_min[i])}°</span></span></div>`;
  }).join("");
}

$("searchForm").addEventListener("submit",e=>{
  e.preventDefault();const query=$("cityInput").value.trim();
  if(query) searchCity(query);
});
document.querySelectorAll("[data-city]").forEach(btn=>btn.addEventListener("click",()=>{
  $("cityInput").value=btn.dataset.city;searchCity(btn.dataset.city);
}));
$("locationBtn").addEventListener("click",()=>{
  if(!navigator.geolocation){setStatus("Your browser does not support location services.",true);return;}
  setStatus("Requesting your location permission…");
  navigator.geolocation.getCurrentPosition(async position=>{
    const {latitude,longitude}=position.coords;
    try{
      const response=await fetch(`${GEO}?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`);
      const result=await response.json();
      const place=result.results?.[0] || {name:"Your location",latitude,longitude};
      place.latitude=latitude;place.longitude=longitude;
      await loadWeather(place);
    }catch{await loadWeather({name:"Your location",latitude,longitude});}
  },error=>{
    const message=error.code===1?"Location permission was denied. You can search for a city instead.":"Could not get your location. Please search for a city.";
    setStatus(message,true);
  },{enableHighAccuracy:false,timeout:12000});
});

// Show a useful starting location when the page opens.
searchCity("Chennai");
