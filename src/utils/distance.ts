// src/utils/distance.ts
export type LatLng = { latitude: number; longitude: number };

export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = deg2rad(b.latitude - a.latitude);
  const dLon = deg2rad(b.longitude - a.longitude);
  const lat1 = deg2rad(a.latitude);
  const lat2 = deg2rad(b.latitude);
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return +(R * c).toFixed(1);
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
