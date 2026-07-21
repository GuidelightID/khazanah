# Security Policy

## Supported versions

During 0.x, only the latest published version receives fixes.

## Reporting a vulnerability

Please report security issues **privately** to the maintainers (open a GitHub Security Advisory when the repo is public, or email the listed maintainers).

Do not open public issues for exploitable vulnerabilities.

## Scope notes

- Core emits **no telemetry**.
- Adapters that fetch remote data should use allowlisted base URLs.
- Page IR is validated with size caps (`IR_LIMITS`) to reduce DoS risk from malicious JSON.
