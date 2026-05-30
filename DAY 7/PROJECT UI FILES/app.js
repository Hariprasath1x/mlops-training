/* ══════════════════════════════════════════════
   FieldMind – app.js
   All API calls, UI logic, language switching
   ══════════════════════════════════════════════ */

// ── CONFIG ────────────────────────────────────────────────────────
const API = "http://localhost:8000";  // change to Render URL after deployment

// ══════════════════════════════════════════════
// LANGUAGE SWITCHING
// ══════════════════════════════════════════════
const translations = {
  en: {
    tagline:            "Smart Crop Advisory · விவசாய ஆலோசனை",
    "nav-pest-label":   "Pest Detection",
    "nav-crop-label":   "Crop Advisory",
    "nav-weather-label":"Weather",
    "nav-prices-label": "Market Prices",
    "pest-title":       "📷 Upload Crop Leaf Photo",
    "pest-sub":         "Take a clear photo of the diseased leaf and upload it below.\nநோயுற்ட இலையின் தெளிவான புகைப்படம் எடுத்து பதிவேற்றவும்.",
    "upload-text":      "Tap here to upload leaf photo",
    "upload-sub":       "இலை புகைப்படத்தை பதிவேற்றவும்",
    "crop-title":       "🌾 Crop Recommendation",
    "crop-sub":         "Enter your soil details to get the best crop suggestion.\nஉங்கள் மண் விவரங்களை உள்ளிட்டு சிறந்த பயிர் பரிந்துரையை பெறுங்கள்.",
    "weather-title":    "🌤 Weather Forecast",
    "weather-sub":      "7-day weather for your location · உங்கள் இடத்தின் 7 நாள் வானிலை",
    "prices-title":     "💰 Mandi Market Prices",
    "prices-sub":       "Check today's wholesale prices at your nearest market.\nஉங்கள் அருகிலுள்ள சந்தையில் இன்றைய விலையை அறிக.",
  },
  ta: {
    tagline:            "விவசாய ஆலோசனை · Smart Crop Advisory",
    "nav-pest-label":   "பூச்சி கண்டறிதல்",
    "nav-crop-label":   "பயிர் ஆலோசனை",
    "nav-weather-label":"வானிலை",
    "nav-prices-label": "சந்தை விலை",
    "pest-title":       "📷 இலை புகைப்படம் பதிவேற்றவும்",
    "pest-sub":         "நோயுற்ற இலையின் தெளிவான படம் எடுத்து பதிவேற்றவும்.\nTake a clear photo of the diseased leaf and upload it.",
    "upload-text":      "இங்கே தட்டி படம் பதிவேற்றவும்",
    "upload-sub":       "Upload leaf photo here",
    "crop-title":       "🌾 பயிர் பரிந்துரை",
    "crop-sub":         "உங்கள் மண் விவரங்களை உள்ளிட்டு சிறந்த பயிரை அறிக.\nEnter your soil details to get the best crop suggestion.",
    "weather-title":    "🌤 வானிலை முன்னறிவிப்பு",
    "weather-sub":      "உங்கள் இடத்தின் 7 நாள் வானிலை · 7-day weather for your location",
    "prices-title":     "💰 மண்டி சந்தை விலைகள்",
    "prices-sub":       "உங்கள் அருகிலுள்ள சந்தையில் இன்றைய விலையை அறிக.\nCheck today's wholesale prices at your nearest market.",
  }
};

function setLang(lang) {
  // update active button
  document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
  document.querySelector(`.lang-btn[onclick="setLang('${lang}')"]`).classList.add("active");

  // update all translated elements
  const t = translations[lang];
  Object.keys(t).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = t[id];
  });
}

// ══════════════════════════════════════════════
// PAGE NAVIGATION
// ══════════════════════════════════════════════
function showPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("page-" + name).classList.add("active");
  document.getElementById("nav-" + name).classList.add("active");
}

// ══════════════════════════════════════════════
// HELPERS — show / hide UI elements
// ══════════════════════════════════════════════
function show(id) { document.getElementById(id).style.display = "block"; }
function hide(id) { document.getElementById(id).style.display = "none"; }
function showFlex(id) { document.getElementById(id).style.display = "flex"; }

// ══════════════════════════════════════════════
// PAGE 1 — PEST DETECTION
// ══════════════════════════════════════════════
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // show image preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById("preview-img");
    img.src = e.target.result;
    img.style.display = "block";
  };
  reader.readAsDataURL(file);

  // reset previous results
  hide("pest-result");
  hide("pest-error");
  show("pest-loading");

  // build form data and call API
  const formData = new FormData();
  formData.append("file", file);

  fetch(`${API}/pest-detect`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      hide("pest-loading");
      if (data.status === "error") {
        handlePestError(data);
      } else {
        showPestResult(data);
      }
    })
    .catch(() => {
      hide("pest-loading");
      document.getElementById("error-msg").textContent =
        "❌ Cannot connect to server. Make sure the API is running.";
      document.getElementById("error-tip").textContent =
        "Run: uvicorn main:app --reload in your terminal · Terminal-ல் server-ஐ இயக்கவும்";
      show("pest-error");
    });
}

function handlePestError(data) {
  const msgEl = document.getElementById("error-msg");
  const tipEl = document.getElementById("error-tip");

  if (data.code === "NOT_A_PLANT") {
    msgEl.textContent = "❌ This is not a plant photo · இது தாவர படம் அல்ல";
    tipEl.textContent = data.tip || "Please upload a clear photo of a crop leaf. இலையின் தெளிவான படம் எடுக்கவும்.";
  } else if (data.code === "INVALID_FILE_TYPE") {
    msgEl.textContent = "❌ Invalid file type · தவறான கோப்பு வகை";
    tipEl.textContent = "Please upload a JPG or PNG image · JPG அல்லது PNG படம் பதிவேற்றவும்";
  } else if (data.code === "FILE_TOO_LARGE") {
    msgEl.textContent = "❌ Image too large · படம் மிகவும் பெரியது";
    tipEl.textContent = "Please upload an image under 10MB · 10MB க்கும் குறைவான படம் பதிவேற்றவும்";
  } else {
    msgEl.textContent = "❌ " + (data.message || "Something went wrong");
    tipEl.textContent = data.tip || "";
  }

  show("pest-error");
}

function showPestResult(data) {
  const top = data.top_prediction;

  // format disease name: "tomato_leaf_curl" → "Tomato Leaf Curl"
  const displayName = top.disease
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  document.getElementById("result-disease").textContent = displayName;
  document.getElementById("result-conf").textContent =
    `Confidence: ${top.confidence}% · நம்பகத்தன்மை: ${top.confidence}%`;

  // animate confidence bar
  const bar = document.getElementById("conf-bar");
  bar.style.width = "0%";
  setTimeout(() => { bar.style.width = top.confidence + "%"; }, 100);

  // fill top-3 list (skip rank 1)
  const listEl = document.getElementById("top3-list");
  listEl.innerHTML = "";
  data.all_top3.slice(1).forEach((p) => {
    const name = p.disease.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const div = document.createElement("div");
    div.className = "top3-item";
    div.innerHTML = `<span class="name">${name}</span>
                     <span class="pct">${p.confidence}%</span>`;
    listEl.appendChild(div);
  });

  show("pest-result");
}

function resetPest() {
  document.getElementById("preview-img").style.display = "none";
  hide("pest-result");
  hide("pest-error");
  document.getElementById("leaf-input").value = "";
  document.getElementById("conf-bar").style.width = "0%";
}

// ══════════════════════════════════════════════
// PAGE 2 — CROP RECOMMENDATION
// ══════════════════════════════════════════════
function getCropRecommendation() {
  const fields = ["n", "p", "k", "ph", "temp", "hum", "rain"];
  const values = fields.map((f) => parseFloat(document.getElementById("inp-" + f).value));

  if (values.some(isNaN)) {
    alert("Please fill in all fields · அனைத்து புலங்களையும் நிரப்பவும்");
    return;
  }

  hide("crop-result");
  show("crop-loading");

  const payload = {
    N:           values[0],
    P:           values[1],
    K:           values[2],
    ph:          values[3],
    temperature: values[4],
    humidity:    values[5],
    rainfall:    values[6],
  };

  fetch(`${API}/crop-recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      hide("crop-loading");

      const mainCrop = data.recommended_crop
        .replace(/\b\w/g, (c) => c.toUpperCase());
      document.getElementById("crop-main").textContent = mainCrop;

      // top-3 chips
      const top3El = document.getElementById("crop-top3");
      top3El.innerHTML = "";
      data.top3.forEach((c) => {
        const chip = document.createElement("div");
        chip.className = "crop-chip";
        chip.innerHTML = `${c.crop.replace(/\b\w/g, (ch) => ch.toUpperCase())}
                          <span class="pct"> ${c.confidence}%</span>`;
        top3El.appendChild(chip);
      });

      show("crop-result");
    })
    .catch(() => {
      hide("crop-loading");
      alert("Server error. Make sure the API is running · Server பிழை. API இயங்குகிறதா என சரிபார்க்கவும்.");
    });
}

// ══════════════════════════════════════════════
// PAGE 3 — WEATHER
// ══════════════════════════════════════════════
function getLocationAuto() {
  if (!navigator.geolocation) {
    alert("Location not supported on this browser · இந்த browser-ல் இடம் கண்டறிய முடியாது");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      document.getElementById("inp-lat").value = pos.coords.latitude.toFixed(4);
      document.getElementById("inp-lon").value = pos.coords.longitude.toFixed(4);
      getWeather();
    },
    () => alert("Location access denied · இட அணுகல் மறுக்கப்பட்டது")
  );
}

// map WMO weather code to emoji
function weatherIcon(code) {
  if (code === 0)           return "☀️";
  if (code <= 3)            return "🌤";
  if (code <= 48)           return "🌫";
  if (code <= 55)           return "🌦";
  if (code <= 67)           return "🌧";
  if (code <= 77)           return "❄️";
  if (code <= 82)           return "🌦";
  if (code <= 99)           return "⛈";
  return "🌡";
}

function getWeather() {
  const lat = document.getElementById("inp-lat").value;
  const lon = document.getElementById("inp-lon").value;

  if (!lat || !lon) {
    alert("Enter latitude and longitude · அட்சரேகை மற்றும் தீர்க்கரேகையை உள்ளிடவும்");
    return;
  }

  hide("weather-result");
  show("weather-loading");

  fetch(`${API}/weather?lat=${lat}&lon=${lon}`)
    .then((res) => res.json())
    .then((data) => {
      hide("weather-loading");

      const c = data.current;
      document.getElementById("w-temp").textContent = c.temperature + "°C";
      document.getElementById("w-loc").textContent  = `📍 Lat: ${lat}, Lon: ${lon}`;
      document.getElementById("w-wind").textContent = `💨 Wind: ${c.windspeed} km/h`;

      // render alerts
      const alertsEl = document.getElementById("w-alerts");
      alertsEl.innerHTML = "";
      (data.alerts || []).forEach((msg) => {
        const div = document.createElement("div");
        const isGood = msg.toLowerCase().includes("good");
        div.className = "alert-box" + (isGood ? " alert-good" : "");
        div.textContent = (isGood ? "✅ " : "⚠️ ") + msg;
        alertsEl.appendChild(div);
      });

      // 7-day forecast grid
      const gridEl = document.getElementById("forecast-grid");
      gridEl.innerHTML = "";
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dates    = data.daily.time || [];

      dates.forEach((dateStr, i) => {
        const d       = new Date(dateStr);
        const maxT    = data.daily.temperature_2m_max   ? data.daily.temperature_2m_max[i]   : "–";
        const rain    = data.daily.precipitation_sum     ? data.daily.precipitation_sum[i]     : 0;
        const code    = data.daily.weathercode           ? data.daily.weathercode[i]           : 0;

        const div = document.createElement("div");
        div.className = "forecast-day";
        div.innerHTML = `
          <div class="day-name">${dayNames[d.getDay()]}</div>
          <div class="day-icon">${weatherIcon(code)}</div>
          <div class="day-max">${maxT}°</div>
          <div class="day-rain">${rain}mm</div>
        `;
        gridEl.appendChild(div);
      });

      show("weather-result");
    })
    .catch(() => {
      hide("weather-loading");
      alert("Weather fetch failed. Check the API. · வானிலை தரவு கிடைக்கவில்லை.");
    });
}

// ══════════════════════════════════════════════
// PAGE 4 — MARKET PRICES
// ══════════════════════════════════════════════
function getMarketPrices() {
  const state     = document.getElementById("inp-state").value;
  const commodity = document.getElementById("inp-commodity").value;

  hide("prices-result");
  show("prices-loading");

  fetch(`${API}/market-prices?state=${encodeURIComponent(state)}&commodity=${encodeURIComponent(commodity)}`)
    .then((res) => res.json())
    .then((data) => {
      hide("prices-loading");

      const records = data.data || [];
      const tbody   = document.getElementById("price-tbody");
      tbody.innerHTML = "";

      if (records.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center; color:var(--muted); padding:20px;">
              No data available · தரவு இல்லை
            </td>
          </tr>`;
      } else {
        records.forEach((r) => {
          const tr = document.createElement("tr");
          // handle both real API keys and demo data key names
          const market = r.market  || r.Market  || r.market_name  || "–";
          const minP   = r.min_price   || r.Min_x0020_Price   || r.min   || "–";
          const maxP   = r.max_price   || r.Max_x0020_Price   || r.max   || "–";
          const modal  = r.modal_price || r.Modal_x0020_Price || r.modal || "–";

          tr.innerHTML = `
            <td>${market}</td>
            <td>₹${minP}</td>
            <td>₹${maxP}</td>
            <td class="price-modal">₹${modal}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      // show source note
      const sourceEl = document.getElementById("price-source");
      if (data.source === "demo_data") {
        sourceEl.textContent = "⚠️ Demo data shown · Register at data.gov.in for live prices";
        sourceEl.style.color = "#854F0B";
      } else {
        sourceEl.textContent = "Source: Agmarknet / data.gov.in";
        sourceEl.style.color = "";
      }

      show("prices-result");
    })
    .catch(() => {
      hide("prices-loading");
      alert("Price fetch failed. Check the API. · விலை தரவு கிடைக்கவில்லை.");
    });
}
