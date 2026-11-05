# UZEX Insight AI — E2E test plan

Written from product requirements (selection MVP), not from implementation details.

## Goals

Prove a reviewer can: sign in (dev bypass), see an open sidebar, open every core market page, ask the AI assistant in Uzbek, switch language, and not get XSS from chat input. AI backend is mocked so runs are deterministic.

## Out of scope (not E2E)

- OpenAI answer quality / evals
- Full form validation matrices
- Visual pixel diffs (optional later)
- Real Clerk production auth

## Suites

| ID | Path | Pass criteria | Bug it catches |
| --- | --- | --- | --- |
| A1 | Dev bypass login | Email/password submit lands on AI assistant with heading | Broken redirect / missing bypass form |
| B1 | Sidebar default | On first visit (no sidebar cookie), sidebar expanded and AI nav visible | Sidebar starts collapsed / nav missing |
| B2 | Nav smoke | Each core route shows its page title | Dead route / wrong i18n title |
| C1 | AI happy (mock) | User sends prompt → mocked stream shows fixed reply + tool label | Send broken / stream parser broken |
| C2 | AI API 500 (mock) | Error state shown, app does not crash | Missing error UI |
| C3 | AI empty (mock) | Empty-reply fallback text shown | Infinite pending bubble |
| C4 | AI XSS | Script/img payload does not open `dialog`; text still visible | Unsafe HTML render |
| D1 | Locale | Switch to English → AI heading becomes English | Locale switcher broken |
| E1 | A11y | axe serious/critical = 0 on AI + Overview | Obvious a11y regressions |

## Auth setup

`NEXT_PUBLIC_DEV_AUTH_BYPASS=true`. Session for non-login tests: `localStorage.uzex-dev-session` via fixture.
