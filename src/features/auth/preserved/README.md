# Preserved Clerk auth UI

Original login / register layout from the Kiranism template.

- `original-sign-in-view.tsx` — Clerk SignIn form + split layout
- `original-sign-up-view.tsx` — Clerk SignUp form + split layout

Active app uses `DevBypassSignIn` while `NEXT_PUBLIC_DEV_AUTH_BYPASS=true`.
When ready for real Google/email auth: set bypass to `false` and restore these
views (or keep using `ClerkSignInForm` / `ClerkSignUpForm` in the live pages).
