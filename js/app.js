// ====== SYSTEM STATE ======
let appState = {
    mode: 'GHOST', // GHOST or IDENTIFY
    user: null,    // Name
    targetDate: new Date(), // Defaults to exactly right now
    isApproximate: false // True si falta la hora
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

// Planetas rápidos donde la hora impacta drásticamente la posición
const fastPlanets = ["MOON", "MERCURY", "VENUS"]; 

// ====== AUTH & MODAL LOGIC ======
function setAuth(mode) {
    if (mode === 'GHOST') {
        appState.mode = 'GHOST';
        appState.user = null;
        appState.targetDate = new Date(); // Reset to current actual time
        appState.isApproximate = false;   // Current time is exact
        
        document.getElementById('auth-status').innerHTML = `STATE: GHOST // <span style="color: var(--terminal-green);">VIEWING CURRENT TRANSITS</span>`;
        document.getElementById('user-display-info').innerHTML = `Tránsitos Actuales (Tiempo Real)`;
        document.getElementById('export-btn').style.display = 'none';
        
        calculatePositions();
    }
}

function openLoginModal() { document.getElementById('login-modal').style.display = 'flex'; }
function closeLoginModal() { document.getElementById('login-modal').style.display = 'none'; }

function submitLogin() {
    const name = document.getElementById('input-name').value.trim();
    const date = document.getElementById('input-date').value;
    const time = document.getElementById('input-time').value;

    if (!name || !date) {
        alert("NOMBRE y FECHA son obligatorios.");
        return;
    }

    appState.mode = 'IDENTIFY';
    appState.user = name;
    
    // Lógica de aproximación basada en la hora
    if (time) {
        appState.targetDate = new Date(`${date}T${time}:00`);
        appState.isApproximate = false;
        document.getElementById('user-display-info').innerHTML = `CARTA DE: ${name.toUpperCase()} // EXACTO`;
    } else {
        // Si no hay hora, calculamos al mediodía UTC como estándar astrológico aproximado
        appState.targetDate = new Date(`${date}T12:00:00Z`);
        appState.isApproximate = true;
        document.getElementById('user-display-info').innerHTML = `CARTA DE: ${name.toUpperCase()} // <span style="color:var(--c-personal)">HORA OMITIDA (Datos lunares aproximados)</span>`;
    }

    document.getElementById('auth-status').innerHTML = `STATE: IDENTIFIED // <span style="color: var(--ui-accent);">WRITE, SAVE, EDIT ENABLED</span>`;
    document.getElementById('export-btn').style.display = 'block';
    
    closeLoginModal();
    calculatePositions();
}

// ====== ASTRONOMY ENGINE ======
function getTrueIauConstellation(longitude) {
    if (longitude >= 29.0 && longitude < 53.5) return "Aries";
    if (longitude >= 53.5 && longitude < 90.2) return "Taurus";
    if (longitude >= 90.2 && longitude < 118.1) return "Gemini";
    if (longitude >= 118.1 && longitude < 138.2) return "Cancer";
    if (longitude >= 138.2 && longitude < 173.9) return "Leo";
    if (longitude >= 173.9 && longitude < 218.0) return "Virgo";
    if (longitude >= 218.0 && longitude < 241.0) return "Libra";
    if (longitude >= 241.0 && longitude < 247.7) return "Scorpius";
    if (longitude >= 247.7 && longitude < 266.3) return "Ophiuchus";
    if (longitude >= 266.3 && longitude < 299.7) return "Sagittarius";
    if (longitude >= 299.7 && longitude < 327.6) return "Capricornus";
    if (longitude >= 327.6 && longitude < 348.7) return "Aquarius";
    return "Pisces"; 
}

function calculatePositions() {
    let realTimeData = [];

    planetsCatalog.forEach(p => {
        const astroName = p.name.charAt(0) + p.name.slice(1).toLowerCase();
        
        try {
            const eclipticInfo = Astronomy.Ecliptic(astroName, appState.targetDate);
            const longitude = eclipticInfo.elon;
            const trueConstellation = getTrueIauConstellation(longitude);
            
            let localDegree = (longitude % 30).toFixed(1); 
            
            // UX LÓGICA: Añadir marcador de aproximación [~] si falta la hora en planetas rápidos
            let displayDegree = `${localDegree}°`;
            if (appState.isApproximate && fastPlanets.includes(p.name)) {
                displayDegree = `~${localDegree}°`; 
            }

            realTimeData.push({ 
                name: p.name, 
                constellation: trueConstellation, 
                degree: displayDegree 
            });
        } catch (error) {
            console.error(`Error calculando ${p.name}:`, error);
        }
    });

    renderDashboard(realTimeData);
}

// ====== RENDER ENGINE ======
const grid12Order = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpius", "Sagittarius", "Capricornus", "Aquarius", "Pisces"
];
const elementMap = {
    "Aries": "fuego", "Leo": "fuego", "Sagittarius": "fuego",
    "Taurus": "tierra", "Virgo": "tierra", "Capricornus": "tierra",
    "Cancer": "agua", "Scorpius": "agua", "Pisces": "agua",
    "Gemini": "aire", "Libra": "aire", "Aquarius": "aire", "Ophiuchus": "ophiuchus"
};

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
    
    ['fuego', 'tierra', 'aire', 'agua'].forEach(el => {
        const s = stats[el];
        outputHTML += `
        <div class="master-header ${el}">
            ${s.label} <div class="stats">[+${s.total} // ${s.p}P ; ${s.t}T]</div>
        </div>`;
    });

    grid12Order.forEach(sign => {
        outputHTML += `<div class="constellation-card">`;
        outputHTML += `  <div class="c-header ${elementMap[sign]}"><span>${sign}</span></div>`;
        outputHTML += `  <div class="planet-list">`;
        if (groupedData[sign].length > 0) {
            groupedData[sign].forEach(p => {
                outputHTML += `<div class="planet-item ${p.type}">${p.symbol} ${p.name} [${p.degree}]</div>`;
            });
        } else {
            outputHTML += `<div class="empty-slot">// VACÍO</div>`;
        }
        outputHTML += `  </div></div>`;
    });

    const oStats = stats['ophiuchus'];
    const oStatsText = oStats.total > 0 ? `[+${oStats.total} // ${oStats.p}P ; ${oStats.t}T]` : `[VACÍO]`;
    
    outputHTML += `<div class="constellation-card ophiuchus-span ophiuchus">`;
    outputHTML += `  <div class="c-header"><span>OPHIUCHUS</span> <span style="font-size:0.8rem; font-family:var(--font-code)">${oStatsText}</span></div>`;
    outputHTML += `  <div class="planet-list">`;
    if (groupedData["Ophiuchus"].length > 0) {
        groupedData["Ophiuchus"].forEach(p => {
            outputHTML += `<div class="planet-item ${p.type}">${p.symbol} ${p.name} [${p.degree}]</div>`;
        });
    } else {
        outputHTML += `<div class="empty-slot">// VACÍO</div>`;
    }
    outputHTML += `  </div></div>`;

    document.getElementById('dashboard-zone').innerHTML = outputHTML;
}

function exportToImage() {
    if(appState.mode !== 'IDENTIFY') return;
    const elementToCapture = document.getElementById('dashboard-zone');
    html2canvas(elementToCapture, { backgroundColor: "#050505", scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const link = document.createElement('a');
        const filenameSafeName = appState.user.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `TRUE_ASTRO_${filenameSafeName}.jpg`;
        link.href = imgData;
        link.click();
    });
}

// INICIO: Arrancar en modo GHOST (Cielo actual)
document.addEventListener("DOMContentLoaded", () => {
    setAuth('GHOST'); 
});