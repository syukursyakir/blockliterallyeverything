import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Cloud, Eye, KeyRound, LoaderCircle, LockKeyhole, Monitor, ShieldCheck } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { api } from './lib/api'
import { cn } from './lib/utils'
import { defaultSettings, presets, type Settings, type Snapshot } from './shared'

const steps = ['Welcome', 'Connect Jev', 'Choose rules', 'Ready']
const money = (value: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)

export default function Onboarding({ snapshot, onComplete }: { snapshot: Snapshot; onComplete: () => Promise<void> }) {
  const [step, setStep] = useState(0)
  const [settings, setSettings] = useState<Settings>(() => ({ ...structuredClone(defaultSettings), backend: 'jev', cloudConsent: snapshot.settings.cloudConsent, cloudBudgetUsd: snapshot.settings.cloudBudgetUsd, detectionOnly: true, intervalSeconds: 3, sessionMinutes: 25 }))
  const [keyDraft, setKeyDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [verificationMs, setVerificationMs] = useState<number | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const hasKey = snapshot.status.cloudKeyConfigured
  const enabledRules = settings.rules.filter(rule => rule.enabled)
  const validBudget = Number.isFinite(settings.cloudBudgetUsd) && settings.cloudBudgetUsd >= 0.01 && settings.cloudBudgetUsd <= 100 && settings.cloudBudgetUsd > snapshot.status.cloudSpentUsd

  useEffect(() => { heading.current?.focus(); setError(''); setNotice(''); setKeyDraft('') }, [step])

  async function perform(action: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('')
    try { await action() }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Setup could not finish. Please try again.') }
    finally { setBusy(false) }
  }
  async function saveKey(remove = false) {
    setVerificationMs(null)
    try {
      await api.setCloudKey(remove ? '' : keyDraft.trim())
      setNotice(remove ? 'Saved key removed. An environment-provided key may still be available.' : 'API key saved securely. It is not returned to this screen.')
    } finally { setKeyDraft('') }
  }
  async function verify() {
    setVerificationMs(null)
    if (!hasKey || !settings.cloudConsent) throw new Error('Save an API key and enable screenshot permission before verifying.')
    await api.save(settings)
    const result = await api.verifyCloud()
    setVerificationMs(result.elapsedMs)
    setNotice('Connection verified using a generated neutral image. Your screen was not captured.')
  }
  function next() { setError(''); setNotice(''); setStep(value => Math.min(3, value + 1)) }

  return <div className="min-h-screen bg-background px-5 py-8 sm:px-10">
    <header className="mx-auto flex max-w-4xl items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-5" aria-hidden="true" />Block Literally Everything</div>
      <Badge variant="outline">First-time setup</Badge>
    </header>
    <main className="mx-auto flex max-w-2xl flex-col gap-7 py-12 sm:py-16">
      <ol aria-label="Setup progress" className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
        {steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className="flex flex-col gap-3">
          <span className={cn('h-1 rounded-full bg-muted', index <= step && 'bg-foreground')} />
          <span className={cn('flex items-center gap-1.5', index === step && 'text-foreground')}><span aria-hidden="true">{index < step ? <Check className="size-3" /> : `${index + 1}.`}</span>{label}</span>
        </li>)}
      </ol>

      <Card>
        <CardHeader className="gap-3">
          <span className="mb-1 flex size-11 items-center justify-center rounded-lg border bg-secondary" aria-hidden="true">{step === 0 ? <ShieldCheck className="size-5" /> : step === 1 ? <KeyRound className="size-5" /> : step === 2 ? <Eye className="size-5" /> : <Check className="size-5" />}</span>
          <CardTitle><h1 ref={heading} tabIndex={-1} className="text-2xl font-medium tracking-tight">{step === 0 ? 'A little setup. A little more focus.' : step === 1 ? 'Connect your Jev account.' : step === 2 ? 'Choose your first boundaries.' : 'You’re ready to try it.'}</h1></CardTitle>
          <CardDescription>{step === 0 ? 'Set up your connection and choose a few rules. No commands or extra tools to install.' : step === 1 ? 'Use your own TypeSafe API key. It stays hidden after saving and is stored with your operating system’s encryption.' : step === 2 ? 'Start with presets, then edit or write your own rules in the app. These rules are experimental, not guarantees.' : 'Setup will open your dashboard. Monitoring stays off until you choose to start a session.'}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {step === 0 && <>
            <Alert><Cloud /><AlertTitle>This edition uses Jev cloud analysis</AlertTitle><AlertDescription>When you start a session, screenshots of your visible screens and enabled rules are sent to TypeSafe. Manual image tests also send the chosen image. This is not local inference, and TypeSafe’s data-handling terms apply.</AlertDescription></Alert>
            <div className="flex flex-col gap-4 text-sm"><p className="flex items-start gap-3"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span>No API key is included. You need a TypeSafe account with API access, and provider charges may apply.</span></p><p className="flex items-start gap-3"><Monitor className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span>No screen capture starts during setup. The connection check uses a generated neutral image, not your screen.</span></p><p className="flex items-start gap-3"><Eye className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span>Your first session is detection-only: matches are shown in Activity without covering your screen.</span></p></div>
            <p className="text-xs text-muted-foreground">{snapshot.localAvailable === false ? 'Local AI isn’t included in this edition.' : 'Optional local processing can be configured later in Model & settings.'} This app does not intentionally save screenshots.</p>
          </>}

          {step === 1 && <FieldGroup>
            <Field><FieldLabel htmlFor="setup-api-key">TypeSafe API key</FieldLabel><Input id="setup-api-key" type="password" autoComplete="off" spellCheck={false} value={keyDraft} disabled={busy} placeholder="Paste your TypeSafe API key…" onChange={event => { setKeyDraft(event.target.value); setVerificationMs(null) }} /><FieldDescription>The app never displays a saved key. You can replace or remove it later.</FieldDescription><div className="flex flex-wrap items-center gap-2"><Button size="sm" disabled={busy || !keyDraft.trim()} onClick={() => void perform(() => saveKey())}>Save API key</Button>{hasKey && <><Badge variant="secondary"><Check aria-hidden="true" />Key available</Badge><Button variant="ghost" size="sm" disabled={busy} onClick={() => void perform(() => saveKey(true))}>Remove saved key</Button></>}</div></Field>
            <Separator />
            <Field orientation="horizontal"><div className="flex-1"><FieldLabel htmlFor="setup-cloud-consent">Allow images and rules to be sent to TypeSafe</FieldLabel><FieldDescription>I understand that Jev sessions send visible screenshots and enabled rules, and image tests send my chosen image and rules. Images leave this device; provider data-handling terms apply.</FieldDescription></div><Switch id="setup-cloud-consent" checked={settings.cloudConsent} disabled={busy} onCheckedChange={value => { setSettings(current => ({ ...current, cloudConsent: value })); setVerificationMs(null) }} /></Field>
            <Alert><Cloud /><AlertTitle>Verify with a neutral image</AlertTitle><AlertDescription>Verification sends a generated, harmless image and a fixed test question to TypeSafe. It does not capture your screen. This paid request counts toward your budget cap.</AlertDescription></Alert>
            <Field data-invalid={!validBudget}><FieldLabel htmlFor="setup-budget">Setup budget cap (USD)</FieldLabel><Input id="setup-budget" type="number" min={0.01} max={100} step={0.01} value={settings.cloudBudgetUsd} aria-invalid={!validBudget} disabled={busy} onChange={event => setSettings(current => ({ ...current, cloudBudgetUsd: Number(event.target.value) }))} /><FieldDescription>Budget already reserved: {money(snapshot.status.cloudSpentUsd)}. Reservations persist across restarts and may include failed requests; they are conservative app limits, not your actual provider bill. Raising this cap does not reset usage.</FieldDescription>{!validBudget && <p role="status" className="text-sm text-destructive">Choose a cap from $0.01 to $100 that is above the budget already reserved.</p>}</Field>
            <div className="flex flex-wrap items-center gap-3"><Button variant="outline" disabled={busy || !hasKey || !settings.cloudConsent || !validBudget || Boolean(keyDraft)} onClick={() => void perform(verify)}>{busy ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <Cloud data-icon="inline-start" />}Verify connection</Button>{verificationMs !== null && <Badge variant="secondary"><Check aria-hidden="true" />Verified · {(verificationMs / 1000).toFixed(2)}s</Badge>}</div>
            <p className="text-xs leading-relaxed text-muted-foreground">Your current conservative app cap is {money(settings.cloudBudgetUsd)}. You can change it here or later in Model & settings.</p>
          </FieldGroup>}

          {step === 2 && <>
            <FieldGroup>{presets.map(preset => <Field key={preset.id} orientation="horizontal"><div className="flex-1"><FieldLabel htmlFor={`setup-rule-${preset.id}`}>{preset.name}</FieldLabel><FieldDescription>{preset.instruction}</FieldDescription></div><Switch id={`setup-rule-${preset.id}`} checked={settings.rules.some(rule => rule.id === preset.id && rule.enabled)} onCheckedChange={enabled => setSettings(current => ({ ...current, rules: current.rules.map(rule => rule.id === preset.id ? { ...rule, enabled } : rule) }))} /></Field>)}</FieldGroup>
            <Alert><Eye /><AlertTitle>Begin with detection-only mode</AlertTitle><AlertDescription>Matches will appear in Activity without a blocking cover. Try your own images in the Test lab, then turn on blocking when you’re comfortable with the results.</AlertDescription></Alert>
            {!enabledRules.length && <p role="status" className="text-sm text-muted-foreground">Enable at least one preset to continue.</p>}
          </>}

          {step === 3 && <>
            <div className="flex flex-col gap-4 rounded-lg border p-4 text-sm"><div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">Decision backend</span><span>TypeSafe Jev · cloud</span></div><div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">First session</span><span>25 minutes · detection only</span></div><div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">Time between checks</span><span>3 seconds + analysis time</span></div><div className="flex items-start justify-between gap-4"><span className="shrink-0 text-muted-foreground">Enabled presets</span><span className="text-right">{enabledRules.map(rule => rule.name).join(', ')}</span></div><div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">Conservative budget cap</span><span>{money(settings.cloudBudgetUsd)} · cumulative</span></div></div>
            <p className="text-sm leading-relaxed text-muted-foreground">Click Finish setup to open the dashboard. Nothing starts automatically. When you choose Start focus session, visible screenshots and your rules will be sent to TypeSafe.</p>
          </>}

          {error && <Alert variant="destructive"><AlertTitle>Let’s fix that before continuing</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          {notice && <p role="status" className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{notice}</p>}
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-4 border-t pt-6">
          {step > 0 ? <Button variant="ghost" disabled={busy} onClick={() => setStep(value => value - 1)}><ArrowLeft data-icon="inline-start" />Back</Button> : <span className="text-xs text-muted-foreground">Step 1 of 4</span>}
          {step < 3 ? <Button disabled={busy || (step === 1 && (verificationMs === null || !hasKey || !settings.cloudConsent || !validBudget)) || (step === 2 && !enabledRules.length)} onClick={next}>{step === 0 ? 'Get started' : 'Continue'}<ArrowRight data-icon="inline-end" /></Button> : <Button disabled={busy || verificationMs === null || !hasKey || !settings.cloudConsent || !validBudget || !enabledRules.length} onClick={() => void perform(async () => { await api.completeOnboarding(settings); await onComplete() })}>{busy ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <Check data-icon="inline-start" />}Finish setup</Button>}
        </CardFooter>
      </Card>
      <p className="text-center text-xs leading-relaxed text-muted-foreground">You can close the app and return to setup later. Protection stays off until you start a session.</p>
    </main>
  </div>
}
