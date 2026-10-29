# Third-party sources and local modifications

## Application interface

The 13 files under src/components/ui were sourced from the official shadcn/ui
new-york-v4 registry at commit
96da9cc7f1aa10580a3741664e2a77c721206c00 (MIT).
The hosted CLI/registry was blocked in this environment, including color metadata
when using a local registry item. Files were therefore copied from the already
verified official checkout. Changes: local import aliases and transition-all to
transition-colors. The shadcn MIT license is retained at
docs/licenses/shadcn-LICENSE.md.

React, Radix UI, Vite, Electron, Tailwind, Lucide, Geist and build/test libraries
retain their respective licenses. npm package-lock.json pins installed versions.
Font files are bundled from @fontsource/geist and @fontsource/geist-mono rather
than fetched from a font CDN at runtime. Preserve package/font license notices
when building installers.

## OmniJev

worker/vendor/mso is from https://github.com/tinnel123666888/OmniJev at
14dbec4f71e194852c8d7b88ab36ef639493f400, Apache-2.0.
The upstream license is worker/vendor/OMNIJEV-LICENSE.

Local changes in mso/infer.py:

1. The image-cache stat fallback also catches TypeError so a single BytesIO image
   can pass through the existing single-image path without screenshot files.
2. Processor, base-model and PEFT adapter loading explicitly use
   local_files_only=True. Model download is performed separately by the worker.

We do not use the upstream multi-image/video panel path. These patches do not
establish CPU speed or explicit-content detection accuracy.

OmniJev decision weights are declared Apache-2.0 upstream. The separately
downloaded Qwen backbone retains its own terms. Weights are not committed or
bundled in this source distribution. Inspect the exact resolved model revision's
terms before redistributing weights. After publication, the exact downloaded
OmniJev revision 3c9aa908f3c9d3f3ccf16bb281ee705d9e98252f and Qwen base revision
2fc06364715b967f1860aea9cf38778875588b17 both supplied Apache-2.0 LICENSE files.

## Downloaded instruction skills

.agents/skills and docs/skills contain separately attributed instruction material.
See docs/skills/ADAPTATIONS.md and sources.json. Unresolved terms for some Vercel
instruction material need clarification before public redistribution of those
files. Skills are development instructions and are excluded from the application
installer; the application MIT license does not relicense third-party material.
