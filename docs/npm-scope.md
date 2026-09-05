# npm scope diligence (M0)

| Candidate | Status | Notes |
|-----------|--------|-------|
| `@mushaf/*` | **Preferred** — verify org availability at kickoff | Generic religious term; usually OK; check squatting |
| `@mushaf-js/*` | **Fallback** if `@mushaf` unavailable | Document in README if used |

## Checklist

- [ ] Attempt to create npm org `mushaf`
- [ ] If taken, create `mushaf-js` and update package names via codemod
- [ ] Reserve package names: `core`, `react`, `renderer`, `cli`
- [ ] Enable 2FA on publishing account

Until publish, `@mushaf/*` packages use `"version": "0.0.0"` and
`publishConfig.access: public`.

## GitHub Packages is a separate track

This page is about **public npm**, and applies to `@mushaf/*` only.

`@guidelightid/mushaf-corpus` publishes to **GitHub Packages** instead, which
requires the npm scope to match the repository owner. That is why its scope is
`@guidelightid` and not `@mushaf` — not a naming inconsistency but a registry
constraint. The same constraint means the `@mushaf/*` packages above **cannot**
be published to GitHub Packages under their current names.

Anything new that should live behind the org's registry follows
`@guidelightid/mushaf-<name>` and publishes via
`.github/workflows/publish-mushaf-corpus.yml` as a template.
