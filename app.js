/* ═══════════════════════════════════════════════════════════════════════
   3D SATELLITE TRACKER — app.js
   Stack: CesiumJS + satellite.js + CelesTrak API  |  No backend.
   ═══════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────────
   M1 · CONFIG, CONSTANTS & STATE
   ───────────────────────────────────────────────────────────────────────── */

const CELESTRAK_BASE = 'https://celestrak.org/gp.php';
const CORS_PROXY     = 'https://corsproxy.io/?';

const DEFAULT_LOCATION = { name: 'Nottingham', lat: 52.9548, lon: -1.1581, alt: 0.05 };

const LOCATIONS = {
  'United Kingdom': [
    { name: 'Nottingham',  lat: 52.9548, lon:  -1.1581, alt: 0.05 },
    { name: 'London',      lat: 51.5074, lon:  -0.1278, alt: 0.02 },
    { name: 'Manchester',  lat: 53.4808, lon:  -2.2426, alt: 0.05 },
    { name: 'Edinburgh',   lat: 55.9533, lon:  -3.1883, alt: 0.13 },
    { name: 'Birmingham',  lat: 52.4862, lon:  -1.8904, alt: 0.14 },
    { name: 'Cardiff',     lat: 51.4816, lon:  -3.1791, alt: 0.02 },
    { name: 'Belfast',     lat: 54.5973, lon:  -5.9301, alt: 0.07 },
  ],
  'Europe': [
    { name: 'Paris',       lat: 48.8566, lon:   2.3522, alt: 0.04 },
    { name: 'Berlin',      lat: 52.5200, lon:  13.4050, alt: 0.05 },
    { name: 'Madrid',      lat: 40.4168, lon:  -3.7038, alt: 0.66 },
    { name: 'Rome',        lat: 41.9028, lon:  12.4964, alt: 0.02 },
    { name: 'Amsterdam',   lat: 52.3676, lon:   4.9041, alt: 0.01 },
    { name: 'Stockholm',   lat: 59.3293, lon:  18.0686, alt: 0.03 },
    { name: 'Warsaw',      lat: 52.2297, lon:  21.0122, alt: 0.11 },
    { name: 'Kyiv',        lat: 50.4501, lon:  30.5234, alt: 0.18 },
    { name: 'Moscow',      lat: 55.7558, lon:  37.6173, alt: 0.15 },
    { name: 'Istanbul',    lat: 41.0082, lon:  28.9784, alt: 0.10 },
  ],
  'North America': [
    { name: 'New York',    lat: 40.7128, lon: -74.0060, alt: 0.01 },
    { name: 'Los Angeles', lat: 34.0522, lon:-118.2437, alt: 0.07 },
    { name: 'Chicago',     lat: 41.8781, lon: -87.6298, alt: 0.18 },
    { name: 'Houston',     lat: 29.7604, lon: -95.3698, alt: 0.03 },
    { name: 'Toronto',     lat: 43.6532, lon: -79.3832, alt: 0.07 },
    { name: 'Vancouver',   lat: 49.2827, lon:-123.1207, alt: 0.07 },
    { name: 'Mexico City', lat: 19.4326, lon: -99.1332, alt: 2.24 },
  ],
  'Asia': [
    { name: 'Tokyo',       lat: 35.6762, lon: 139.6503, alt: 0.04 },
    { name: 'Beijing',     lat: 39.9042, lon: 116.4074, alt: 0.05 },
    { name: 'Shanghai',    lat: 31.2304, lon: 121.4737, alt: 0.02 },
    { name: 'Mumbai',      lat: 19.0760, lon:  72.8777, alt: 0.01 },
    { name: 'Delhi',       lat: 28.7041, lon:  77.1025, alt: 0.22 },
    { name: 'Singapore',   lat:  1.3521, lon: 103.8198, alt: 0.02 },
    { name: 'Dubai',       lat: 25.2048, lon:  55.2708, alt: 0.01 },
    { name: 'Seoul',       lat: 37.5665, lon: 126.9780, alt: 0.04 },
    { name: 'Bangkok',     lat: 13.7563, lon: 100.5018, alt: 0.01 },
  ],
  'Oceania': [
    { name: 'Sydney',      lat: -33.8688, lon: 151.2093, alt: 0.03 },
    { name: 'Melbourne',   lat: -37.8136, lon: 144.9631, alt: 0.03 },
    { name: 'Auckland',    lat: -36.8509, lon: 174.7645, alt: 0.05 },
  ],
  'South America': [
    { name: 'São Paulo',   lat: -23.5505, lon: -46.6333, alt: 0.76 },
    { name: 'Buenos Aires',lat: -34.6037, lon: -58.3816, alt: 0.02 },
    { name: 'Bogotá',      lat:  4.7110,  lon: -74.0721, alt: 2.60 },
    { name: 'Lima',        lat: -12.0464, lon: -77.0428, alt: 0.15 },
  ],
  'Africa': [
    { name: 'Cairo',       lat: 30.0444, lon:  31.2357, alt: 0.02 },
    { name: 'Lagos',       lat:  6.5244, lon:   3.3792, alt: 0.01 },
    { name: 'Nairobi',     lat: -1.2921, lon:  36.8219, alt: 1.79 },
    { name: 'Cape Town',   lat:-33.9249, lon:  18.4241, alt: 0.05 },
  ],
};

// CelesTrak GROUP ids → display metadata
const SAT_GROUPS = {
  stations:   { label: 'Space Stations',    color: '#FFD700', desc: 'ISS, Tiangong & crewed vehicles' },
  visual:     { label: 'Brightest Objects', color: '#00FF88', desc: 'Top ~100 naked-eye satellites' },
  weather:    { label: 'Weather',           color: '#4FC3F7', desc: 'Meteorological satellites' },
  noaa:       { label: 'NOAA',             color: '#29B6F6', desc: 'NOAA polar weather sats' },
  goes:       { label: 'GOES',             color: '#9C27B0', desc: 'GOES geostationary weather' },
  'gps-ops':  { label: 'GPS',              color: '#FF6B6B', desc: 'GPS operational constellation' },
  'glo-ops':  { label: 'GLONASS',          color: '#FF8C42', desc: 'Russian GNSS constellation' },
  galileo:    { label: 'Galileo',          color: '#FFA726', desc: 'European GNSS constellation' },
  amateur:    { label: 'Amateur Radio',     color: '#A78BFA', desc: 'Ham radio satellites' },
  science:    { label: 'Science',          color: '#2DD4BF', desc: 'Scientific research satellites' },
  starlink:   { label: 'Starlink',         color: '#38BDF8', desc: 'SpaceX Starlink megaconstellation' },
  'oneweb':   { label: 'OneWeb',           color: '#60A5FA', desc: 'OneWeb broadband constellation' },
  cubesat:    { label: 'CubeSats',         color: '#94A3B8', desc: 'Small cube-format satellites' },
  military:   { label: 'Military',         color: '#F43F5E', desc: 'Military / classified satellites' },
};

// ── App state ────────────────────────────────────────────────────────────
let viewer        = null;   // CesiumJS Viewer instance
let pointCol      = null;   // PointPrimitiveCollection for satellite dots
let observer      = { ...DEFAULT_LOCATION };  // current ground observer
let allSats       = [];     // flat array of all loaded satellite objects
let loadedGroups  = {};     // groupId → { sats[], active: bool }
let selectedSat   = null;   // currently selected satellite object
let orbitEntity   = null;   // polyline entity for orbit track
let footprintEnt  = null;   // ellipse entity for satellite footprint
let observerEnt   = null;   // observer ground marker entity
let passResults   = [];     // computed pass rows for the table
let posUpdateTimer = null;  // setInterval handle for position refresh
let isNightMode    = true;

/* ─────────────────────────────────────────────────────────────────────────
   M2 · CELESTRAK TLE FETCHER
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Fetch TLE text for a CelesTrak group.
 * Tries direct fetch first; falls back to corsproxy.io on network/CORS failure.
 */
async function fetchTLEGroup(groupId) {
  const url = `${CELESTRAK_BASE}?GROUP=${groupId}&FORMAT=tle`;

  // 1 — direct (works when served from http:// or when CelesTrak sends CORS headers)
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (res.ok) {
      const text = await res.text();
      if (text.includes('1 ') && text.includes('2 ')) return text;
    }
  } catch (_) { /* fall through */ }

  // 2 — CORS proxy fallback (covers file:// and restrictive browsers)
  const proxyUrl = CORS_PROXY + encodeURIComponent(url);
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`CelesTrak fetch failed (${res.status}) for group: ${groupId}`);
  return res.text();
}

/**
 * Parse raw 3-line TLE text into satellite objects.
 * Handles both "name / line1 / line2" triplets and bare "line1 / line2" pairs.
 * Returns array of: { name, tle1, tle2, satrec, group, color, point: null }
 */
function parseTLEText(text, groupId) {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const color = SAT_GROUPS[groupId]?.color ?? '#ffffff';
  const sats  = [];
  let i = 0;

  while (i < lines.length) {
    let name, tle1, tle2;

    if (lines[i + 1]?.startsWith('1 ') && lines[i + 2]?.startsWith('2 ')) {
      // Standard 3-line TLE
      name = lines[i];
      tle1 = lines[i + 1];
      tle2 = lines[i + 2];
      i += 3;
    } else if (lines[i].startsWith('1 ') && lines[i + 1]?.startsWith('2 ')) {
      // 2-line TLE (no name)
      name = `NORAD ${lines[i].substring(2, 7).trim()}`;
      tle1 = lines[i];
      tle2 = lines[i + 1];
      i += 2;
    } else {
      i++;
      continue;
    }

    try {
      const satrec = satellite.twoline2satrec(tle1, tle2);
      sats.push({ name: name.trim(), tle1, tle2, satrec, group: groupId, color, point: null });
    } catch (_) {
      // Malformed TLE — skip silently
    }
  }

  return sats;
}

/**
 * Load a group, add its satellites to allSats, and render dots on the globe.
 * Safe to call again if the group is already loaded (no-ops).
 */
async function loadGroup(groupId) {
  if (loadedGroups[groupId]) return;          // already loaded
  loadedGroups[groupId] = { sats: [], active: true };

  const text = await fetchTLEGroup(groupId);
  const sats = parseTLEText(text, groupId);
  loadedGroups[groupId].sats = sats;
  allSats.push(...sats);

  // Render immediately if globe is ready
  if (pointCol) renderGroupPoints(sats);
}

/* ─────────────────────────────────────────────────────────────────────────
   M3 · ORBITAL MECHANICS  (satellite.js SGP4 wrappers)
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Propagate a satellite to a given Date.
 * Returns { lat, lon, alt(km), velKms } or null if propagation fails.
 */
function getSatPosition(satrec, date) {
  try {
    const pv = satellite.propagate(satrec, date);
    if (!pv.position || pv.position.x !== pv.position.x) return null;

    const gmst = satellite.gstime(date);
    const gd   = satellite.eciToGeodetic(pv.position, gmst);

    const velKms = pv.velocity
      ? Math.sqrt(pv.velocity.x ** 2 + pv.velocity.y ** 2 + pv.velocity.z ** 2)
      : null;

    return {
      lat:   satellite.degreesLat(gd.latitude),
      lon:   satellite.degreesLong(gd.longitude),
      alt:   gd.height,
      velKms,
    };
  } catch (_) {
    return null;
  }
}

/** Build a geodetic observer object (radians) for satellite.js. altKm in km. */
function makeObserverGd(lat, lon, altKm = 0) {
  return {
    longitude: satellite.degreesToRadians(lon),
    latitude:  satellite.degreesToRadians(lat),
    height:    altKm,
  };
}

/**
 * Elevation and azimuth (degrees) from observer to satellite at a given Date.
 * Returns { elevation, azimuth, range } or null.
 */
function getElevAz(satrec, observerGd, date) {
  try {
    const pv = satellite.propagate(satrec, date);
    if (!pv.position || pv.position.x !== pv.position.x) return null;

    const gmst   = satellite.gstime(date);
    const posEcf = satellite.eciToEcf(pv.position, gmst);
    const look   = satellite.ecfToLookAngles(observerGd, posEcf);

    return {
      elevation: satellite.radiansToDegrees(look.elevation),
      azimuth:   satellite.radiansToDegrees(look.azimuth),
      range:     look.rangeSat,
    };
  } catch (_) {
    return null;
  }
}

/** Orbital period in minutes from satrec.no (rad/min). */
function orbitalPeriodMin(satrec) {
  return (2 * Math.PI) / satrec.no;
}

/**
 * Compute one full orbital period worth of Cesium Cartesian3 positions
 * for drawing an orbit track. stepSec controls sample density.
 */
function computeOrbitCartesians(satrec, startDate, stepSec = 60) {
  const periodMin = Math.min(orbitalPeriodMin(satrec), 1500); // cap at ~25 h (GEO+)
  const steps     = Math.ceil((periodMin * 60) / stepSec);
  const positions = [];

  for (let i = 0; i <= steps; i++) {
    const t   = new Date(startDate.getTime() + i * stepSec * 1000);
    const pos = getSatPosition(satrec, t);
    if (!pos) continue;
    positions.push(Cesium.Cartesian3.fromDegrees(pos.lon, pos.lat, pos.alt * 1000));
  }

  return positions;
}

/* ─────────────────────────────────────────────────────────────────────────
   M4 · SOLAR POSITION  (for pass visibility classification)
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Approximate solar elevation angle (degrees) at a lat/lon on a given Date.
 * Accurate to ±1° — good enough for day/night/twilight classification.
 *
 * Algorithm: low-precision solar coordinates from the Astronomical Almanac.
 */
function sunElevation(lat, lon, date) {
  const D2R = Math.PI / 180;
  const R2D = 180 / Math.PI;

  // Julian date
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n  = jd - 2451545.0; // days from J2000.0

  // Mean longitude and mean anomaly (degrees)
  const L = (280.460 + 0.9856474 * n) % 360;
  const g = (357.528 + 0.9856003 * n) % 360;

  // Ecliptic longitude (degrees)
  const lambda = L + 1.915 * Math.sin(g * D2R) + 0.020 * Math.sin(2 * g * D2R);

  // Obliquity of the ecliptic
  const epsilon = 23.439 - 0.0000004 * n;

  // Right ascension and declination
  const sinLambda = Math.sin(lambda * D2R);
  const sinEps    = Math.sin(epsilon * D2R);
  const cosEps    = Math.cos(epsilon * D2R);
  const ra        = Math.atan2(cosEps * sinLambda, Math.cos(lambda * D2R)) * R2D;
  const dec       = Math.asin(sinEps * sinLambda) * R2D;

  // Greenwich Mean Sidereal Time (degrees)
  const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545.0)) % 360;

  // Hour angle
  const ha = gmst + lon - ra;

  // Elevation
  const latR  = lat * D2R;
  const decR  = dec * D2R;
  const haR   = ha  * D2R;
  const sinEl = Math.sin(latR) * Math.sin(decR) + Math.cos(latR) * Math.cos(decR) * Math.cos(haR);

  return Math.asin(Math.max(-1, Math.min(1, sinEl))) * R2D;
}

/**
 * Classify pass visibility based on sun elevation at observer during the pass.
 * Returns one of: 'night' | 'twilight' | 'day'
 * Satellites are visible to naked eye only during night/twilight
 * (observer in darkness, satellite in sunlight).
 */
function passVisibility(lat, lon, date) {
  const el = sunElevation(lat, lon, date);
  if (el < -12) return 'night';
  if (el <   0) return 'twilight';
  return 'day';
}

/* ─────────────────────────────────────────────────────────────────────────
   M5 · PASS PREDICTION ENGINE
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Predict passes of a single satellite over an observer location.
 *
 * @param {Object}  satrec       - satellite.js record
 * @param {Object}  observerGd   - geodetic observer (radians, km)
 * @param {Date}    startTime
 * @param {number}  hours        - prediction window
 * @param {number}  minElevDeg   - minimum elevation threshold
 * @returns {Array} passes — each: { aos, maxEl, maxElTime, maxAz, los, duration }
 */
function predictPasses(satrec, observerGd, startTime, hours, minElevDeg) {
  const passes  = [];
  const endMs   = startTime.getTime() + hours * 3_600_000;
  const STEP_MS = 60_000; // 1-minute scan step

  let inPass = false;
  let cur    = null;

  for (let ms = startTime.getTime(); ms <= endMs; ms += STEP_MS) {
    const date = new Date(ms);
    const look = getElevAz(satrec, observerGd, date);
    if (!look) continue;

    const { elevation, azimuth } = look;

    if (elevation >= minElevDeg) {
      if (!inPass) {
        inPass = true;
        cur = { aos: date, maxEl: elevation, maxElTime: date, maxAz: azimuth, los: null };
      } else if (elevation > cur.maxEl) {
        cur.maxEl     = elevation;
        cur.maxElTime = date;
        cur.maxAz     = azimuth;
      }
    } else if (inPass) {
      inPass    = false;
      cur.los   = date;
      cur.duration = cur.los - cur.aos;
      passes.push(cur);
      cur = null;
    }
  }

  // Pass still in progress at end of window
  if (inPass && cur) {
    cur.los      = new Date(endMs);
    cur.duration = cur.los - cur.aos;
    passes.push(cur);
  }

  return passes;
}

/**
 * Run pass prediction for every loaded satellite, in async batches so the
 * UI stays responsive.  Updates the pass table progressively.
 *
 * @param {Object} opts - { minElevDeg, hours }
 * @returns {Promise<Array>} all pass rows sorted by AOS
 */
async function runPassPrediction({ minElevDeg, hours }) {
  const sats = [...allSats];
  if (!sats.length) return [];

  // UI: show progress
  document.getElementById('lbl-predict').style.display  = 'none';
  document.getElementById('lbl-progress').style.display = 'inline-flex';
  document.getElementById('btn-predict').disabled = true;

  const observerGd = makeObserverGd(observer.lat, observer.lon, observer.alt);
  const startTime  = new Date();
  const results    = [];
  const BATCH      = 30;

  for (let i = 0; i < sats.length; i += BATCH) {
    const batch = sats.slice(i, i + BATCH);

    for (const sat of batch) {
      const passes = predictPasses(sat.satrec, observerGd, startTime, hours, minElevDeg);
      for (const pass of passes) {
        results.push({
          sat,
          ...pass,
          visibility: passVisibility(observer.lat, observer.lon, pass.maxElTime),
        });
      }
    }

    // Yield to render thread between batches
    await new Promise(r => setTimeout(r, 0));
  }

  // Sort soonest first
  results.sort((a, b) => a.aos - b.aos);
  passResults = results;

  // UI: restore button
  document.getElementById('lbl-predict').style.display  = 'inline';
  document.getElementById('lbl-progress').style.display = 'none';
  document.getElementById('btn-predict').disabled = false;

  return results;
}

/**
 * Remove a group's satellites from the globe and allSats.
 */
function unloadGroup(groupId) {
  const entry = loadedGroups[groupId];
  if (!entry) return;

  // Remove point primitives
  entry.sats.forEach(sat => {
    if (sat.point && !sat.point.isDestroyed?.()) {
      pointCol.remove(sat.point);
      sat.point = null;
    }
  });

  // Remove from flat array
  allSats = allSats.filter(s => s.group !== groupId);
  delete loadedGroups[groupId];
}

/* ─────────────────────────────────────────────────────────────────────────
   M6 · CESIUMJS GLOBE INITIALISATION
   ───────────────────────────────────────────────────────────────────────── */

async function initGlobe() {
  // Use the NaturalEarthII texture bundled with CesiumJS — no API key needed
  const imageryProvider = await Cesium.TileMapServiceImageryProvider.fromUrl(
    Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),
    { maximumLevel: 5 }
  );

  viewer = new Cesium.Viewer('cesium-container', {
    imageryProvider,
    terrainProvider:       new Cesium.EllipsoidTerrainProvider(),
    baseLayerPicker:       false,
    geocoder:              false,
    homeButton:            false,
    sceneModePicker:       true,   // let user toggle 2D/3D/Columbus
    navigationHelpButton:  false,
    animation:             false,
    timeline:              false,
    fullscreenButton:      true,
    vrButton:              false,
    infoBox:               false,
    selectionIndicator:    false,
    shadows:               false,
  });

  // Dark space aesthetic
  viewer.scene.backgroundColor            = new Cesium.Color(0.02, 0.04, 0.08, 1);
  viewer.scene.globe.enableLighting       = true;      // real day/night terminator
  viewer.scene.globe.atmosphereLightIntensity = 8.0;
  viewer.scene.skyAtmosphere.show         = true;
  viewer.scene.fog.enabled                = false;

  // Create the shared PointPrimitiveCollection for all satellite dots
  pointCol = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());

  // Observer ground marker
  addObserverMarker();

  // Fly camera to observer on startup
  flyToObserver(false);

  // Wire up interactions
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction(e => {
    const picked = viewer.scene.pick(e.position);
    if (Cesium.defined(picked) && picked.id && picked.id.__satData) {
      selectSatellite(picked.id.__satData);
    } else {
      deselectSatellite();
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handler.setInputAction(e => {
    const picked = viewer.scene.pick(e.endPosition);
    if (Cesium.defined(picked) && picked.id && picked.id.__satData) {
      showHoverTip(picked.id.__satData, e.endPosition);
    } else {
      hideHoverTip();
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

/** Place/move the observer ground-station marker entity. */
function addObserverMarker() {
  if (observerEnt) viewer.entities.remove(observerEnt);

  observerEnt = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(observer.lon, observer.lat, 0),
    point: {
      pixelSize:    10,
      color:        Cesium.Color.fromCssColorString('#00ff88'),
      outlineColor: Cesium.Color.fromCssColorString('#003322'),
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text:              observer.name,
      font:              '11px monospace',
      fillColor:         Cesium.Color.fromCssColorString('#00ff88'),
      outlineColor:      Cesium.Color.BLACK,
      outlineWidth:      2,
      style:             Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin:    Cesium.VerticalOrigin.BOTTOM,
      pixelOffset:       new Cesium.Cartesian2(0, -14),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8e6),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}

/** Smooth camera flight to the current observer location. */
function flyToObserver(animate = true) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(observer.lon, observer.lat, 4_500_000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch:   Cesium.Math.toRadians(-55),
      roll:    0,
    },
    duration: animate ? 2.5 : 0,
  });
}

/** Toggle Earth night-side lighting on/off. */
function toggleNightMode() {
  isNightMode = !isNightMode;
  viewer.scene.globe.enableLighting = isNightMode;
  document.getElementById('btn-night').textContent = isNightMode ? '☀' : '🌕';
}

/* ─────────────────────────────────────────────────────────────────────────
   M7 · SATELLITE RENDERING
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Add PointPrimitive dots for a freshly loaded array of satellite objects.
 * Each point gets a back-reference to its satellite data via `.id.__satData`.
 */
function renderGroupPoints(sats) {
  const now = new Date();
  const observerGd = makeObserverGd(observer.lat, observer.lon, observer.alt);

  for (const sat of sats) {
    if (sat.point) continue; // already rendered

    const pos = getSatPosition(sat.satrec, now);
    if (!pos) continue;

    const look    = getElevAz(sat.satrec, observerGd, now);
    const overhead = look && look.elevation > 0;

    const base = Cesium.Color.fromCssColorString(sat.color);
    const color = overhead
      ? Cesium.Color.WHITE.withAlpha(0.95)
      : base.withAlpha(0.65);

    // Use a plain object as the primitive's id so we can attach __satData
    const idObj = { __satData: sat };

    sat.point = pointCol.add({
      position:  Cesium.Cartesian3.fromDegrees(pos.lon, pos.lat, pos.alt * 1000),
      color,
      pixelSize: overhead ? 6 : 3.5,
      id:        idObj,
      scaleByDistance:   new Cesium.NearFarScalar(1e6, 1.8, 5e7, 0.4),
      translucencyByDistance: new Cesium.NearFarScalar(1e7, 1.0, 8e7, 0.3),
    });
  }
}

/**
 * Refresh every satellite's position dot and overhead colouring.
 * Called on a timer every N seconds.
 */
function updateAllPositions() {
  if (!pointCol || !allSats.length) return;

  const now        = new Date();
  const observerGd = makeObserverGd(observer.lat, observer.lon, observer.alt);
  let   nOverhead  = 0;

  for (const sat of allSats) {
    if (!sat.point) continue;

    const pos = getSatPosition(sat.satrec, now);
    if (!pos) {
      sat.point.show = false;
      continue;
    }

    sat.point.show     = true;
    sat.point.position = Cesium.Cartesian3.fromDegrees(pos.lon, pos.lat, pos.alt * 1000);

    const look     = getElevAz(sat.satrec, observerGd, now);
    const overhead = look && look.elevation > 0;

    if (overhead) {
      nOverhead++;
      sat.point.color     = Cesium.Color.WHITE.withAlpha(0.95);
      sat.point.pixelSize = 6;
    } else {
      const base          = Cesium.Color.fromCssColorString(sat.color);
      sat.point.color     = base.withAlpha(0.6);
      sat.point.pixelSize = 3.5;
    }
  }

  // Update the selected satellite's info card live
  if (selectedSat) refreshSatInfoCard(selectedSat, now, observerGd);

  // Update stats
  document.getElementById('n-loaded').textContent  = allSats.length.toLocaleString();
  document.getElementById('n-overhead').textContent = nOverhead.toLocaleString();
}

/* ─────────────────────────────────────────────────────────────────────────
   M8 · GLOBE INTERACTIONS
   Click → select satellite, show orbit track + footprint + info card
   Hover → tooltip with name & altitude
   ───────────────────────────────────────────────────────────────────────── */

function selectSatellite(sat) {
  deselectSatellite();           // clear any previous selection
  selectedSat = sat;

  // Highlight the point
  if (sat.point) {
    sat.point.pixelSize = 10;
    sat.point.color     = Cesium.Color.WHITE;
    sat.point.outlineColor = Cesium.Color.fromCssColorString(sat.color);
    sat.point.outlineWidth = 2;
  }

  showOrbitTrack(sat);
  showFootprint(sat);

  // Show info panel
  const observerGd = makeObserverGd(observer.lat, observer.lon, observer.alt);
  refreshSatInfoCard(sat, new Date(), observerGd);
  document.getElementById('sec-satinfo').style.display = '';

  // Highlight matching row in pass table
  document.querySelectorAll('#pass-tbody tr').forEach(tr => {
    tr.classList.toggle('highlighted', tr.dataset.satName === sat.name);
  });
}

function deselectSatellite() {
  if (!selectedSat) return;

  // Restore point appearance
  if (selectedSat.point) {
    selectedSat.point.pixelSize    = 3.5;
    selectedSat.point.outlineWidth = 0;
    selectedSat.point.color = Cesium.Color.fromCssColorString(selectedSat.color).withAlpha(0.65);
  }

  clearOrbitTrack();
  clearFootprint();
  selectedSat = null;
  document.getElementById('sec-satinfo').style.display = 'none';
  document.querySelectorAll('#pass-tbody tr').forEach(tr => tr.classList.remove('highlighted'));
}

/** Draw the orbit track polyline for the selected satellite. */
function showOrbitTrack(sat) {
  clearOrbitTrack();

  const positions = computeOrbitCartesians(sat.satrec, new Date(), 60);
  if (positions.length < 2) return;

  orbitEntity = viewer.entities.add({
    polyline: {
      positions,
      width: 1.2,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.15,
        color:     Cesium.Color.fromCssColorString(sat.color).withAlpha(0.8),
      }),
      arcType: Cesium.ArcType.NONE,
    },
  });
}

function clearOrbitTrack() {
  if (orbitEntity) {
    viewer.entities.remove(orbitEntity);
    orbitEntity = null;
  }
}

/**
 * Draw the satellite's ground footprint — the circle on Earth's surface
 * from which the satellite is above the horizon (elev > 0°).
 *
 * Footprint half-angle ρ = arccos(Re / (Re + alt))  (Re = 6371 km)
 */
function showFootprint(sat) {
  clearFootprint();

  const pos = getSatPosition(sat.satrec, new Date());
  if (!pos) return;

  const Re         = 6371;                           // km
  const halfAngle  = Math.acos(Re / (Re + pos.alt)); // radians
  const radiusM    = halfAngle * Re * 1000;           // metres on surface

  footprintEnt = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(pos.lon, pos.lat, 0),
    ellipse: {
      semiMajorAxis: radiusM,
      semiMinorAxis: radiusM,
      material:      Cesium.Color.fromCssColorString(sat.color).withAlpha(0.06),
      outline:       true,
      outlineColor:  Cesium.Color.fromCssColorString(sat.color).withAlpha(0.35),
      outlineWidth:  1,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
  });
}

function clearFootprint() {
  if (footprintEnt) {
    viewer.entities.remove(footprintEnt);
    footprintEnt = null;
  }
}

/** Populate the satellite info card in the sidebar. */
function refreshSatInfoCard(sat, now, observerGd) {
  const pos  = getSatPosition(sat.satrec, now);
  const look = pos ? getElevAz(sat.satrec, observerGd, now) : null;

  const group = SAT_GROUPS[sat.group] ?? { label: sat.group };
  const norad = sat.tle2.substring(2, 7).trim();

  const rows = [
    ['Name',     sat.name],
    ['NORAD ID', norad],
    ['Category', group.label],
    ['Altitude', pos ? `${pos.alt.toFixed(1)} km` : '—'],
    ['Velocity', pos?.velKms ? `${pos.velKms.toFixed(2)} km/s` : '—'],
    ['Lat / Lon', pos ? `${pos.lat.toFixed(2)}° / ${pos.lon.toFixed(2)}°` : '—'],
    ['Elevation', look
        ? `<span class="${look.elevation > 0 ? 'overhead' : ''}">${look.elevation.toFixed(1)}°</span>`
        : '—'],
    ['Azimuth',  look ? `${look.azimuth.toFixed(1)}°` : '—'],
    ['Range',    look ? `${look.range.toFixed(0)} km` : '—'],
  ];

  document.getElementById('satinfo-body').innerHTML =
    `<div class="sat-name-big">${sat.name}</div>` +
    rows.map(([k, v]) =>
      `<div class="sat-info-row">
         <span class="sit-key">${k}</span>
         <span class="sit-val">${v}</span>
       </div>`
    ).join('');
}

/** Show the hover tooltip near the cursor. */
function showHoverTip(sat, screenPos) {
  const tip = document.getElementById('hover-tip');
  const pos = getSatPosition(sat.satrec, new Date());
  tip.innerHTML =
    `<span class="tip-name">${sat.name}</span>` +
    (pos ? `<span class="tip-alt"> · ${pos.alt.toFixed(0)} km</span>` : '');
  tip.style.display = 'block';
  tip.style.left    = `${screenPos.x}px`;
  tip.style.top     = `${screenPos.y}px`;
}

function hideHoverTip() {
  document.getElementById('hover-tip').style.display = 'none';
}

/* ─────────────────────────────────────────────────────────────────────────
   M9 · UI WIRING
   Location selector, group toggles, sliders, pass table renderer
   ───────────────────────────────────────────────────────────────────────── */

// ── Location selector ────────────────────────────────────────────────────

function initLocationSelector() {
  const selRegion = document.getElementById('sel-region');
  const selCity   = document.getElementById('sel-city');

  // Populate regions
  Object.keys(LOCATIONS).forEach(region => {
    const opt = document.createElement('option');
    opt.value = region;
    opt.textContent = region;
    selRegion.appendChild(opt);
  });

  // Default to UK
  selRegion.value = 'United Kingdom';
  populateCities('United Kingdom');
  selCity.value = 'Nottingham';
  applyLocation('United Kingdom', 'Nottingham');

  selRegion.addEventListener('change', () => {
    populateCities(selRegion.value);
  });

  selCity.addEventListener('change', () => {
    if (selCity.value) applyLocation(selRegion.value, selCity.value);
  });

  // Manual coordinate entry
  document.getElementById('btn-set-coords').addEventListener('click', () => {
    const lat = parseFloat(document.getElementById('inp-lat').value);
    const lon = parseFloat(document.getElementById('inp-lon').value);
    if (isNaN(lat) || isNaN(lon)) return;
    setObserver({ name: `${lat.toFixed(3)}, ${lon.toFixed(3)}`, lat, lon, alt: 0 });
  });
}

function populateCities(region) {
  const selCity = document.getElementById('sel-city');
  selCity.innerHTML = '<option value="">— select —</option>';
  (LOCATIONS[region] ?? []).forEach(loc => {
    const opt = document.createElement('option');
    opt.value       = loc.name;
    opt.textContent = loc.name;
    selCity.appendChild(opt);
  });
}

function applyLocation(region, cityName) {
  const loc = (LOCATIONS[region] ?? []).find(l => l.name === cityName);
  if (loc) setObserver(loc);
}

function setObserver(loc) {
  observer = { ...loc };

  // Update globe marker
  if (viewer) {
    addObserverMarker();
    flyToObserver(true);
  }

  // Update badge
  const badge = document.getElementById('observer-badge');
  badge.textContent =
    `${loc.name}\n${loc.lat.toFixed(4)}° N  ${loc.lon.toFixed(4)}° E`;
  badge.classList.add('visible');

  // Clear old pass results — they belong to the previous location
  passResults = [];
  renderPassTable([]);
}

// ── Satellite group toggles ──────────────────────────────────────────────

function initGroupToggles() {
  const container = document.getElementById('group-list');

  Object.entries(SAT_GROUPS).forEach(([groupId, meta]) => {
    const btn = document.createElement('button');
    btn.className     = 'group-btn';
    btn.dataset.group = groupId;
    btn.innerHTML = `
      <span class="group-dot" style="background:${meta.color};color:${meta.color}"></span>
      <span class="group-info">
        <span class="group-label">${meta.label}</span>
        <span class="group-count" id="gc-${groupId}">not loaded</span>
      </span>
      <span class="group-spinner" id="gs-${groupId}"></span>
    `;
    btn.title = meta.desc;

    btn.addEventListener('click', () => toggleGroup(groupId, btn));
    container.appendChild(btn);
  });
}

async function toggleGroup(groupId, btn) {
  if (loadedGroups[groupId]) {
    // Already loaded → remove
    unloadGroup(groupId);
    btn.classList.remove('active');
    document.getElementById(`gc-${groupId}`).textContent = 'not loaded';
    document.getElementById('n-loaded').textContent = allSats.length.toLocaleString();
    return;
  }

  // Load
  btn.classList.add('active', 'loading');
  const spinner = document.getElementById(`gs-${groupId}`);
  const counter = document.getElementById(`gc-${groupId}`);
  counter.textContent = 'loading…';

  try {
    await loadGroup(groupId);
    const count = loadedGroups[groupId]?.sats.length ?? 0;
    counter.textContent = `${count.toLocaleString()} sats`;
  } catch (err) {
    counter.textContent = 'error — retry?';
    btn.classList.remove('active');
    console.error(`Failed to load ${groupId}:`, err);
  } finally {
    btn.classList.remove('loading');
  }
}

// ── Sliders ──────────────────────────────────────────────────────────────

function initSliders() {
  const sldElev  = document.getElementById('sld-min-elev');
  const sldHours = document.getElementById('sld-pass-hours');

  sldElev.addEventListener('input', () => {
    document.getElementById('v-min-elev').textContent = `${sldElev.value}°`;
  });

  sldHours.addEventListener('input', () => {
    document.getElementById('v-pass-hours').textContent = `${sldHours.value} h`;
  });
}

// ── Pass prediction button ────────────────────────────────────────────────

function initPredictButton() {
  document.getElementById('btn-predict').addEventListener('click', async () => {
    if (!allSats.length) {
      alert('Load at least one satellite group first.');
      return;
    }
    const minElevDeg = parseInt(document.getElementById('sld-min-elev').value, 10);
    const hours      = parseInt(document.getElementById('sld-pass-hours').value, 10);
    const results    = await runPassPrediction({ minElevDeg, hours });
    renderPassTable(results);
  });
}

// ── Pass table renderer ───────────────────────────────────────────────────

function renderPassTable(rows) {
  const tbody   = document.getElementById('pass-tbody');
  const summary = document.getElementById('pass-summary');

  if (!rows.length) {
    tbody.innerHTML   = `<tr class="empty-row"><td colspan="8">No passes found for current settings</td></tr>`;
    summary.textContent = 'No passes found';
    return;
  }

  summary.textContent =
    `${rows.length.toLocaleString()} passes in the next ` +
    `${document.getElementById('sld-pass-hours').value} h — ` +
    `min elevation ${document.getElementById('sld-min-elev').value}°`;

  tbody.innerHTML = rows.map(row => {
    const { sat, aos, maxEl, maxAz, los, duration, visibility } = row;
    const elClass  = maxEl > 45 ? 'pass-hi' : maxEl > 20 ? 'pass-mid' : 'pass-lo';
    const visClass = visibility === 'night' ? 'vis-night' : visibility === 'twilight' ? 'vis-twilight' : 'vis-day';
    const visLabel = visibility === 'night' ? '🌙 Night' : visibility === 'twilight' ? '🌅 Twilight' : '☀ Day';
    const group    = SAT_GROUPS[sat.group] ?? { label: sat.group, color: '#fff' };

    return `
      <tr class="${elClass}" data-sat-name="${esc(sat.name)}">
        <td title="${esc(sat.name)}">${esc(sat.name)}</td>
        <td><span class="cat-pill" style="background:${group.color}22;color:${group.color}">${group.label}</span></td>
        <td>${fmtTime(aos)}</td>
        <td>${maxEl.toFixed(1)}°</td>
        <td>${fmtTime(los)}</td>
        <td>${fmtDuration(duration)}</td>
        <td>${maxAz.toFixed(0)}° ${azLabel(maxAz)}</td>
        <td><span class="vis-badge ${visClass}">${visLabel}</span></td>
      </tr>`;
  }).join('');

  // Click row → select satellite on globe
  tbody.querySelectorAll('tr[data-sat-name]').forEach(tr => {
    tr.addEventListener('click', () => {
      const name = tr.dataset.satName;
      const sat  = allSats.find(s => s.name === name);
      if (sat) selectSatellite(sat);
    });
  });

  // Open pass panel if collapsed
  document.getElementById('pass-panel').classList.add('open');
  document.getElementById('pass-panel').classList.remove('collapsed');
}

// ── Toggle pass panel ─────────────────────────────────────────────────────

function initPassPanelToggle() {
  const panel = document.getElementById('pass-panel');
  document.getElementById('pass-header').addEventListener('click', e => {
    // Don't toggle if clicking the button (it handles itself)
    panel.classList.toggle('collapsed');
  });

  // Adjust main height when panel collapses/opens
  const main = document.getElementById('main');
  const observer2 = new MutationObserver(() => {
    const h = panel.classList.contains('collapsed') ? 36 : 240;
    main.style.height = `calc(100vh - 46px - ${h}px)`;
  });
  observer2.observe(panel, { attributes: true, attributeFilter: ['class'] });
}

// ── Top-bar buttons ───────────────────────────────────────────────────────

function initTopbarButtons() {
  document.getElementById('btn-fly-home').addEventListener('click', () => flyToObserver(true));
  document.getElementById('btn-night').addEventListener('click', toggleNightMode);
  document.getElementById('btn-deselect').addEventListener('click', deselectSatellite);
}

// ── Helpers ───────────────────────────────────────────────────────────────

function fmtTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function fmtDuration(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${String(sec).padStart(2,'0')}s`;
}

function azLabel(az) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW','N'];
  return dirs[Math.round(az / 45) % 8];
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

/* ─────────────────────────────────────────────────────────────────────────
   M10 · MAIN INIT + LIVE UPDATE LOOP
   ───────────────────────────────────────────────────────────────────────── */

/** Tick the UTC clock display every second. */
function startClock() {
  function tick() {
    const now = new Date();
    document.getElementById('utc-clock').textContent =
      now.toUTCString().slice(17, 25) + ' UTC';
  }
  tick();
  setInterval(tick, 1000);
}

/**
 * Start the satellite position refresh loop.
 * Positions update every 5 seconds; footprint moves with selected satellite.
 */
function startPositionLoop(intervalMs = 5000) {
  if (posUpdateTimer) clearInterval(posUpdateTimer);
  posUpdateTimer = setInterval(() => {
    updateAllPositions();

    // Keep orbit track / footprint current for selected satellite
    if (selectedSat) {
      showFootprint(selectedSat);   // footprint re-draws at new sub-sat point
    }
  }, intervalMs);
}

/**
 * Bootstrap everything.
 */
async function init() {
  // 1. Start the clock immediately
  startClock();

  // 2. Build the UI controls (doesn't need globe ready)
  initLocationSelector();
  initGroupToggles();
  initSliders();
  initPredictButton();
  initTopbarButtons();
  initPassPanelToggle();

  // 3. Spin up the CesiumJS globe (async — loads CDN assets)
  try {
    await initGlobe();
  } catch (err) {
    console.error('CesiumJS init failed:', err);
    document.getElementById('cesium-container').innerHTML =
      `<div style="color:#ff4d6a;padding:32px;font-family:monospace">
         Globe failed to initialise: ${err.message}<br><br>
         Try serving via a local HTTP server (e.g. <code>python3 -m http.server</code>).
       </div>`;
    return;
  }

  // 4. Auto-load Space Stations so the globe isn't empty on first visit
  const stationsBtn = document.querySelector('[data-group="stations"]');
  if (stationsBtn) {
    await toggleGroup('stations', stationsBtn);
  }

  // 5. Start position refresh loop (5-second cadence)
  startPositionLoop(5000);

  console.info('🛰 Satellite Tracker 3D ready.  Observer:', observer.name);
}

// ── Go ───────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', init);



