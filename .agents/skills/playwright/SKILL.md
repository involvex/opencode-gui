---
name: playwright
description: |
  Browser automation CLI using Playwright. Use when automating browser workflows, filling forms, clicking elements, scraping pages, or debugging web issues.
---

# Browser Automation with Playwright

Use the `.bin/playwright` CLI to automate web interactions, debug browser agent jobs, and prototype fixes interactively.

## When to Use

- Pages require interaction, authentication, or dynamic content loading (instead of read_web_page)
- Debugging browser automation errors (clicks not working, selectors failing, elements not found)
- Testing interactions before codifying them in source files

## Commands

```bash
.bin/playwright open <url>          # Launch browser and navigate to URL
.bin/playwright exec <code>         # Execute Playwright TypeScript code
.bin/playwright screenshot          # Save full-page PNG screenshot and HTML to tmp/playwright-screenshots/
.bin/playwright close               # Close the browser
```

The exec command provides access to: `page`, `context`, `state`, `browser`

Example:

```bash
.bin/playwright open https://example.com
.bin/playwright exec "await page.locator('button:has-text(\"Sign in\")').click()"
.bin/playwright exec "await page.fill('input[name=\"email\"]', 'user@example.com')"
.bin/playwright screenshot
.bin/playwright close
```

## Interactive Debugging Workflow

When browser automation errors occur (selectors timing out, clicks not working, elements not found), use the interactive debugging workflow instead of the edit-restart cycle. This reduces iteration time from 5-10 minutes to 30 seconds.

Workflow:

1. Add `page.pause()` to the script before the problematic section
2. Run the job in debug mode in a tmux session
3. Wait for the job to reach the `page.pause()` breakpoint
4. Use `.bin/playwright exec` to explore and prototype fixes interactively
5. Once the fix works, codify it in the source files
6. Restart to verify the fix works end-to-end

Example:

```bash
# Terminal 1: Run job in debug mode
tmux new-session -d -s debug-job 'BROWSER_AGENT_TENANT_SLUG="hhb" BROWSER_AGENT_DEBUG_MODE=true npx tsx apps/browser-agent/scripts/pullOpenReferrals.ts Azalea'

# Terminal 2: Prototype fixes interactively
.bin/playwright exec "await page.screenshot({ path: '/tmp/debug.png' }); return 'saved';"
.bin/playwright exec "const count = await page.locator('.dropdown').count(); return count;"
.bin/playwright exec "await page.locator('.dropdown-trigger').click(); return 'clicked';"
```

See `apps/browser-agent/docs/interactive-debugging-workflow.md` for complete instructions and patient safety warnings.
