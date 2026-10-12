# Releasing to npm

All public packages publish to **npmjs.com** under the **`@guidelight`** scope,
through Changesets and `.github/workflows/release.yml`.

## One-time setup

1. **npm organization.** On npmjs.com, create the organization `guidelight`
   (free for public packages) and enable 2FA for every member who can publish.
2. **Token.** Create a granular access token with *Read and write* on the
   `@guidelight` scope (or an *Automation* token), and save it as the
   repository secret **`NPM_TOKEN`** (Settings → Secrets and variables → Actions).
3. **Actions permissions.** Settings → Actions → General → *Workflow
   permissions*: allow GitHub Actions to **create and approve pull requests**
   (needed for the release PR). If the organization disables this, enable it
   there first.

Optional, later: once each package exists on npm, switch from the token to
npm **trusted publishing** (package settings → *Trusted publisher* → GitHub
Actions, workflow `release.yml`) and remove `NPM_TOKEN`.

## Every release

1. A PR that changes a publishable package includes a changeset
   (`pnpm changeset`).
2. When it merges, the Release workflow opens or updates the
   **"chore: release packages"** PR (version bumps + `CHANGELOG.md`).
3. Merging that PR runs typecheck and tests, builds, and publishes every
   package whose new version is not on npm yet, with npm provenance.

## What never publishes

Packages with `"private": true` (the examples). A content package whose
source is not ✅ in `LICENSES/matrix.md` must also stay private.

## First release

- `@guidelight/almatsurat` publishes as `0.1.0` and `@guidelight/quran` as
  `0.2.0` (their versions in `package.json`).
- The `@guidelight/mushaf-*` packages publish as `0.0.1` via the pending
  `initial-scaffold` changeset.
