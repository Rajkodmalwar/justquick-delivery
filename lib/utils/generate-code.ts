// Generate a unique 6-digit numeric code
export function generateLoginCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}
