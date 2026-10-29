// Optional test-only pass-through: retain two small bitmaps in RAM, emit numbers only.
export function observeCaptures(capturer: { getSources(options: any): Promise<any[]> }) {
  const original = capturer.getSources.bind(capturer)
  const rows: { capturedAt: number; previousAt?: number; displayId: string; meanRgbDifference?: number; auditError?: boolean }[] = []
  const previous = new Map<string, { pixels: Uint8Array; at: number }>()
  capturer.getSources = async options => {
    const sources = await original(options)
    if (options.thumbnailSize?.width !== 1280 || rows.length >= 12) return sources
    try {
      for (const source of sources.slice(0, 4)) {
        if (rows.length >= 12) break
        const pixels = source.thumbnail.resize({ width: 64, height: 64 }).toBitmap()
        const at = Date.now(), before = previous.get(source.display_id)
        let difference: number | undefined
        if (before && pixels.length && before.pixels.length === pixels.length && pixels.length % 4 === 0) {
          let sum = 0
          for (let i = 0; i < pixels.length; i += 4) for (let c = 0; c < 3; c++) sum += Math.abs(before.pixels[i + c] - pixels[i + c])
          difference = sum / (pixels.length / 4 * 3 * 255)
        }
        rows.push({ capturedAt: at, previousAt: before?.at, displayId: source.display_id, meanRgbDifference: difference })
        previous.set(source.display_id, { pixels: Uint8Array.from(pixels), at })
      }
    } catch { rows.push({ capturedAt: Date.now(), displayId: 'unknown', auditError: true }) }
    return sources
  }
  return rows
}
