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
