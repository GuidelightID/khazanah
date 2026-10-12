# Releasing to npm

Public packages publish to **npmjs.com** under the **`@guidelightid`** scope
(npm organization `guidelightid`). Releases use Changesets for versions and
changelogs, and **npm trusted publishing** (OIDC from GitHub Actions) to
publish: no npm token is stored anywhere. Provenance is added automatically.

Published: `@guidelightid/almatsurat`, `@guidelightid/quran`, `@guidelightid/doa`.
Each new package's first version is published by hand (see below).
The `@guidelightid/mushaf-*` renderer packages are `"private": true` until the
renderer leaves its 0.0.x scaffolding (they also depend on each other through
`workspace:*`, which `npm publish` does not rewrite).

## One-time setup

### 1. npm account and organization
- Enable **two-factor authentication** on your npm account
  (Account → Two-Factor Authentication, "Authorization and writes").
- Organization **`guidelightid`** exists; members who may publish need the
  *developer* or *owner* role.

### 2. First publish of a new package (manual, from a laptop)
Trusted publishing is configured from a package's settings page, so a brand-new
package has to exist on npm first. Publish its first version by hand:

```bash
git switch main && git pull
pnpm install
pnpm release:dry-run          # lists what would be published
npm login                     # once
cd packages/almatsurat && npm publish --access public   # asks for your 2FA code
cd ../quran && npm publish --access public
```

Then tag them so Changesets knows the versions are released:

```bash
cd ../.. && pnpm changeset tag && git push --follow-tags
```

### 3. Trusted publisher, per package
On npmjs.com → the package → **Settings → Trusted Publisher → GitHub Actions**:

| Field | Value |
|---|---|
| Organization or user | `GuidelightID` |
| Repository | `khazanah` |
| Workflow filename | `release.yml` |
| Environment | *(empty)* |

**A new trusted publisher configuration expires if it is not used to publish
within 2 days.** Add it right before you merge a release PR, or simply re-add
it if it expired.

Recommended afterwards: package Settings → *Publishing access* → **"Require
two-factor authentication and disallow tokens"**. Trusted publishing keeps
working with this setting.

### 4. GitHub Actions permissions
Repository Settings → Actions → General → *Workflow permissions*: enable
**"Allow GitHub Actions to create and approve pull requests"** (the release PR).

## Every release after that

1. A PR that changes a public package includes a changeset (`pnpm changeset`).
2. After it merges, the **Release** workflow opens or updates the
   **"chore: release packages"** PR (version bumps + `CHANGELOG.md`).
3. Merging that PR runs typecheck and tests, builds, and publishes every public
   package whose new version is not on npm yet (`scripts/publish.mjs`, using
   npm ≥ 11.5.1 on Node 24), then tags the release.

## What never publishes

Packages with `"private": true`: the examples and, for now, the
`@guidelightid/mushaf-*` renderer. A content package whose source is not ✅ in
`LICENSES/matrix.md` must also stay private. To publish the renderer later:
replace its `workspace:*` dependencies with real version ranges (or switch the
publish script to `pnpm publish`), remove `"private": true`, and do the
first-publish and trusted-publisher steps above for each package.
