// ====== AUTHENTICATION LOGIC ======
let userState = 'GHOST';

function setAuth(state) {
    userState = state;
    const statusEl = document.getElementById('auth-status');
    const exportBtn = document.getElementById('export-btn');
    if (state === 'GHOST') {
        statusEl.innerHTML = `STATE: GHOST // <span style="color: var(--terminal-green);">CAN SEE. LOGIN TO SAVE.</span>`;
        exportBtn.style.display = 'none';
    } else if (state === 'IDENTIFY') {
        statusEl.innerHTML = `STATE: IDENTIFIED // <span style="color: var(--ui-accent);">CAN WRITE, SAVE AND EDIT.</span>`;
        exportBtn.style.display = 'block';
    }
}

// ====== DATA STRUCTURES ======
const grid12Order = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpius",
    "Sagittarius", "Capricornus", "Aquarius", "Pisces"
];

const elementMap = {
    "Aries": "fuego", "Leo": "fuego", "Sagittarius": "fuego",
    "Taurus": "tierra", "Virgo": "tierra", "Capricornus": "tierra",
    "Cancer": "agua", "Scorpius": "agua", "Pisces": "agua",
    "Gemini": "aire", "Libra": "aire", "Aquarius": "aire",
    "Ophiuchus": "ophiuchus"
};

const planetsCatalog = [
    { name: "SUN", symbol: "☉", type: "personal" },
    { name: "MOON", symbol: "☽", type: "personal" },
    { name: "MERCURY", symbol: "☿", type: "personal" },
    { name: "VENUS", symbol: "♀", type: "personal" },
    { name: "MARS", symbol: "♂", type: "personal" },
    { name: "JUPITER", symbol: "♃", type: "transpersonal" },
    { name: "SATURN", symbol: "♄", type: "transpersonal" },
    { name: "URANUS", symbol: "♅", type: "transpersonal" },
    { name: "NEPTUNE", symbol: "♆", type: "transpersonal" },
    { name: "PLUTO", symbol: "♇", type: "transpersonal" }
];

// Baseline Data (1996-05-06)
const data1996 = [
    { name: "SUN", constellation: "Aries", degree: 16.4 },
    { name: "MERCURY", constellation: "Aries", degree: 22.1 },
    { name: "VENUS", constellation: "Taurus", degree: 5.3 },
    { name: "MOON", constellation: "Sagittarius", degree: 12.8 },
    { name: "MARS", constellation: "Pisces", degree: 28.5 },
    { name: "JUPITER", constellation: "Sagittarius", degree: 18.0 },
    { name: "SATURN", constellation: "Pisces", degree: 2.1 },
    { name: "URANUS", constellation: "Aquarius", degree: 3.5 },
    { name: "NEPTUNE", constellation: "Capricornus", degree: 27.2 },
    { name: "PLUTO", constellation: "Ophiuchus", degree: 4.7 }
];

// ====== CORE RENDER ENGINE ======
function renderDashboard(planetaryData) {
    let groupedData = {};
    grid12Order.forEach(c => groupedData[c] = []);
    groupedData["Ophiuchus"] = [];

    let stats = {
        fuego: { total: 0, p: 0, t: 0, label: 'FUEGO' },
        tierra: { total: 0, p: 0, t: 0, label: 'TIERRA' },
        aire: { total: 0, p: 0, t: 0, label: 'AIRE' },
        agua: { total: 0, p: 0, t: 0, label: 'AGUA' },
        ophiuchus: { total: 0, p: 0, t: 0, label: 'OPHIUCHUS' }
    };

    planetaryData.forEach(pos => {
        const pInfo = planetsCatalog.find(p => p.name === pos.name);
        const el = elementMap[pos.constellation];
        
        if(groupedData[pos.constellation]) {
            groupedData[pos.constellation].push({ ...pInfo, degree: pos.degree });
        }
        
        if(el) {
            stats[el].total++;
            if(pInfo.type === 'personal') stats[el].p++;
            if(pInfo.type === 'transpersonal') stats[el].t++;
        }
    });

    let outputHTML = "";
    
    // 1. Render Headers
    ['fuego', 'tierra', 'aire', 'agua'].forEach(el => {
        const s = stats[el];
        outputHTML += `
        <div class="master-header ${el}">
            ${s.label}
            <div class="stats">[+${s.total} // ${s.p}P ; ${s.t}T]</div>
        </div>`;
    });

    // 2. Render 12 Signs
    grid12Order.forEach(sign => {
        outputHTML += `<div class="constellation-card">`;
        outputHTML += `  <div class="c-header ${elementMap[sign]}"><span>${sign}</span></div>`;
        outputHTML += `  <div class="planet-list">`;
        if (groupedData[sign].length > 0) {
            groupedData[sign].forEach(p => {
                outputHTML += `<div class="planet-item ${p.type}">${p.symbol} ${p.name} (${p.degree}°)</div>`;
            });
        } else {
            outputHTML += `<div class="empty-slot">// VACÍO</div>`;
        }
        outputHTML += `  </div></div>`;
    });

    // 3. Render Ophiuchus
    const oStats = stats['ophiuchus'];
    const oStatsText = oStats.total > 0 ? `[+${oStats.total} // ${oStats.p}P ; ${oStats.t}T]` : `[VACÍO]`;
    
    outputHTML += `<div class="constellation-card ophiuchus-span ophiuchus">`;
    outputHTML += `  <div class="c-header"><span>OPHIUCHUS</span> <span style="font-size:0.7rem; font-family:var(--font-code)">${oStatsText}</span></div>`;
    outputHTML += `  <div class="planet-list">`;
    if (groupedData["Ophiuchus"].length > 0) {
        groupedData["Ophiuchus"].forEach(p => {
            outputHTML += `<div class="planet-item ${p.type}">${p.symbol} ${p.name} (${p.degree}°)</div>`;
        });
    } else {
        outputHTML += `<div class="empty-slot">// VACÍO</div>`;
    }
    outputHTML += `  </div></div>`;

    document.getElementById('dashboard-zone').innerHTML = outputHTML;
}

// ====== DATE & CALCULATION CONTROLLER ======
function updateDate() {
    const selectedDate = document.getElementById('date-picker').value;
    
    if (selectedDate === "1996-05-06") {
        renderDashboard(data1996);
    } else {
        // TODO: Reemplazar esta lógica de MOCK por un motor astronómico real (ej. astronomy-engine)
        let mockData = planetsCatalog.map(p => {
            const allSigns = [...grid12Order, "Ophiuchus"];
            const randomSign = allSigns[Math.floor(Math.random() * allSigns.length)];
            const randomDeg = (Math.random() * 30).toFixed(1);
            return { name: p.name, constellation: randomSign, degree: randomDeg };
        });
        renderDashboard(mockData);
    }
}

// ====== EXPORT MODULE ======
function exportToImage() {
    if(userState !== 'IDENTIFY') return;
    
    const elementToCapture = document.getElementById('dashboard-zone');
    html2canvas(elementToCapture, { backgroundColor: "#050505", scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const link = document.createElement('a');
        const dateStr = document.getElementById('date-picker').value;
        link.download = `TRUE_ASTRO_POSITIONS_${dateStr}.jpg`;
        link.href = imgData;
        link.click();
    });
}

// Initialize on load
renderDashboard(data1996);