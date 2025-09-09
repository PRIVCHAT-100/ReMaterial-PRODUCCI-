// src/utils/geolocate.ts
export type LatLng = { latitude: number; longitude: number };

let cached: LatLng | null = null;

export async function getBrowserLocation(options: PositionOptions = { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }): Promise<LatLng | null> {
  if (cached) return cached;
  if (typeof window === "undefined" || !("geolocation" in navigator)) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        cached = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        resolve(cached);
      },
      () => resolve(null),
      options
    );
  });
}
