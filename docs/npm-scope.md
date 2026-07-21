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

Until publish, packages use `"version": "0.0.0"` and `publishConfig.access: public`.
