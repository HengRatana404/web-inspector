---
name: web-inspector
description: Full QA of a live or staging website the user owns, with a ready-made kit. A real-Chrome site scan crawls every page and reports broken pages and links (internal and external), broken images/scripts/APIs, JavaScript exceptions, console errors, slow and heavy pages, Core Web Vitals measured as a phone on slow 4G, mobile layout overflow, accessibility (axe-core, WCAG A/AA), SEO basics, mixed content, HTTPS certificate and security headers, and compares each scan with the previous one. Lighthouse 0-100 scores (performance, accessibility, SEO, best practices) and screenshot comparison against the last approved look catch speed-score and layout regressions. Plain-word "journeys" test forms, search and checkout by clicking and typing. A read-only security check looks for exposed secret files, unsafe cookies, missing security headers and HTTPS problems on a site the user owns. An Artillery load test sends hundreds to thousands of users at once and gives one PASSED/FAILED verdict. Every run writes an HTML report with charts, and a GitHub Actions file runs the checks automatically. Use this whenever someone wants to check, audit, scan, QA, bug-hunt, load test or stress test a website by its URL, find broken links, SEO, speed or accessibility problems on their site, check their own site for security issues or vulnerabilities, test that a form or checkout works, see if it handles traffic spikes, set up automatic website checks, or check a site before launch or after a fix, even if they don't say "QA" or "load test". The security check is read-only and gated to sites the user owns; it is not a full penetration test and never sends attack traffic. Not for writing unit tests for code.
---

# web-inspector: scan, journeys, security, load test

A ready-made kit in `template/`. Use it rather than writing new crawlers, browser scripts or load scripts:
it has been tested against sites with planted bugs (all found) and clean sites (no false alarms), and it
handles redirects, sitemaps, third-party noise, bot protection and logins. `template/README.md` is the
user-facing guide with every option.

| File | Job |
|---|---|
| `scan.js` | Real Chrome crawls the site, reports errors and warnings, measures phone speed, compares with the previous scan; saves `results/pages.json` for the load test |
| `journeys.js` + `journeys.txt` | Runs plain-word click-and-type steps (`open`, `click "Text"`, `fill "Label" with "value"`, `expect text "..."`...) |
| `security.js` | Read-only security surface check: exposed secret files, unsafe cookies, missing headers, HTTPS/TLS, directory listing, mixed content. Requires `--i-own-this`. |
| `run-all.js` | Runs `load.yml` and `browser.yml` together and computes the load-test verdict |
| `load.yml` + `load-pages.js` | Fast HTTP users, each requesting 3 random pages/APIs from the last scan (homepage only if none) |
| `browser.yml` + `flows.js` | A few Playwright Chrome users browsing scanned pages while the site is under load |
| `report-html.js` | The HTML reports with charts (self-contained, light and dark) |
| `site.js` | Shared: same-site check (www and http/https count as the same site), bot-check page detection |
| `lighthouse.js` | Lighthouse 0-100 scores per page (`npm run lighthouse -- <url>`, `--desktop`, `--min-score N`) |
| `visual.js` | Screenshots phone + desktop, compared with the approved baseline (`npm run visual -- <url>`; `--update` approves the new look). Pages with ads or clocks differ by themselves |
| `github-workflow.yml` | GitHub Actions setup: scan + journeys weekly or on demand, optional smoke load test, reports as artifacts |

## Before anything runs

1. **Ownership.** Only test a site the user owns or has permission to test; ask if unclear. The scan is as
   light as one visitor, but heavy load on someone else's site is an attack.
2. **Target.** Get the URL and whether it is staging or live. The scan is fine on live; for the load test
   prefer staging, or a quiet time on live. Journeys really submit forms, so on live they need test data
   and must not include steps like "Buy" or "Send" that have real effects, unless the user says so.
3. **Bot protection.** Behind Cloudflare, a WAF or rate limits, the tools report BLOCKED or "requests were
   refused". The fix is on the owner's side (allow-list their IP, a skip rule for a secret header added
   under `config.defaults.headers` in `load.yml`, or staging without protection). Do not look for or build a
   way around bot protection or CAPTCHAs: that is the same technique attackers use.
4. **Logins.** For pages behind a login, the user runs `npm run login -- <url>` and logs in themselves in the
   Chrome window that opens; never type their password. Suggest a test account, and deleting `auth.json`
   afterwards because it holds their session.

## Steps

1. Copy `template/` into the user's project as `web-inspector/` (or a folder they name), then `npm install`
   (Artillery, Playwright, axe-core; a few minutes). Needs Node.js 18+ and Google Chrome. Without Chrome,
   remove `channel: 'chrome'` from `scan.js` and `journeys.js`, `channel: chrome` from `browser.yml` and
   `--channel chrome` from the `login` script, then run `npx playwright install chromium`. On Windows keep
   the folder path short: deep paths hit the 260-character limit.
2. **Scan first**: `npm run scan -- <url>`. Options: `--max-pages N` (default 100), `--auth auth.json`,
   `--no-external`, `--no-a11y`, `--no-phone`, `--show`. Exit codes: 0 passed, 1 errors, 3 blocked. The phone
   speed check adds roughly 2-5 s per page (up to 10 pages). Keep the `results/` folder between runs: each
   scan lists what is new and what got fixed, which is the quickest way to confirm a fix worked.
3. **Journeys**, when the user cares about forms, search, sign-up or checkout: write the steps into
   `journeys.txt` from what the user describes (look at the real page first so the labels and button texts
   match), then `npm run journeys -- <url>`. A failure names the line, the reason and saves a screenshot.
   End every journey with an `expect text "..."` for what success looks like (for example a result name
   or "Thank you"): `expect url` alone passes even when the new page says "Something went wrong".
4. **Security check**, when the user wants to check their own site for security issues: confirm they own the
   site or have written permission, then `npm run security -- <url> --i-own-this`. It is read-only and safe
   on live sites. It is NOT a penetration test: for active testing (injection, XSS, auth), point the user to
   OWASP ZAP against a staging copy (the README has the command). Never run active attack tools yourself, and
   never test a site the user does not own.
5. **Load test**: `npm run test:smoke -- <url>`, then `medium`, then `heavy`, each only if the previous one is
   clean and the user agrees. Run medium/heavy in the background (2-3 minutes). During it, suggest watching
   the server's CPU, memory and logs: the test shows what breaks, the server shows why.
6. **Automatic checks**, if the user wants them: explain the setup at the top of `github-workflow.yml`
   (copy to `.github/workflows/`, add a `SITE_URL` repository variable). Do not push or change repository
   settings for them without asking.

## Reporting to the user

Lead with the verdict, then what is broken and where: the URL, and for broken links the page that links to
it. Group by kind, errors before warnings, and say which warnings are third-party (not theirs to fix).
Phone speed numbers are simulated (slow 4G, slower processor); real visitors vary. For load tests, say at
what load things slowed or failed, which pages/APIs and status codes. Quote numbers from the output rather
than estimating. Point to the HTML report in `results/` for charts. Never call a run PASSED if the output
says FAILED or BLOCKED, or warns that the testing computer was overloaded. If writing a report file is not
allowed in your environment, give the report in your reply instead.

## What this kit does not cover

Say so when relevant: CAPTCHAs, visual design, security testing beyond HTTPS and headers, INP (needs real
visitors' clicks), and accessibility issues that need a human (axe finds roughly half of them).

## Limits of the testing computer

`arrivalRate` is new users per second, not concurrent users. A typical laptop handles roughly 1,000
concurrent HTTP users and 3 to 5 real browsers (~300 MB RAM each). For 10,000+ users, run Artillery from
the cloud (`npx artillery run-fargate`, cloud costs apply).
