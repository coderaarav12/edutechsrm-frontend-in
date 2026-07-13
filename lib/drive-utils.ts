export function getGoogleDriveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /\/document\/d\/([a-zA-Z0-9_-]+)/,
    /\/presentation\/d\/([a-zA-Z0-9_-]+)/,
    /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
    /\/drive\/folders\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export function isGoogleDriveFolder(url: string): boolean {
  return url.includes("/drive/folders/")
}

export function getGoogleDocType(url: string): "document" | "presentation" | "spreadsheet" | null {
  if (/\/document\/d\//.test(url)) return "document"
  if (/\/presentation\/d\//.test(url)) return "presentation"
  if (/\/spreadsheets\/d\//.test(url)) return "spreadsheet"
  return null
}

export function getDriveEmbedUrl(url: string): string | null {
  if (isGoogleDriveFolder(url)) return null
  const fileId = getGoogleDriveFileId(url)
  if (!fileId) return null
  const directUrl = `https://drive.google.com/uc?id=${fileId}&export=view`
  return `https://docs.google.com/gview?url=${encodeURIComponent(directUrl)}&embedded=true`
}
