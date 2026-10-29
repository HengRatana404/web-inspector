# Changelog

## 1.1.0 — 2026-10-29

- Read-only security check (`npm run security -- <url> --i-own-this`): exposed secret files, unsafe
  cookies, missing security headers, HTTPS and certificate problems, directory listing, mixed content.

## 1.0.0 — 2026-10-29

First public release.

- Site scan: broken pages and links, broken resources and APIs, JavaScript and console errors, slow and
  heavy pages, mobile layout overflow, accessibility (axe-core), SEO, HTTPS and security headers.
- Phone speed: Core Web Vitals measured on a simulated slow-4G phone.
- Comparison with the previous scan.
- Journeys: plain-word click-and-type tests.
- Load test with fast HTTP users and real browsers, one PASSED / FAILED verdict.
- HTML reports with charts; GitHub Actions workflow for weekly checks.
