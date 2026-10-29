import { useEffect, useRef, useState } from 'react'
import { ArrowDownToLine, ArrowLeft, ArrowRight, Check, ChevronRight, CircleHelp, Clock3, Cloud, Cpu, Eye, FlaskConical, LayoutDashboard, ListFilter, LoaderCircle, LockKeyhole, Monitor, MoreHorizontal, Pause, Play, Plus, ScanLine, Settings2, Shield, ShieldCheck, SlidersHorizontal, Sparkles, Square, Trash2, Upload, WifiOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { api } from './lib/api'
import { cn } from './lib/utils'
import { defaultSettings, initialStatus, matchingRule, presets, type Snapshot, type Rule, type CheckResult, type BlockInfo } from './shared'
import Onboarding from './Onboarding'

type Page = 'Overview' | 'Rules' | 'Test lab' | 'Activity' | 'Model & settings'
const pages = [{ name: 'Overview', icon: LayoutDashboard }, { name: 'Rules', icon: ListFilter }, { name: 'Test lab', icon: FlaskConical }, { name: 'Activity', icon: Clock3 }, { name: 'Model & settings', icon: Settings2 }] as const
const time = (value: number) => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(value)

function Mark({ small = false }: { small?: boolean }) { return <span className={cn('brand-mark', small && 'brand-mark-small')} aria-hidden="true"><Square /><span /></span> }

function BlockingScreen() {
  const [info, setInfo] = useState<BlockInfo>({ rule: 'Blocking screen preview', probability: 1 })
  const [error, setError] = useState('')
  useEffect(() => { const off = api.onBlock(setInfo); void api.snapshot().then(s => { if (s.block) setInfo(s.block) }).catch(e => setError(e.message)); return off }, [])
  return <div className="blocking-screen">
    <header><div className="flex items-center gap-3"><Mark small /><span>Block Literally Everything</span></div><Badge variant="outline">On your terms</Badge></header>
    <main>
      <span className="block-symbol"><Shield aria-hidden="true" /></span>
      <p className="eyebrow">A little space to refocus</p>
      <h1>This content is blocked.</h1>
      <p className="block-quote">“You don’t have to see everything. Just what matters.”</p>
      <Badge variant="secondary"><LockKeyhole aria-hidden="true" />{info.rule}</Badge>
      <div className="mt-10"><Button size="lg" onClick={() => void api.recover().catch(e => setError(e.message))}><ArrowLeft data-icon="inline-start" />Pause & return to app</Button></div>
      <p className="mt-4 text-sm text-muted-foreground">This pauses protection so you can safely switch away.</p>
      {error && <p role="alert">{error}</p>}
    </main>
    <footer><span>A clearer screen. A clearer head.</span><span>Emergency pause <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F12</kbd></span></footer>
  </div>
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  const [bootstrap, setBootstrap] = useState<Snapshot | null>(null)
  const [bootstrapError, setBootstrapError] = useState('')
  useEffect(() => { const update = () => setHash(window.location.hash); window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update) }, [])
  useEffect(() => {
    let mounted = true
    void api.snapshot().then(value => { if (mounted) setBootstrap(value) }).catch(reason => { if (mounted) setBootstrapError(reason instanceof Error ? reason.message : 'Could not open the app. Please restart it.') })
    const off = api.onUpdate(value => setBootstrap(value))
    return () => { mounted = false; off() }
  }, [])
  if (hash !== '#block' && window.desktop && !bootstrap) return <main className="flex min-h-screen items-center justify-center bg-background p-8">{bootstrapError ? <Alert variant="destructive"><AlertTitle>The app could not open</AlertTitle><AlertDescription>{bootstrapError}</AlertDescription></Alert> : <p role="status" className="flex items-center gap-3 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Opening your workspace…</p>}</main>
  if (hash !== '#block' && bootstrap?.desktop && bootstrap.onboardingComplete === false) return <Onboarding snapshot={bootstrap} onComplete={async () => setBootstrap(await api.snapshot())} />
  return hash === '#block' ? <BlockingScreen /> : <Dashboard />
}

function Dashboard() {
  const [snapshot, setSnapshot] = useState<Snapshot>({ settings: structuredClone(defaultSettings), status: structuredClone(initialStatus), desktop: Boolean(window.desktop) })
  const [snapshotReady, setSnapshotReady] = useState(!window.desktop)
  const [draft, setDraft] = useState(structuredClone(defaultSettings))
  const [page, setPage] = useState<Page>('Overview')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editing, setEditing] = useState<Rule | null>(null)
  const [ruleError, setRuleError] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imageURL, setImageURL] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [now, setNow] = useState(Date.now())
  const [cloudKeyDraft, setCloudKeyDraft] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const { status, desktop } = snapshot
  const active = ['starting', 'watching', 'checking', 'blocked'].includes(status.mode)
  const dirty = JSON.stringify(draft) !== JSON.stringify(snapshot.settings)
  const enabled = draft.rules.filter(r => r.enabled)
  const installed = snapshot.settings.backend === 'local' && ['installed', 'ready'].includes(status.model)
  const isCloud = draft.backend === 'jev'
  const engineReady = isCloud ? status.cloudKeyConfigured && draft.cloudConsent && draft.cloudBudgetUsd > status.cloudSpentUsd : installed
  useEffect(() => {
    let mounted = true
    void api.snapshot().then(s => { if (mounted) { setSnapshot(s); setDraft(s.settings); setSnapshotReady(true) } }).catch(e => { setError(e.message); setSnapshotReady(true) })
    const off = api.onUpdate(s => setSnapshot(s))
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => { mounted = false; off(); clearInterval(interval) }
  }, [])
  useEffect(() => { if (!image) { setImageURL(''); return }; const url = URL.createObjectURL(image); setImageURL(url); return () => URL.revokeObjectURL(url) }, [image])
  useEffect(() => { setResult(null) }, [draft])
  useEffect(() => { setCloudKeyDraft('') }, [page, draft.backend])
  async function perform(action: () => Promise<unknown>) {
    setBusy(true); setError(''); setNotice('')
    try { await action() } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong. Try again.') } finally { setBusy(false) }
  }
  async function save() {
    const value = await api.save(draft)
    setDraft(value); setSnapshot(s => ({ ...s, settings: value })); setNotice('Changes saved on this device.')
  }
  async function saveCloudKey(remove = false) {
    try {
      await api.setCloudKey(remove ? '' : cloudKeyDraft.trim())
      setSnapshot(await api.snapshot())
      setNotice(remove ? 'Saved key removed. An environment-provided key may still be available.' : 'API key saved. The key is not returned to this interface.')
    } finally { setCloudKeyDraft('') }
  }
  function toggle(id: string, checked: boolean) { setDraft(d => ({ ...d, rules: d.rules.map(r => r.id === id ? { ...r, enabled: checked } : r) })) }
  function editRule(rule?: Rule) { setRuleError(''); setEditing(rule ? { ...rule } : { id: crypto.randomUUID(), name: '', instruction: '', enabled: true }) }
  function commitRule() {
    if (!editing?.name.trim() || !editing.instruction.trim()) { setRuleError('Add a name and a plain-English instruction.'); return }
    if (draft.rules.length >= 12 && !draft.rules.some(r => r.id === editing.id)) { setRuleError('Use up to 12 rules.'); return }
    const value = { ...editing, name: editing.name.trim(), instruction: editing.instruction.trim() }
    setDraft(d => ({ ...d, rules: d.rules.some(r => r.id === value.id) ? d.rules.map(r => r.id === value.id ? value : r) : [...d.rules, value] })); setEditing(null)
  }
  const remaining = status.endsAt ? Math.max(0, Math.ceil((status.endsAt - now) / 1000)) : draft.sessionMinutes * 60
  const clock = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`
  const stateLabel = status.mode === 'idle' ? 'Ready when you are' : ({ starting: isCloud ? 'Preparing Jev' : 'Loading model', watching: isCloud ? 'Watching with Jev' : 'Watching locally', checking: 'Checking your screen', blocked: 'Content blocked', error: 'Protection paused' }[status.mode])

  function ruleList(compact = false) { return <div className="rule-list">{draft.rules.length ? draft.rules.map((rule, index) => <div className="rule-row" key={rule.id}>
    <span className={cn('rule-icon', !rule.enabled && 'muted-icon')}>{rule.id === 'explicit' ? <Shield aria-hidden="true" /> : rule.id === 'video' ? <Play aria-hidden="true" /> : rule.id === 'social' ? <ScanLine aria-hidden="true" /> : <SlidersHorizontal aria-hidden="true" />}</span>
    <div className="min-w-0 flex-1"><button className="rule-name" onClick={() => editRule(rule)} disabled={active || busy}>{rule.name}</button><p className="truncate text-xs text-muted-foreground">{compact ? index < 3 ? 'Starter preset · editable' : 'Custom visual rule' : rule.instruction}</p></div>
    {!compact && <Badge variant="outline" className="hidden sm:inline-flex">Unvalidated</Badge>}
    <Switch checked={rule.enabled} onCheckedChange={checked => toggle(rule.id, checked)} disabled={active || busy} aria-label={`Enable ${rule.name}`} />
    {!compact && <Button variant="ghost" size="icon-sm" aria-label={`Edit ${rule.name}`} disabled={active || busy} onClick={() => editRule(rule)}><MoreHorizontal /></Button>}
  </div>) : <div className="empty-state"><ListFilter aria-hidden="true" /><h3>No rules yet</h3><p>Add a rule in your own words.</p><Button variant="outline" onClick={() => editRule()}>Create a rule</Button></div>}</div> }

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar">
      <div className="brand"><Mark /><div><strong>Literally Everything<span className="brand-period">.</span></strong><p>A little less distraction.</p></div></div>
      <div className="workspace-label"><span className="workspace-avatar">Y</span><div><strong>Your workspace</strong><span>Personal · on this device</span></div><ChevronRight aria-hidden="true" /></div>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="Main navigation">{pages.map(({ name, icon: Icon }) => <Button key={name} variant="ghost" className={cn('nav-item', page === name && 'nav-active')} aria-current={page === name ? 'page' : undefined} onClick={() => setPage(name)}><Icon data-icon="inline-start" />{name}{name === 'Rules' && <span className="nav-count">{draft.rules.length}</span>}</Button>)}</nav>
      <div className="sidebar-bottom"><div className="privacy-mini"><div className="flex items-center gap-2"><LockKeyhole aria-hidden="true" /><strong>{isCloud ? 'Jev cloud selected.' : 'Your screen stays local.'}</strong></div><p>{isCloud ? 'Screenshots go to TypeSafe only with your consent.' : 'Local AI. No cloud decisions.'}<br />No intentional screenshot storage by this app.</p></div><Separator /><div className="sidebar-footer"><span className="version-dot" />v0.1.0 <span>Windows alpha</span></div></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">Workspace</span><ChevronRight className="size-3 text-muted-foreground" aria-hidden="true" /><span>{page}</span></div><div className="flex items-center gap-3"><span className="local-label"><span className="status-dot" />{isCloud ? 'Jev · cloud' : 'Local AI'}</span><Separator orientation="vertical" className="h-4" /><Button size="icon-sm" variant="ghost" aria-label="About protection settings" onClick={() => setPage('Model & settings')}><CircleHelp /></Button><span className="user-avatar">Y</span></div></header>
      <main id="main-content" className="page-content">
        {!desktop && <Alert className="mb-6"><Monitor /><AlertTitle>Interface preview</AlertTitle><AlertDescription>Open the desktop app to configure a decision backend, test images, and protect your screen. This browser does not run detection or save API keys.</AlertDescription></Alert>}
        {isCloud && <Alert className="mb-6"><Cloud /><AlertTitle>Jev uses cloud image analysis</AlertTitle><AlertDescription>After you give permission, screen checks send visible screenshots and your enabled rules to TypeSafe. Manual image tests send the selected image too. This is not local inference; TypeSafe’s own data-handling terms apply.</AlertDescription></Alert>}
        {(error || status.error) && <Alert variant="destructive" className="mb-6"><CircleHelp /><AlertTitle>Something needs attention</AlertTitle><AlertDescription>{error || status.error}</AlertDescription></Alert>}
        {notice && <p role="status" className="notice"><Check className="size-4" aria-hidden="true" />{notice}</p>}
        {dirty && <div className="save-bar" role="status"><span>You have unsaved changes.</span><div className="flex gap-2"><Button variant="ghost" size="sm" disabled={busy} onClick={() => setDraft(snapshot.settings)}>Discard</Button><Button size="sm" disabled={busy || active} onClick={() => void perform(save)}>Save changes</Button></div></div>}

        {page === 'Overview' && <>
          <div className="page-heading"><div><div className="eyebrow">YOUR ATTENTION, RECLAIMED</div><h1>Make room for what matters.</h1><p>Decide what stays out. Get back to what you came to do.</p></div><Badge variant="outline"><Sparkles aria-hidden="true" />Your space, your rules</Badge></div>
          <div className="overview-grid">
            <Card className="focus-card"><CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><span className="tiny-icon"><ShieldCheck /></span>Focus session</CardTitle><Badge variant="secondary"><span className={cn('status-dot', active && 'status-dot-active')} />{active ? 'Active' : 'Not running'}</Badge></div><CardDescription>A quieter screen starts with a little intention.</CardDescription></CardHeader><CardContent>
              <div className="timer-display"><span>{clock}</span><p>{active ? stateLabel : 'minutes of uninterrupted possibility'}</p></div>
              <div className="session-details"><span><ListFilter aria-hidden="true" />{enabled.length} {enabled.length === 1 ? 'rule' : 'rules'} enabled</span><span><Eye aria-hidden="true" />{draft.detectionOnly ? 'Detection only' : 'Blocking enabled'}</span></div>
              <Button className="start-button" size="lg" disabled={!active && (busy || !desktop || !engineReady || !enabled.length)} onClick={() => { if (active) { void api.stop().catch(e => setError(e.message)); return }; void perform(async () => { if (dirty) await save(); await api.start() }) }}>{busy || status.mode === 'starting' ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : active ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}{active ? 'Pause session' : 'Start focus session'}</Button>
              <p className="session-footnote">{engineReady ? 'You can pause anytime. Build the habit first.' : isCloud ? 'Set up a key, screenshot consent, and budget in Model & settings.' : 'Set up your local model to start a session.'}</p>
            </CardContent></Card>
            <div className="overview-side"><Card><CardHeader><CardTitle className="text-sm">Protection at a glance</CardTitle></CardHeader><CardContent><div className="metric-grid"><div><span className="metric-number">{status.checks}</span><span>Screens checked</span></div><div><span className="metric-number">{status.blocks}</span><span>Rule matches</span></div></div><Separator className="my-5" /><div className="status-line"><span>Current status</span><span className="flex items-center gap-2"><span className="status-dot" />{stateLabel}</span></div><div className="status-line"><span>Last decision</span><span>{status.lastLatency === null ? 'Not checked yet' : `${(status.lastLatency / 1000).toFixed(1)}s`}</span></div></CardContent></Card>
              <Card className="local-card"><CardContent><span className="tiny-icon">{isCloud ? <Cloud /> : <Cpu />}</span><h3>{isCloud ? 'Cloud decisions, with your consent.' : 'A small brain. On your device.'}</h3><p>{isCloud ? 'Jev analyzes screenshots through TypeSafe. Cloud mode needs your permission and a paid API key; it is not local inference.' : 'Image decisions happen locally with OmniJev. Screenshots are not sent to a cloud model.'}</p><Button variant="link" className="p-0" onClick={() => setPage('Model & settings')}>{isCloud ? 'Configure Jev' : installed ? 'Manage local model' : 'Set up local model'}<ArrowRight data-icon="inline-end" /></Button></CardContent></Card>
            </div>
          </div>
          <div className="section-heading"><div><h2>Your blocking rules <span>{draft.rules.length}</span></h2><p>A few good boundaries go a long way.</p></div><Button variant="outline" size="sm" onClick={() => setPage('Rules')}>Manage rules<ArrowRight data-icon="inline-end" /></Button></div>
          <Card>{ruleList(true)}</Card>
          <div className="bottom-note"><WifiOff aria-hidden="true" /><span>{isCloud ? 'No extensions. Jev cloud requires consent and internet access.' : 'No extensions. No cloud decisions. A little more peace of mind.'}</span><span>Visible content only · reactive protection</span></div>
        </>}

        {page === 'Rules' && <>
          <div className="page-heading"><div><div className="eyebrow">BOUNDARIES THAT FIT YOU</div><h1>Your screen. Your rules.</h1><p>Tell the AI what you don’t want to see. Make it your own.</p></div><Button disabled={active || busy || draft.rules.length >= 12} onClick={() => editRule()}><Plus data-icon="inline-start" />Add rule</Button></div>
          <Alert className="mb-6"><FlaskConical /><AlertTitle>Try a rule before you rely on it</AlertTitle><AlertDescription>Custom rules and presets are unvalidated. Use the Test lab to inspect decisions. The AI sees visible content, not hidden tabs or your intent.</AlertDescription></Alert>
          <Card>{ruleList()}</Card>
          <div className="section-heading"><div><h2>Start with a preset</h2><p>Edit the words, change the boundary.</p></div></div><div className="preset-grid">{presets.map(p => <Card key={p.id}><CardHeader><CardTitle className="text-sm">{p.name}</CardTitle><CardDescription>{p.instruction}</CardDescription></CardHeader><CardContent><Button variant="outline" size="sm" disabled={active || busy || draft.rules.some(r => r.id === p.id)} onClick={() => setDraft(d => ({ ...d, rules: [...d.rules, { ...p, enabled: true }] }))}>{draft.rules.some(r => r.id === p.id) ? 'Already added' : 'Add preset'}</Button></CardContent></Card>)}</div>
        </>}

        {page === 'Test lab' && <>
          <div className="page-heading"><div><div className="eyebrow">LESS GUESSWORK, MORE CLARITY</div><h1>Put your rules to the test.</h1><p>Choose an image. See how your selected backend responds. Adjust from there.</p></div><Badge variant="outline"><FlaskConical aria-hidden="true" />Experimental</Badge></div>
          <div className="test-grid"><Card><CardHeader><CardTitle>Try an image</CardTitle><CardDescription>{isCloud ? 'PNG, JPEG, or WebP · up to 15 MB. Analysis sends this image and enabled rules to TypeSafe.' : 'PNG, JPEG, or WebP · up to 15 MB. Processed locally; not added to a history.'}</CardDescription></CardHeader><CardContent>
            <input ref={fileInput} id="test-image" disabled={busy || active} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={event => { const f = event.target.files?.[0]; if (f && f.size > 15 * 1024 * 1024) { setError('Choose an image smaller than 15 MB.'); return }; setImage(f ?? null); setResult(null) }} />
            <Button variant="outline" className="upload-zone" aria-label="Choose test image" disabled={busy || active} onClick={() => fileInput.current?.click()}>{imageURL ? <img src={imageURL} alt="Your selected test image" width="480" height="280" /> : <><Upload /><strong>Bring your own test image</strong><span>Choose a screenshot or picture</span></>}</Button>
            {image && <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span className="truncate">{image.name}</span><Button size="icon-sm" variant="ghost" aria-label="Remove test image" disabled={busy || active} onClick={() => { setImage(null); setResult(null); if (fileInput.current) fileInput.current.value = '' }}><X /></Button></div>}
            <Button className="mt-5 w-full" disabled={!desktop || !image || busy || active || !enabled.length || !engineReady} onClick={() => void perform(async () => { if (dirty) await save(); setResult(await api.testImage(await image!.arrayBuffer())) })}>{busy ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <ScanLine data-icon="inline-start" />}Analyze against {enabled.length} enabled {enabled.length === 1 ? 'rule' : 'rules'}</Button>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Decision preview</CardTitle><CardDescription>Model scores are estimates, not guarantees.</CardDescription></CardHeader><CardContent>{result ? <><div className="result-banner"><ShieldCheck aria-hidden="true" /><strong>{matchingRule(result, draft) ? 'Would block this image' : 'No rule crossed the threshold'}</strong></div><div className="flex flex-col gap-5 mt-6">{result.verdicts.map(v => <div key={v.ruleId}><div className="mb-2 flex justify-between gap-2 text-sm"><span>{draft.rules.find(r => r.id === v.ruleId)?.name}</span><span className="font-mono">{Math.round(v.probability * 100)}%</span></div><div className="score-track"><div style={{ width: `${v.probability * 100}%` }} /></div></div>)}</div><p className="mt-5 text-xs text-muted-foreground">{(result.elapsedMs / 1000).toFixed(2)}s inference · threshold {Math.round(draft.threshold * 100)}% · image not saved by the app</p></> : <div className="empty-state"><ScanLine aria-hidden="true" /><h3>A little evidence helps.</h3><p>Your enabled rules and model scores will appear here after a test.</p></div>}</CardContent></Card></div>
          <Card className="mt-6"><CardContent className="flex items-center justify-between gap-4 py-5"><div><h3 className="font-medium">See the blocking screen</h3><p className="text-sm text-muted-foreground">Preview the interruption without running the AI.</p></div><Button variant="outline" disabled={active || busy} onClick={() => void perform(() => api.previewBlock())}><Eye data-icon="inline-start" />Preview cover</Button></CardContent></Card>
        </>}

        {page === 'Activity' && <>
          <div className="page-heading"><div><div className="eyebrow">A LITTLE TRANSPARENCY</div><h1>What’s been happening.</h1><p>Session events only. No screenshots, page URLs, or browsing history.</p></div><Badge variant="outline">In memory · latest 80 events</Badge></div>
          <Card>{status.activity.length ? <div className="activity-list">{status.activity.map(event => <div className="activity-row" key={event.id}><span className={cn('activity-dot', event.kind === 'error' && 'activity-error', event.kind === 'blocked' && 'activity-blocked')} /><div><p>{event.message}</p><span>{time(event.time)}</span></div><Badge variant="outline">{event.kind === 'allowed' ? 'checked' : event.kind}</Badge></div>)}</div> : <div className="empty-state"><Clock3 aria-hidden="true" /><h3>A fresh start.</h3><p>Your session events will appear here. Nothing is recorded before you start.</p></div>}</Card>
        </>}

        {page === 'Model & settings' && <>
          <div className="page-heading"><div><div className="eyebrow">CHOOSE HOW DECISIONS HAPPEN</div><h1>Your backend. Your choice.</h1><p>Use Jev in the cloud, or download a local model for offline decisions.</p></div><Badge variant="outline">Experimental image decisions</Badge></div>
          <Card className="mb-6"><CardHeader><CardTitle>Decision backend</CardTitle><CardDescription>There is no automatic fallback between cloud and local processing.</CardDescription></CardHeader><CardContent><Tabs value={draft.backend} onValueChange={value => { if (value === 'jev' || (value === 'local' && snapshot.localAvailable !== false)) setDraft(d => ({ ...d, backend: value })) }}><TabsList aria-label="Decision backend"><TabsTrigger value="jev" disabled={active || busy}><Cloud aria-hidden="true" />Jev · cloud</TabsTrigger>{snapshot.localAvailable !== false && <TabsTrigger value="local" disabled={active || busy}><Cpu aria-hidden="true" />OmniJev · local</TabsTrigger>}</TabsList></Tabs><p className="mt-3 text-xs text-muted-foreground">{snapshot.localAvailable === false ? 'Local AI isn’t included in this edition. ' : ''}Save changes before starting. Selecting Jev does not grant screenshot permission.</p></CardContent></Card>
          {isCloud ? <Card className="mb-6"><CardHeader><div className="flex items-center justify-between gap-4"><CardTitle className="flex items-center gap-3"><Cloud className="size-5" />TypeSafe Jev <Badge variant="secondary">Cloud</Badge></CardTitle><Badge variant="outline">{status.cloudKeyConfigured ? 'Key available' : 'Key needed'}</Badge></div><CardDescription>Experimental image API. No local model download is required.</CardDescription></CardHeader><CardContent><FieldGroup>
            <p className="text-sm text-muted-foreground">Estimated completed usage: ${status.cloudEstimatedUsd.toFixed(4)}. Failed or unreported requests may add charges; check TypeSafe billing.</p><Field><FieldLabel htmlFor="jev-api-key">TypeSafe API key</FieldLabel><Input id="jev-api-key" type="password" autoComplete="off" spellCheck={false} value={cloudKeyDraft} disabled={!desktop || active || busy} placeholder="Paste your TypeSafe API key…" onChange={event => setCloudKeyDraft(event.target.value)} /><FieldDescription>The desktop app saves the key using OS encryption. It is never returned to this interface. The input clears after saving or leaving this screen.</FieldDescription><div className="flex flex-wrap gap-2"><Button size="sm" disabled={!desktop || active || busy || !cloudKeyDraft.trim()} onClick={() => void perform(() => saveCloudKey())}>Save API key</Button><Button size="sm" variant="outline" disabled={!desktop || active || busy || !status.cloudKeyConfigured} onClick={() => void perform(() => saveCloudKey(true))}>Remove saved key</Button></div></Field>
            <Separator />
            <Field orientation="horizontal"><div className="flex-1"><FieldLabel htmlFor="cloud-consent">Allow screenshots to be sent to TypeSafe</FieldLabel><FieldDescription>I understand that starting a Jev session sends visible screenshots and rules to TypeSafe, and using Analyze sends my chosen image and rules. Images leave my device. Provider data-handling terms apply.</FieldDescription></div><Switch id="cloud-consent" checked={draft.cloudConsent} disabled={active || busy} onCheckedChange={value => setDraft(d => ({ ...d, cloudConsent: value }))} /></Field>
            <Field><FieldLabel htmlFor="cloud-budget">Cloud budget cap (USD)</FieldLabel><Input id="cloud-budget" type="number" min={0.01} max={100} step={0.01} value={draft.cloudBudgetUsd} disabled={active || busy} onChange={event => setDraft(d => ({ ...d, cloudBudgetUsd: Number(event.target.value) }))} /><FieldDescription>This caps the app’s cumulative conservative reservations across restarts, not TypeSafe’s actual bill. Failed or uncertain requests can retain a reservation. Raising the cap does not reset usage.</FieldDescription></Field>
            <div className="grid grid-cols-2 gap-6"><div><p className="text-xs text-muted-foreground">Budget reserved</p><p className="mt-1 font-mono text-lg">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 4 }).format(status.cloudSpentUsd)}</p></div><div><p className="text-xs text-muted-foreground">Cloud requests</p><p className="mt-1 font-mono text-lg">{new Intl.NumberFormat().format(status.cloudRequests)}</p></div></div>
            {draft.cloudBudgetUsd <= status.cloudSpentUsd && <Alert variant="destructive"><AlertTitle>Budget cap reached</AlertTitle><AlertDescription>Cloud checks are unavailable until you explicitly raise the cap or choose local processing.</AlertDescription></Alert>}
          </FieldGroup></CardContent></Card> : <Card className="mb-6"><CardHeader><div className="flex items-center justify-between gap-4"><CardTitle className="flex items-center gap-3"><Cpu className="size-5" />OmniJev <Badge variant="secondary">0.8B</Badge></CardTitle><Badge variant="outline">{status.model}</Badge></div><CardDescription>An image-first decision model. Screenshots stay on this device.</CardDescription></CardHeader><CardContent><p role="status" className="mb-4 text-sm text-muted-foreground">{status.modelMessage}</p><Button variant={installed ? 'outline' : 'default'} disabled={!desktop || busy || active || status.model === 'downloading'} onClick={() => void perform(async () => { if (dirty) await save(); await api.installModel() })}>{busy || status.model === 'downloading' ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <ArrowDownToLine data-icon="inline-start" />}{installed ? 'Verify / reinstall model' : 'Download local model'}</Button><p className="mt-4 text-xs text-muted-foreground">Downloads the checkpoint and base model from Hugging Face. Requires internet for setup and several GB of free disk space. Exact revisions and checksums are saved locally. Restart the app before reinstalling a loaded model. CPU performance is unverified.</p></CardContent></Card>}
          <Card><CardHeader><CardTitle>Protection preferences</CardTitle><CardDescription>Changes apply to your next session. Pause before editing.</CardDescription></CardHeader><CardContent><FieldGroup>
            <Field orientation="horizontal"><div className="flex-1"><FieldLabel htmlFor="detection-only">Detection-only mode</FieldLabel><FieldDescription>Log matches without covering your screen. Recommended for first tests.</FieldDescription></div><Switch id="detection-only" checked={draft.detectionOnly} disabled={active || busy} onCheckedChange={value => setDraft(d => ({ ...d, detectionOnly: value }))} /></Field>
            <Separator />
            <Field><div className="flex justify-between"><FieldLabel htmlFor="sensitivity">Detection sensitivity</FieldLabel><span className="text-xs text-muted-foreground">Block at {Math.round(draft.threshold * 100)}% or higher</span></div><Slider id="sensitivity" aria-label="Detection threshold" min={10} max={90} step={5} value={[Math.round(draft.threshold * 100)]} onValueChange={values => setDraft(d => ({ ...d, threshold: values[0] / 100 }))} disabled={active || busy} /><div className="flex justify-between text-xs text-muted-foreground"><span>Catch more · more false blocks</span><span>Block fewer · more misses</span></div><FieldDescription>The starting threshold favors catching content. It is experimental and has not been calibrated on your rules.</FieldDescription></Field>
            <div className="grid grid-cols-2 gap-6"><Field><FieldLabel htmlFor="interval">Time between checks</FieldLabel><div className="flex items-center gap-3"><Input id="interval" type="number" min={1} max={30} value={draft.intervalSeconds} disabled={active || busy} onChange={e => setDraft(d => ({ ...d, intervalSeconds: Number(e.target.value) }))} /><span className="text-sm text-muted-foreground">seconds</span></div><FieldDescription>{isCloud ? 'Network and inference time are additional. Faster checks make more paid requests.' : 'Inference time is additional. Faster checks use more CPU.'}</FieldDescription></Field><Field><FieldLabel htmlFor="duration">Session length</FieldLabel><div className="flex items-center gap-3"><Input id="duration" type="number" min={1} max={240} value={draft.sessionMinutes} disabled={active || busy} onChange={e => setDraft(d => ({ ...d, sessionMinutes: Number(e.target.value) }))} /><span className="text-sm text-muted-foreground">minutes</span></div><FieldDescription>Protection pauses when the timer ends.</FieldDescription></Field></div>
          </FieldGroup></CardContent></Card>
          <div className="settings-notes"><p><LockKeyhole aria-hidden="true" />Screen capture starts only when you start a session.</p><p><Monitor aria-hidden="true" />Visible screens only. Protected or blank captures pause protection.</p><p><Pause aria-hidden="true" />Emergency pause: Ctrl+Shift+F12, or Pause in the system tray.</p></div>
        </>}
        <footer className="page-footer"><span>Built for a little more intention.</span><span>Block Literally Everything <span className="text-foreground">↗</span></span></footer>
      </main>
    </div>

    <Dialog open={Boolean(editing)} onOpenChange={open => { if (!open) setEditing(null) }}><DialogContent><DialogHeader><DialogTitle>{draft.rules.some(r => r.id === editing?.id) ? 'Edit your rule' : 'Make a little boundary'}</DialogTitle><DialogDescription>Describe visible content you want blocked. Keep it specific, then try it in the Test lab.</DialogDescription></DialogHeader>{editing && <FieldGroup><Field data-invalid={Boolean(ruleError)}><FieldLabel htmlFor="rule-name">Rule name</FieldLabel><Input id="rule-name" value={editing.name} maxLength={80} aria-invalid={Boolean(ruleError)} placeholder="e.g. Social media feeds…" onChange={e => setEditing({ ...editing, name: e.target.value })} /></Field><Field data-invalid={Boolean(ruleError)}><FieldLabel htmlFor="rule-instruction">What should stay out?</FieldLabel><Textarea id="rule-instruction" value={editing.instruction} maxLength={1200} rows={5} aria-invalid={Boolean(ruleError)} placeholder="Block visible Instagram and TikTok feeds…" onChange={e => setEditing({ ...editing, instruction: e.target.value })} /><FieldDescription>Screen-based rules work best. Hidden tabs, website identity, and personal intent may not be observable.</FieldDescription></Field>{ruleError && <p role="alert" className="text-sm text-destructive">{ruleError}</p>}</FieldGroup>}<DialogFooter>{editing && draft.rules.some(r => r.id === editing.id) && <Button variant="ghost" className="mr-auto" onClick={() => { setDraft(d => ({ ...d, rules: d.rules.filter(r => r.id !== editing.id) })); setEditing(null) }}><Trash2 data-icon="inline-start" />Remove</Button>}<Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={commitRule}>Apply rule</Button></DialogFooter></DialogContent></Dialog>
  </div>
}
