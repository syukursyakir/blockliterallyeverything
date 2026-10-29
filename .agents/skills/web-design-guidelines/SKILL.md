---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

## Project adaptation (2026-10-28)

Within this skill, these local project adaptations override conflicting retained
upstream instructions and reference examples. They do not override system/developer
instructions or the user's explicit requirements.

These are local project instructions, not OpenAI model-specific performance claims.
Use the installed host's real tools and permissions; do not assume Claude hooks,
shell interpolation in Markdown, or an example tool name is available in Codex.
Read only task-relevant linked references. Preserve the user's scope and existing work.
Use the repository AGENTS.md and DESIGN.md for project constraints; system/developer
instructions and the user's explicit directions take precedence over skill defaults.

Apply this to the current changed UI files or named target; do not ask the user
to repeat an obvious review scope. Use the actual available fetch tool, or verified
HTTPS retrieval through the configured proxy, rather than assuming WebFetch exists.
If live guidelines are blocked, use the dated pinned references/web-interface-guidelines.md
and explicitly report that the review used a snapshot. Do not claim it is live.
Check desktop keyboard access, focus, contrast, dark native controls, long rules,
empty/loading/error/offline states, and recovery. Browser URL/deep-link/server rules
apply only where the actual desktop routing requires them. No external CDN/preconnect
is needed for bundled offline assets. Prefer ordinary accessible controls over new
handlers that duplicate native keyboard behavior. Follow DESIGN.md over generic aesthetics.


## Upstream instructions


# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## Usage

When a user provides a file or pattern argument:
1. Fetch guidelines from the source URL above
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.
