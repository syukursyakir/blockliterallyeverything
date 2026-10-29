# Skill installation and adaptation record

## Outcome and limits

Six instruction skills were downloaded from their original repositories first,
then read and adapted locally: Ponytail, shadcn, Vercel Web Design Guidelines,
Vercel Composition Patterns, Vercel React Best Practices, Microsoft Playwright CLI.
Supporting files were retained. See sources.json for exact commits, original
SHA-256 hashes and changed paths. Original entrypoints are in upstream/*/SKILL.md.txt;
full originals can be recovered from their pinned repositories. This is a local
fork, not an upstream release or endorsement. No plugin hooks or CLI dependencies
were installed. Host discovery in a future/new session is not tested here.

## OpenAI sources and model-specific limitation

Read on 2026-10-28:

- Official OpenAI cookbook Codex Prompting Guide:
  https://github.com/openai/openai-cookbook/blob/a8132ca2f7a5de3a6cf15d9e79d172787b42b697/examples/gpt-5/codex_prompting_guide.ipynb
  The guide explicitly names gpt-5.3-codex. Used its reusable advice about concrete
  scope, autonomous completion, codebase exploration, tools, verification and
  repository instructions. Its model/API-specific details are NOT 6.1 guidance.
- Official Codex skills and AGENTS pointers:
  https://github.com/openai/codex/blob/main/docs/skills.md
  https://github.com/openai/codex/blob/main/docs/agents_md.md
  These files redirect to the website; they are not full substitute documentation.
- Official website access attempts to developers.openai.com returned proxy 403,
  including Codex prompting/skills and candidate GPT-6.1 guide/model URLs. Candidate
  URLs were exploratory, not verified existing pages. No accessible official
  Sol/GPT-6.1-specific prompting guide was verified. Do not infer nonexistence or
  fabricate model-specific optimizations from this failure.

No changes to actual model settings, reasoning effort, context limits or API
parameters were made. The installed host instructions remain authoritative.
No skill-effectiveness eval on Sol 6.1 has run. Download/read/adaptation is complete;
the specifically requested 6.1 documentation research remains unverified.

## Adaptations and reasons

| Skill | Local change |
| --- | --- |
| Ponytail | Full mode; smallest complete solution retains recovery, privacy and meaningful tests; reuse shadcn. |
| shadcn | Dark-first Vercel design; official registry default already selected by user; explicit project inspection; only needed components; no automatic install-all showcase; preserve actual primitive APIs. |
| Web Design Guidelines | Review current changed UI without redundant scope questions; available fetch tools instead of assumed WebFetch; dated, content-hashed offline guideline snapshot; desktop/offline applicability. |
| Composition | Use patterns for demonstrated needs; correct claim that React 19 requires replacing useContext; preserve compatible forwardRef. |
| React performance | Apply local client rules; no unsolicited Next.js/server/SSR stack; isolate inference from rendering and clean up native subscriptions. |
| Playwright | UI scope only; synthetic fixtures; no personal browser attachment or automatic artifact posting; separate Windows/model validation. |

Each entrypoint has a short project scope section before upstream instructions.
Local project adaptations explicitly override conflicting retained upstream
instructions and reference examples within each skill. Guideline snapshot source,
retrieval date and SHA-256 are recorded in sources.json; its upstream revision
was not independently pinned. These are project choices, not claimed universal standards. Higher-priority host
instructions and explicit user requirements continue to govern conflicts.

React corrections were checked against official React source docs:
https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/useContext.md
https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/forwardRef.md

## Licenses and updating

Ponytail and shadcn upstream license files and Playwright Apache license are copied
with the skills. Vercel React/Composition frontmatter declares MIT; this pinned
upstream checkout supplies no standalone LICENSE file. Web Design Guidelines has
no explicit license declaration in its entrypoint. Preserve attribution and
resolve missing redistribution terms before a public redistributed release;
do not invent a blanket project license for this vendor material.

Do not update these local forks blindly. Compare upstream at the pinned commit,
preserve the project sections and corrections, inspect changed reference files,
rerun integrity checks and obtain a new review for substantive instruction changes.

## Example task prompt

“Implement rule editing and preview using existing shadcn components. Follow
AGENTS.md and DESIGN.md. Keep inference mocked only in UI tests and clearly label
it. Acceptance: edits persist through the existing settings path, invalid input
has an accessible error, keyboard navigation works, and worker errors are visible.
Run relevant tests and report what needs Windows validation.”

This is a project prompt example, not a special Sol 6.1 incantation.

## Sol 6.1 follow-up research and adopted approach

The user approved the following approach after follow-up research on 2026-10-28:
keep the official OpenAI Codex guide as the general foundation and Ponytail full
as the coding default. Treat Sol-specific community experiments as examples, not
universal prompting rules or another installed instruction pack.

- https://github.com/quisbaum-prog/occam/tree/main/bench/black-hole
  Reports actual gpt-6.1-sol runs with baseline, Occam and Ponytail 4.10 instructions.
  Publishes prompts and methodology, but its published pilot is one visual task
  with one run per setup. It does not establish general savings, quality gains or
  optimal reasoning settings for this project or our newer Ponytail snapshot.
- https://github.com/schoolofai/gpt-6-1-terra-vs-sol-vs-opus
  Its master-branch README supplies coding prompts, graders and results involving
  Sol 6.1. The author describes single-run spot checks and differing tool access;
  this is neither an authoritative prompting guide nor a controlled general ranking.

Google, Bing, developers.openai.com and learn.chatgpt.com requests were blocked
by proxy policy. Accessible GitHub sources did not establish a comprehensive,
reputable Sol 6.1 prompting guide. This is a research limitation, not proof none
exists. Community links above are references as inspected, not pinned vendor code.

For tasks, specify the desired behavior, relevant context, constraints and checks;
let Codex inspect and execute. Keep instructions concise and test outcomes rather
than assuming a wording trick improves the model. Do not change model settings or
stack Occam on Ponytail based on those pilot results.

The independent REVIEW.md covers the skill adaptation reviewed earlier. This
follow-up research note was added afterward and has not had a new independent review.
