export async function fetchImageAsBase64(url: string): Promise<string> {
  if (!url) return ''
  try {
    const response = await fetch(url)
    if (!response.ok) return ''
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve('')
      reader.readAsDataURL(blob)
    })
  } catch {
    return ''
  }
}
