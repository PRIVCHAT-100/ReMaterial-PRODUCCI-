export type Coords = { lat: number; lng: number };

const COORDS_KEY = "user_coords_v1";
const CONSENT_KEY = "user_geo_consent_v1";

export function saveCoords(coords: Coords) {
  localStorage.setItem(COORDS_KEY, JSON.stringify(coords));
  localStorage.setItem(CONSENT_KEY, "granted");
}

export function saveDenied() {
  localStorage.setItem(CONSENT_KEY, "denied");
}

export function getCoords(): Coords | null {
  try {
    const raw = localStorage.getItem(COORDS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function getConsent(): "granted" | "denied" | null {
  const v = localStorage.getItem(CONSENT_KEY);
  return (v === "granted" || v === "denied") ? v : null;
}

export function requestBrowserLocation(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation no soportada por el navegador"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}
