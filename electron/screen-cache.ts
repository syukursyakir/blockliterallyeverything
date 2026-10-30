const RECHECK_AFTER_MS = 30_000

export class ScreenCache {
  private checked = new Map<string, { hash: string; time: number }>()

  shouldCheck(displayId: string, hash: string, now: number): boolean {
    const previous = this.checked.get(displayId)
    if (!previous || previous.hash !== hash) return true
    const age = now - previous.time
    return !Number.isFinite(age) || age < 0 || age >= RECHECK_AFTER_MS
  }

  mark(displayId: string, hash: string, now: number): void {
    this.checked.set(displayId, { hash, time: now })
  }

  clear(): void {
    this.checked.clear()
  }
}

export function changedSubstantially(before: Uint8Array, after: Uint8Array): boolean {
  if (!before.length || before.length !== after.length || before.length % 4 !== 0) return true
  let difference = 0
  for (let i = 0; i < before.length; i += 4) {
    difference += Math.abs(before[i] - after[i])
      + Math.abs(before[i + 1] - after[i + 1])
      + Math.abs(before[i + 2] - after[i + 2])
  }
  return difference / (before.length / 4 * 3 * 255) > 0.08
}

// shortcut: detects detail collapsing to a flat patch, not general semantic changes.
// Broaden only with motion/switch-away evidence; normal cuts can also lose detail.
export function lostLocalDetail(before: Uint8Array, after: Uint8Array, width: number): boolean {
  const height = before.length / 4 / width
  if (!Number.isInteger(width) || width < 8 || width > 128 || !Number.isInteger(height) || height < 8 || height > 128 || before.length !== after.length) return true
  for (let y = 0; y <= height - 8; y += 4) for (let x = 0; x <= width - 8; x += 4) {
    const sums = [0, 0, 0, 0, 0, 0], squares = [0, 0, 0, 0, 0, 0]
    let difference = 0
    for (let dy = 0; dy < 8; dy++) for (let dx = 0; dx < 8; dx++) {
      const i = ((y + dy) * width + x + dx) * 4
      for (let c = 0; c < 3; c++) {
        const a = before[i + c], b = after[i + c]
        sums[c] += a; squares[c] += a * a
        sums[c + 3] += b; squares[c + 3] += b * b
        difference += Math.abs(a - b)
      }
    }
    const variance = sums.map((sum, c) => squares[c] / 64 - (sum / 64) ** 2)
    if (Math.max(...variance.slice(0, 3)) >= 20 ** 2 && Math.max(...variance.slice(3)) <= 2 ** 2 && difference / (64 * 3 * 255) >= 0.10) return true
  }
  return false
}

// A whole view translated over a uniform background still contains the same content.
// Require clean exposed/vacated strips, so scrolling content out of view is rejected.
export function sameTranslatedFrame(before: Uint8Array, after: Uint8Array, width: number): boolean {
  const height = before.length / 4 / width
  if (!Number.isInteger(width) || width < 8 || width > 128 || !Number.isInteger(height) || height < 8 || height > 128 || before.length !== after.length) return false
  const background = before.subarray(0, 3)
  const padding = (pixels: Uint8Array, index: number) => background.every((v, c) => Math.abs(pixels[index + c] - v) <= 8)
  for (const vertical of [false, true]) {
    const size = vertical ? height : width
    for (let shift = -Math.floor(size / 2); shift <= Math.floor(size / 2); shift++) {
      if (!shift) continue
      let difference = 0, matched = 0, valid = true
      for (let y = 0; y < height && valid; y++) for (let x = 0; x < width; x++) {
        const nx = x + (vertical ? 0 : shift), ny = y + (vertical ? shift : 0)
        const index = (y * width + x) * 4
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
          if (!padding(before, index)) { valid = false; break }
        } else {
          const next = (ny * width + nx) * 4
          for (let c = 0; c < 3; c++) difference += Math.abs(before[index + c] - after[next + c])
          matched++
        }
        const px = x - (vertical ? 0 : shift), py = y - (vertical ? shift : 0)
        if ((px < 0 || px >= width || py < 0 || py >= height) && !padding(after, index)) { valid = false; break }
      }
      if (valid && difference / (matched * 3 * 255) <= 0.02) {
        const aligned = Uint8Array.from(before)
        for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
          const nx = x + (vertical ? 0 : shift), ny = y + (vertical ? shift : 0)
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const i = (y * width + x) * 4, next = (ny * width + nx) * 4
            for (let c = 0; c < 3; c++) aligned[i + c] = after[next + c]
          }
        }
        if (!lostLocalDetail(before, aligned, width)) return true
      }
    }
  }
  return false
}

export function isBlankCapture(pixels: Uint8Array): boolean {
  if (!pixels.length || pixels.length % 4 !== 0) return true
  const count = pixels.length / 4
  for (let channel = 0; channel < 3; channel++) {
    let sum = 0
    let squares = 0
    for (let i = channel; i < pixels.length; i += 4) {
      sum += pixels[i]
      squares += pixels[i] * pixels[i]
    }
    if (squares / count - (sum / count) ** 2 >= 1) return false
  }
  return true
}
