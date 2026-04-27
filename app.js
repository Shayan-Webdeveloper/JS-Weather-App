const API_KEY = "9f66e8bd260aba9631de9c3ec50497fe";

// ----------------------
// DARK / LIGHT MODE
// ----------------------
function toggle(){
  document.body.classList.toggle("light");
}

// ----------------------
// TIMEZONE OFFSET (CITY)
// ----------------------
let timezoneOffset = 0;

// ----------------------
// FORMAT TIME (AM/PM)
// ----------------------
function formatTime(date){
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

// ----------------------
// FORMAT DATE (DD/MM/YY)
// ----------------------
function formatDate(date){
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = String(date.getFullYear()).slice(-2);
  return `${d}/${m}/${y}`;
}

// ----------------------
// FIXED CITY TIME (IMPORTANT)
// ----------------------
function getCityTime(){
  const utc = new Date().getTime() + (new Date().getTimezoneOffset() * 60000);
  return new Date(utc + (timezoneOffset * 1000));
}

// ----------------------
// LIVE CLOCK
// ----------------------
let clockInterval;

function startClock(){

  if(clockInterval) clearInterval(clockInterval);

  clockInterval = setInterval(() => {
    const cityTime = getCityTime();
    document.getElementById("time").innerText = formatTime(cityTime);
  }, 1000);
}

// ----------------------
// GET WEATHER
// ----------------------
async function getWeather(){

  const city = document.getElementById("city").value;

  if(!city){
    alert("Please enter a city name");
    return;
  }

  try{

    // GEO API
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );

    const geo = await geoRes.json();

    if(!geo.length){
      alert("City not found");
      return;
    }

    const lat = geo[0].lat;
    const lon = geo[0].lon;

    // CURRENT WEATHER
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    const w = await weatherRes.json();

    // SAVE TIMEZONE OFFSET (IMPORTANT)
    timezoneOffset = w.timezone;

    // FORECAST
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    const f = await forecastRes.json();

    updateUI(w, f, geo[0].name);

  } catch(err){
    console.log(err);
    alert("Failed to fetch weather data");
  }
}

// ----------------------
// UPDATE UI
// ----------------------
function updateUI(w, f, city){

  if(!w || !f) return;

  const now = getCityTime();

  document.getElementById("cityName").innerText = city;
  document.getElementById("temp").innerText = w.main.temp + "°C";
  document.getElementById("desc").innerText = w.weather[0].main;

  document.getElementById("feels").innerText = w.main.feels_like + "°C";
  document.getElementById("humidity").innerText = w.main.humidity + "%";
  document.getElementById("wind").innerText = w.wind.speed + " m/s";
  document.getElementById("pressure").innerText = w.main.pressure + " hPa";

  // ----------------------
  // SUNRISE / SUNSET (FIXED)
  // ----------------------
document.getElementById("sunrise").innerText =
  formatTime(new Date(w.sys.sunrise * 1000));
document.getElementById("sunset").innerText =
  formatTime(new Date(w.sys.sunset * 1000));

  // ----------------------
  // DATE / DAY
  // ----------------------
  document.getElementById("date").innerText = formatDate(now);

  document.getElementById("day").innerText =
    now.toLocaleDateString("en-US", { weekday: "long" });

  // ----------------------
  // START LIVE CLOCK
  // ----------------------
  startClock();

  // ----------------------
  // 24 HOUR FORECAST (FIXED TIME)
  // ----------------------
  let hourlyHTML = "";

  f.list.slice(0, 8).forEach(item => {

    const itemTime = new Date((item.dt + timezoneOffset) * 1000);

    hourlyHTML += `
      <div class="item">
        <p>${formatTime(itemTime)}</p>
        <i class="fa-solid fa-cloud"></i>
        <p>${item.main.temp}°C</p>
      </div>
    `;
  });

  document.getElementById("hourly").innerHTML = hourlyHTML;

  // ----------------------
  // 5 DAY FORECAST
  // ----------------------
  let dailyHTML = "";
  let days = {};

  f.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if(!days[date]){
      days[date] = item;
    }
  });

  Object.keys(days).slice(0,5).forEach(date => {
    dailyHTML += `
      <div class="item">
        <p>${formatDate(new Date(date))}</p>
        <i class="fa-solid fa-sun"></i>
        <p>${days[date].main.temp}°C</p>
      </div>
    `;
  });

  document.getElementById("daily").innerHTML = dailyHTML;
}
