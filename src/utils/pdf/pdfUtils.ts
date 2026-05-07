export function toSafeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)
}
