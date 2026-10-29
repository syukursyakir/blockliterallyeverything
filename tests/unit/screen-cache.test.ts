import { describe, expect, it } from 'vitest'
import { ScreenCache, changedSubstantially, isBlankCapture } from '../../electron/screen-cache'

describe('screen check cache', () => {
  it('checks new frames and skips exact unchanged hashes only until the 30-second deadline', () => {
    const cache = new ScreenCache()
    expect(cache.shouldCheck('display-1', 'hash-a', 1000)).toBe(true)
    cache.mark('display-1', 'hash-a', 1000)
    expect(cache.shouldCheck('display-1', 'hash-a', 1001)).toBe(false)
    expect(cache.shouldCheck('display-1', 'hash-a', 30_999)).toBe(false)
    expect(cache.shouldCheck('display-1', 'hash-a', 31_000)).toBe(true)
    expect(cache.shouldCheck('display-1', 'hash-a', 40_000)).toBe(true)
    cache.mark('display-1', 'hash-a', 40_000)
    expect(cache.shouldCheck('display-1', 'hash-a', 40_001)).toBe(false)
  })

  it('checks changed frames and each display independently without implicitly marking them', () => {
    const cache = new ScreenCache()
    cache.mark('display-1', 'hash-a', 1000)
    expect(cache.shouldCheck('display-1', 'hash-b', 1001)).toBe(true)
    expect(cache.shouldCheck('display-1', 'hash-b', 1002)).toBe(true)
    expect(cache.shouldCheck('display-2', 'hash-a', 1002)).toBe(true)
    cache.mark('display-2', 'hash-b', 1002)
    expect(cache.shouldCheck('display-1', 'hash-a', 1003)).toBe(false)
    expect(cache.shouldCheck('display-2', 'hash-b', 1003)).toBe(false)
  })

  it('clears all cached decisions so identical screens are checked again', () => {
    const cache = new ScreenCache()
    cache.mark('display-1', 'hash-a', 1000)
    cache.mark('display-2', 'hash-b', 1000)
    cache.clear()
    expect(cache.shouldCheck('display-1', 'hash-a', 1001)).toBe(true)
    expect(cache.shouldCheck('display-2', 'hash-b', 1001)).toBe(true)
  })

  it('rechecks conservatively after clock rollback or invalid timestamps', () => {
    const cache = new ScreenCache()
    cache.mark('display-1', 'hash-a', 1000)
    expect(cache.shouldCheck('display-1', 'hash-a', 999)).toBe(true)
    expect(cache.shouldCheck('display-1', 'hash-a', Number.NaN)).toBe(true)
    cache.mark('display-1', 'hash-a', Number.NaN)
    expect(cache.shouldCheck('display-1', 'hash-a', 1001)).toBe(true)
  })
})

describe('screen change comparison', () => {
  it('ignores alpha changes and small RGB changes', () => {
    const before = new Uint8Array([0, 0, 0, 255, 100, 100, 100, 255])
    expect(changedSubstantially(before, new Uint8Array([0, 0, 0, 0, 100, 100, 100, 0]))).toBe(false)
    expect(changedSubstantially(before, new Uint8Array([20, 20, 20, 0, 120, 120, 120, 0]))).toBe(false)
  })

  it('detects RGB mean difference above eight percent, not individual outliers', () => {
    const before = new Uint8Array([0, 0, 0, 255, 0, 0, 0, 255])
    expect(changedSubstantially(before, new Uint8Array([21, 21, 21, 255, 21, 21, 21, 255]))).toBe(true)
    expect(changedSubstantially(before, new Uint8Array([100, 0, 0, 255, 0, 0, 0, 255]))).toBe(false)
  })

  it('requires a strictly greater difference than the threshold', () => {
    const before = new Uint8Array(20)
    const exactlyEightPercent = new Uint8Array([21, 21, 21, 0, 21, 21, 21, 0, 20, 20, 20, 0, 20, 20, 20, 0, 20, 20, 20, 0])
    expect(changedSubstantially(before, exactlyEightPercent)).toBe(false)
    exactlyEightPercent[0]++
    expect(changedSubstantially(before, exactlyEightPercent)).toBe(true)
  })

  it('treats missing, mismatched, or incomplete pixel buffers as changed', () => {
    expect(changedSubstantially(new Uint8Array(), new Uint8Array())).toBe(true)
    expect(changedSubstantially(new Uint8Array(4), new Uint8Array(8))).toBe(true)
    expect(changedSubstantially(new Uint8Array(3), new Uint8Array(3))).toBe(true)
  })
})

describe('blank or protected screen detection', () => {
  it('rejects empty or malformed pixel buffers', () => {
    expect(isBlankCapture(new Uint8Array())).toBe(true)
    expect(isBlankCapture(new Uint8Array(3))).toBe(true)
  })

  it('rejects uniform black, white, and colored screens regardless of alpha', () => {
    for (const color of [0, 255, 100]) {
      expect(isBlankCapture(new Uint8Array([color, color, color, 0, color, color, color, 255]))).toBe(true)
    }
    expect(isBlankCapture(new Uint8Array([10, 80, 120, 0, 10, 80, 120, 255]))).toBe(true)
  })

  it('matches the local worker threshold: every RGB channel must have deviation below one', () => {
    expect(isBlankCapture(new Uint8Array([0, 0, 0, 255, 1, 1, 1, 255]))).toBe(true)
    expect(isBlankCapture(new Uint8Array([0, 0, 0, 255, 2, 0, 0, 255]))).toBe(false)
    expect(isBlankCapture(new Uint8Array([0, 0, 0, 255, 0, 2, 0, 255]))).toBe(false)
    expect(isBlankCapture(new Uint8Array([0, 0, 0, 255, 0, 0, 2, 255]))).toBe(false)
  })

  it('accepts visually varied capture pixels without retaining them', () => {
    expect(isBlankCapture(new Uint8Array([0, 0, 0, 255, 255, 120, 40, 255, 50, 90, 180, 255]))).toBe(false)
  })
})
