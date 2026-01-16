export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = deg2rad(b.lat - a.lat)
  const dLng = deg2rad(b.lng - a.lng)
  const lat1 = deg2rad(a.lat)
  const lat2 = deg2rad(b.lat)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  return R * c
}

function deg2rad(d: number) {
  return (d * Math.PI) / 180
}

// Commission in ₹: between 5-10 inclusive based on distance
export function commissionFromDistanceKm(km: number) {
  const extra = Math.min(5, Math.ceil(km)) // 0..5
  return 5 + extra // 5..10
}

// Directions link (no API key required)
export function googleDirectionsURL(origin: { lat: number; lng: number }, dest: { lat: number; lng: number }) {
  const o = `${origin.lat},${origin.lng}`
  const d = `${dest.lat},${dest.lng}`
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&travelmode=driving`
}
