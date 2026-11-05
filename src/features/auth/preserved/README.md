# Preserved auth UI (not shown to evaluators)

While `NEXT_PUBLIC_DEV_AUTH_BYPASS=true`, `/auth/sign-in` and `/auth/sign-up`
**redirect straight to the dashboard** — no login wall for hackathon judges.

The designs are kept in code so we can restore them later:

| File | What it is |
| --- | --- |
| `original-sign-in-view.tsx` | Kiranism Clerk SignIn (template) |
| `original-sign-up-view.tsx` | Kiranism Clerk SignUp (template) |
| `bypass-sign-in-view.tsx` | Re-export of current live `sign-in-view` (brand + DevBypass form) |
| `../components/dev-bypass-sign-in.tsx` | Bypass email/password form (still in tree) |
| `../components/sign-in-view.tsx` | Live split layout (used when bypass is **off**) |

To show login again: set `NEXT_PUBLIC_DEV_AUTH_BYPASS=false` and use Clerk
(or wire `DevBypassSignIn` back into the sign-in route without redirect).
