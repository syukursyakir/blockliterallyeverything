# Project instructions

Build a Windows desktop blocker using Jev cloud (currently selected by user) and optional local screenshot decisions, with editable
plain-English rules. The interface is React/TypeScript in a desktop host; native
capture/enforcement and model runtime are separate concerns. Host choice and
OmniJev-0.8B viability are not yet validated. Jev cloud is explicitly authorized; require visible screenshot consent and secure key handling. Do not silently change inference providers.

## Continuity

Read HANDOFF.md, docs/WORKLOG.md and docs/RELIABILITY.md before choosing work.
Detection and blocking reliability is the current priority, ahead of UI polish.
After meaningful work, append outcomes, evidence, limits and the next step to
docs/WORKLOG.md; update HANDOFF.md when the current state or priority changes.
Check existing evidence before rerunning experiments. Do not count fixture tests
as model accuracy or publish without explicit user authorization.

## Coding workflow

Local project adaptations in each skill override conflicting retained upstream
instructions and reference examples; system/developer instructions and explicit
user requirements still take precedence.

- Use `.agents/skills/ponytail/SKILL.md` as the default coding workflow (full mode).
  Read other skills when relevant, not all their references on every task.
- UI implementation: shadcn, React composition, and relevant React performance
  skills. Review: web-design-guidelines. Interface testing: playwright-cli.
- Read affected code/callers first. Make the smallest complete change, reuse
  existing components and preserve unrelated work. No speculative abstractions.
- Complete authorized implementation and useful checks without repeated preference
  questions. Ask only when a missing answer blocks work or materially changes scope.
- Test real failure paths in nontrivial logic; report tests actually run and their
  outcomes. Browser checks do not validate Windows screen capture or native covers.
- Use actual available tools/permissions. Skill examples do not grant new access,
  make Markdown shell substitutions execute, or authorize posting artifacts.
- Existing cloud tasks are isolated; use this checkout. Do not create a worktree
  unless explicitly requested. New skills are on disk; discovery may require a new
  Codex session. Read their files explicitly when necessary in the current session.

## Product and design

- Follow DESIGN.md: dark first, Vercel-inspired, predominantly shadcn primitives.
- Plain English is an input format, not proof that every rule works. Label new
  rules unvalidated; use editable presets and preview for user testing.
- User prioritizes fewer missed violations over false blocks. Measure tradeoffs;
  never present an arbitrary confidence cutoff as a guarantee.
- Default explicit-content scope: sexual activity and explicit nudity. Aim for
  intervention within a few seconds; hardware performance remains unmeasured.
- Use a reversible native cover with usable recovery. No automatic arbitrary
  process termination. Capture/worker errors must show degraded protection.
- No intentional screenshot retention. Audit temporary panels, traces and crash
  paths before asserting privacy; OS paging/dumps preclude an absolute guarantee.
- Pin and verify model/runtime assets. Do not infer deployment speed from GPU
  benchmarks or model parameter count. No bypass-proof or hidden-tab claims.

## Prompting and evidence

Use concrete task goals, relevant file paths, constraints and acceptance checks.
Prefer one canonical instruction to repeated emphatic rules. Give the agent room
to inspect, implement, test and correct. Preserve actual system/developer settings;
do not set model identity, reasoning level or API parameters in skills.

The available official OpenAI Codex guide concerns GPT-5.3-Codex, not a verified
Sol/GPT-6.1 guide. General workflow adaptations are documented in
docs/skills/ADAPTATIONS.md; do not relabel them as proven 6.1 optimizations.
Sol 6.1 community experiments listed there are limited examples, not extra
instruction packs. Keep Ponytail as the default; do not infer model settings or
general performance improvements from single-run community comparisons.
