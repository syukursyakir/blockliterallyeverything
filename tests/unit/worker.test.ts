import { EventEmitter } from 'node:events'
import { PassThrough, Writable } from 'node:stream'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelWorker } from '../../electron/worker'

const spawning = vi.hoisted(() => ({ spawn: vi.fn() }))
vi.mock('node:child_process', () => ({ spawn: spawning.spawn }))

function child() {
  const process = new EventEmitter()
  const messages: Record<string, unknown>[] = []
  const stdout = new PassThrough()
  const stderr = new PassThrough()
  const stdin = new Writable({ write(chunk, _encoding, done) { messages.push(JSON.parse(chunk.toString())); done() } })
  return Object.assign(process, { stdout, stderr, stdin, messages, kill: vi.fn() })
}

describe('private worker process lifecycle', () => {
  beforeEach(() => { vi.useFakeTimers(); spawning.spawn.mockReset() })
  afterEach(() => vi.useRealTimers())

  it('reports the timeout reason instead of overwriting it with cancellation', async () => {
    const process = child(); spawning.spawn.mockReturnValue(process)
    const worker = new ModelWorker('/tmp/project', null, '/tmp/data', () => {})
    const assertion = expect(worker.request('infer', {}, 100)).rejects.toThrow('timed out')
    await vi.advanceTimersByTimeAsync(100)
    await assertion
    expect(process.kill).toHaveBeenCalledOnce()
  })

  it('ignores late progress from a retired process after restarting', async () => {
    const old = child(); const fresh = child(); const progress = vi.fn()
    spawning.spawn.mockReturnValueOnce(old).mockReturnValueOnce(fresh)
    const worker = new ModelWorker('/tmp/project', null, '/tmp/data', progress)
    const cancelled = expect(worker.request('load')).rejects.toThrow('cancelled')
    worker.close(); await cancelled
    const next = worker.request('status')
    old.stdout.write(JSON.stringify({ event: 'progress', message: 'obsolete' }) + '\n')
    fresh.stdout.write(JSON.stringify({ id: fresh.messages[0].id, result: { installed: true } }) + '\n')
    await expect(next).resolves.toEqual({ installed: true })
    expect(progress).not.toHaveBeenCalled()
    worker.close()
  })

  it('keeps the trusted method and request ID outside payload overrides', async () => {
    const process = child(); spawning.spawn.mockReturnValue(process)
    const worker = new ModelWorker('/tmp/project', null, '/tmp/data', () => {})
    const result = worker.request('status', { id: 'wrong', method: 'install' })
    const message = process.messages[0]
    expect(message.method).toBe('status'); expect(message.id).not.toBe('wrong')
    process.stdout.write(JSON.stringify({ id: message.id, result: { installed: false } }) + '\n')
    await expect(result).resolves.toEqual({ installed: false })
    worker.close()
  })

  it('rejects pending work on a crash and allows a new process to launch', async () => {
    const old = child(); const fresh = child()
    spawning.spawn.mockReturnValueOnce(old).mockReturnValueOnce(fresh)
    const worker = new ModelWorker('/tmp/project', null, '/tmp/data', () => {})
    const crashed = expect(worker.request('infer')).rejects.toThrow('worker stopped')
    old.emit('exit', 1); await crashed
    const next = worker.request('status')
    fresh.stdout.write(JSON.stringify({ id: fresh.messages[0].id, result: { installed: true } }) + '\n')
    await expect(next).resolves.toEqual({ installed: true })
    expect(spawning.spawn).toHaveBeenCalledTimes(2)
    worker.close()
  })

  it('handles a closed stdin pipe without an unhandled stream error', async () => {
    const process = child(); spawning.spawn.mockReturnValue(process)
    const worker = new ModelWorker('/tmp/project', null, '/tmp/data', () => {})
    const failure = expect(worker.request('infer')).rejects.toThrow('worker stopped')
    process.stdin.emit('error', Object.assign(new Error('Broken pipe'), { code: 'EPIPE' }))
    await failure
    expect(process.kill).toHaveBeenCalledOnce()
    worker.close()
  })
})
