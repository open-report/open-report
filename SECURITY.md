# Security Policy

## Supported Versions

open-report is pre-1.0 and moves fast. Security fixes land on the latest
released `0.x` line only; please stay current.

| Version | Supported |
| ------- | --------- |
| latest `0.1.x` | :white_check_mark: |
| older | :x: |

## Reporting a Vulnerability

**Please do not open a public issue for security problems.**

Report privately through GitHub's [private vulnerability reporting][gh-report]
(the **Security → Report a vulnerability** button on the repository), or email
**ch993115@gmail.com** if you prefer.

Include enough detail to reproduce — affected package and version, a minimal
proof of concept, and the impact you observed.

You can expect an initial acknowledgement within a few days. If the report is
accepted, we'll work on a fix and coordinate a release; if we decline, we'll
explain why. We'll credit you in the release notes unless you'd rather stay
anonymous.

## Scope notes

open-report renders reports and exports them via your locally installed Chrome.
It does not run a server for third parties, collect data, or talk to any model
or remote service. The most relevant surfaces are the Vite dev server (local
only) and the `references.bib` / MDX content pipeline. Reports of sandbox
escapes, arbitrary file reads through the dev server, or code execution via
malicious report input are especially welcome.

[gh-report]: https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability
