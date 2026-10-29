export type Rule = { id: string; name: string; instruction: string; enabled: boolean }
export type Settings = { backend: 'jev' | 'local'; cloudConsent: boolean; cloudBudgetUsd: number; rules: Rule[]; threshold: number; intervalSeconds: number; sessionMinutes: number; detectionOnly: boolean }
export type Verdict = { ruleId: string; probability: number }
export type CheckResult = { verdicts: Verdict[]; elapsedMs: number }
export type Activity = { id: string; time: number; kind: 'blocked' | 'allowed' | 'error' | 'info'; message: string }
export type Status = {
  mode: 'idle' | 'starting' | 'watching' | 'checking' | 'blocked' | 'error';
  model: 'missing' | 'downloading' | 'installed' | 'loading' | 'ready' | 'error';
  modelMessage: string; lastCheck: number | null; lastLatency: number | null;
  cloudKeyConfigured: boolean; cloudSpentUsd: number; cloudEstimatedUsd: number; cloudRequests: number;
  delayedDisplays: Record<string, number>;
  checks: number; blocks: number; endsAt: number | null; error: string | null; activity: Activity[];
}
export type Snapshot = { settings: Settings; status: Status; desktop: boolean; onboardingComplete?: boolean; localAvailable?: boolean; block?: BlockInfo }
export type BlockInfo = { rule: string; probability: number; detectionOnly?: boolean }
export interface DesktopAPI {
  snapshot(): Promise<Snapshot>;
  save(settings: Settings): Promise<Settings>;
  installModel(): Promise<void>;
  setCloudKey(key: string): Promise<void>;
  verifyCloud(): Promise<{elapsedMs: number}>;
  completeOnboarding(settings: Settings): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  testImage(bytes: ArrayBuffer): Promise<CheckResult>;
  previewBlock(): Promise<void>;
  recover(): Promise<void>;
  onUpdate(listener: (snapshot: Snapshot) => void): () => void;
  onBlock(listener: (info: BlockInfo) => void): () => void;
}
declare global { interface Window { desktop?: DesktopAPI } }

export const presets: Rule[] = [
  { id: 'explicit', name: 'Explicit content', instruction: 'Block visible sexual activity and explicit nudity. Do not treat ordinary clothed people as explicit content.', enabled: true },
  { id: 'video', name: 'YouTube', instruction: 'Block visible YouTube home or search feeds, YouTube watch pages, and YouTube Shorts. Do not block other video players or pages that only mention YouTube.', enabled: false },
  { id: 'social', name: 'Social feeds', instruction: 'Block visible Instagram or TikTok feeds and their scrolling video interfaces. Do not block YouTube (including YouTube Shorts), other video players, or pages that merely mention Instagram or TikTok.', enabled: false },
]
// Upgrade only untouched historical starter text when loading saved preferences.
// Validation and user edits remain literal; custom instructions are never replaced.
export function upgradeStarterRuleWording(settings: Settings): Settings {
  const legacy: Record<string,string> = {
    video: 'Block visible YouTube browsing, video playback, Shorts, and the YouTube home feed.',
    social: 'Block visible Instagram and TikTok feeds, including short-form video scrolling.',
  }
  let changed = false
  const rules = settings.rules.map(rule => {
    if (legacy[rule.id] !== rule.instruction) return rule
    const replacement = presets.find(preset => preset.id === rule.id)
    if (!replacement) return rule
    changed = true
    return { ...rule, instruction: replacement.instruction }
  })
  return changed ? { ...settings, rules } : settings
}
export const defaultSettings: Settings = { backend: 'jev', cloudConsent: false, cloudBudgetUsd: 3, rules: presets, threshold: 0.4, intervalSeconds: 3, sessionMinutes: 25, detectionOnly: true }
export const initialStatus: Status = { cloudKeyConfigured: false, cloudSpentUsd: 0, cloudEstimatedUsd: 0, cloudRequests: 0, mode: 'idle', model: 'missing', modelMessage: 'Download the local model to get started.', lastCheck: null, lastLatency: null, delayedDisplays: {}, checks: 0, blocks: 0, endsAt: null, error: null, activity: [] }

export function validateSettings(value: unknown): Settings {
  if (!value || typeof value !== 'object') throw new Error('Settings must be an object.')
  const s = value as Record<string, unknown>
  if (!Array.isArray(s.rules) || s.rules.length > 12) throw new Error('Use up to 12 rules.')
  const ids = new Set<string>()
  const rules = s.rules.map((r: unknown) => {
    if (!r || typeof r !== 'object') throw new Error('Invalid rule.')
    const rule = r as Record<string, unknown>
    if (typeof rule.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(rule.id) || ids.has(rule.id)) throw new Error('Rule IDs must be unique.')
    ids.add(rule.id)
    if (typeof rule.name !== 'string' || !rule.name.trim() || rule.name.length > 80) throw new Error('Give each rule a name, up to 80 characters.')
    if (typeof rule.instruction !== 'string' || !rule.instruction.trim() || rule.instruction.length > 1200) throw new Error('Rules need instructions, up to 1,200 characters.')
    if (typeof rule.enabled !== 'boolean') throw new Error('Invalid rule state.')
    return { id: rule.id, name: rule.name.trim(), instruction: rule.instruction.trim(), enabled: rule.enabled }
  })
  function number(key: string, min: number, max: number) {
    const v = s[key]
    if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) throw new Error(`Invalid ${key}.`)
    return v
  }
  if (typeof s.detectionOnly !== 'boolean') throw new Error('Invalid detection mode.')
  // Migrate old local-only preferences without silently enabling cloud uploads.
  const backend = s.backend === undefined ? 'local' : s.backend
  if (backend !== 'jev' && backend !== 'local') throw new Error('Invalid AI backend.')
  if (s.cloudConsent !== undefined && typeof s.cloudConsent !== 'boolean') throw new Error('Invalid cloud consent.')
  const cloudBudgetUsd = s.cloudBudgetUsd === undefined ? 3 : number('cloudBudgetUsd', 0.01, 100)
  return { backend, cloudConsent: s.cloudConsent === true, cloudBudgetUsd, rules, threshold: number('threshold', 0.1, 0.9), intervalSeconds: number('intervalSeconds', 1, 30), sessionMinutes: number('sessionMinutes', 1, 240), detectionOnly: s.detectionOnly }
}

export function matchingRule(result: CheckResult, settings: Settings): Rule | undefined {
  if (!Array.isArray(result.verdicts)) throw new Error('The model returned an invalid decision.')
  let matched: Rule | undefined
  let highest = -1
  for (const verdict of result.verdicts) {
    if (typeof verdict.probability !== 'number' || !Number.isFinite(verdict.probability) || verdict.probability < 0 || verdict.probability > 1) throw new Error('The model returned an invalid probability.')
    const rule = settings.rules.find(r => r.id === verdict.ruleId && r.enabled)
    if (rule && verdict.probability >= settings.threshold && verdict.probability > highest) { matched = rule; highest = verdict.probability }
  }
  const expected = settings.rules.filter(r => r.enabled)
  if (result.verdicts.length !== expected.length || new Set(result.verdicts.map(v => v.ruleId)).size !== expected.length || expected.some(r => !result.verdicts.some(v => v.ruleId === r.id))) throw new Error('The model did not answer every enabled rule.')
  return matched
}
