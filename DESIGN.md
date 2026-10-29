# Desktop interface direction

Dark mode first. Use Vercel dashboard interfaces as the visual reference, with
our own identity. No Vercel branding or copied proprietary components.

- Compose roughly 90% of the interface from shadcn/ui and its selected primitive
  foundation. This is a reuse preference, not a literal measured quota.
- Neutral canvas and slightly elevated surfaces, subtle borders, compact readable
  typography, restrained corner radii. Define colors through semantic theme tokens.
- Use status colors sparingly alongside text/icons, never color alone. Verify
  contrast instead of assuming a dark palette is accessible.
- Prefer Lucide icons, Geist Sans/Mono bundled locally with appropriate notices,
  and a system font fallback. No runtime font/CDN dependency.
- Prioritize keyboard access, visible focus, labels, screen-reader semantics,
  reduced motion, Windows scaling and long user-authored rules.
- Use existing Button, Field, Switch, Dialog, Alert, Badge, Skeleton, Sidebar and
  other relevant components. Do not hand-build substitutes or install a full
  component catalog for a small settings interface.
- Keep loading, no-model, download, paused, active, uncertain, error and recovery
  states explicit. Do not display an operational failure as a safe classification.
- Blocking cover: dark background, prominent “This content is blocked” message,
  matched rule, optional quote, switch-away/recovery action and session status.
  Keep sensitive image content out of the interruption screen.
- Test focus, keyboard traversal, screen sizes and DPI. Browser visual review is
  useful but does not prove a native cover stays above fullscreen Windows apps.
