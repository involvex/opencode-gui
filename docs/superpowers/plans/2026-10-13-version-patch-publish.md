# Version Patch and Extension Publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bump extension version (patch), update CHANGELOG, build, package, and publish to VSCode Marketplace and Open VSX.

**Architecture:** The extension uses `bun run publish` script which runs `vsce publish` and `ovsx publish`. Version bump follows semver patch for dependency updates. CHANGELOG documents changes.

**Tech Stack:** VSCode extension, @vscode/vsce, ovsx, bun, conventional commits

**Spec:** package.json version field, CHANGELOG.md, .github/workflows/release.yml

## Global Constraints

- Use Bun (>=1.3.0) for all package management
- Version follows semver: patch for dependency updates
- Must pass prebuild (format, lint, typecheck) before publish
- Publish to both VSCode Marketplace and Open VSX
- Requires OPEN_VSX_KEY env var for ovsx

## Review Focus

- Version bump is patch (not minor/major) since only dependencies updated
- CHANGELOG includes all dependency changes with correct categories
- No breaking changes in updated packages that affect extension functionality
- Prebuild passes before publish command runs

---

### Task 1: Bump patch version in package.json

**Files:**

- Modify: `package.json:4`

**Interfaces:**

- Consumes: current version "0.4.3" from package.json
- Produces: new version "0.4.4" in package.json

- [ ] **Step 1: Update version field from "0.4.3" to "0.4.4"**

```json
"version": "0.4.4",
```

- [ ] **Step 2: Verify version change**

Run: `cat package.json | grep '"version"'`
Expected: `"version": "0.4.4",`

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: bump version to 0.4.4"
```

---

### Task 2: Update CHANGELOG.md

**Files:**

- Modify: `CHANGELOG.md` (create if doesn't exist)

**Interfaces:**

- Consumes: git log since last release
- Produces: CHANGELOG entry for v0.4.4

- [ ] **Step 1: Check if CHANGELOG.md exists**

Run: `ls CHANGELOG.md 2>&1`

- [ ] **Step 2: Add v0.4.4 entry to CHANGELOG.md**

```markdown
## [0.4.4] - 2026-10-13

### Dependencies

- Update @opencode-ai/sdk from 1.4.6 to 1.18.35 (latest 1.x, v2 compatible)
- Update @floating-ui/dom to 1.8.0
- Update @tiptap/* packages to 3.31.4
- Update marked to 18.1.0
- Update shiki to 4.5.0
- Update solid-js to 1.9.17
- Update vite-plugin-solid to 2.11.14
- Update zod to 4.6.5

### Dev Dependencies

- Update @playwright/test to 1.64.0
- Update @types/node to 26.6.4
- Update @types/vscode to 1.140.0
- Update @vscode/test-electron to 3.1.0
- Update @vscode/vsce to 4.0.0
- Update commander to 15.0.0
- Update concurrently to 10.0.6
- Update eslint to 10.12.0
- Update mocha to 12.0.3
- Update prettier to 3.9.9
- Update tsx to 4.23.15
- Update typescript to 6.0.3
- Update typescript-eslint to 8.71.1
- Update vite to 8.3.4
- Update vitest to 5.0.3

### Other

- Bump engines.vscode to ^1.140.0
- Prettier formatting across codebase
```

- [ ] **Step 3: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG for v0.4.4"
```

---

### Task 3: Run prebuild verification

**Files:**

- None (verification only)

**Interfaces:**

- Consumes: package.json scripts (prebuild, build, lint, typecheck, format)
- Produces: passing verification

- [ ] **Step 1: Run prebuild**

Run: `bun run prebuild`
Expected: format, lint, typecheck all pass

- [ ] **Step 2: Run build explicitly**

Run: `bun run build`
Expected: extension (dist/extension.js) and webview (out/) build successfully

- [ ] **Step 3: Run unit tests**

Run: `bunx vitest run`
Expected: 321 tests pass

---

### Task 4: Package extension

**Files:**

- Produces: `.vsix` file

**Interfaces:**

- Consumes: built extension artifacts (dist/, out/)
- Produces: `awesome-opencode-vscode-0.4.4.vsix`

- [ ] **Step 1: Run package script**

Run: `bun run package`
Expected: Creates `awesome-opencode-vscode-0.4.4.vsix`

- [ ] **Step 2: Verify package contents**

Run: `bunx vsce ls --package awesome-opencode-vscode-0.4.4.vsix`
Expected: Lists all included files correctly

---

### Task 5: Publish to VSCode Marketplace and Open VSX

**Files:**

- None (external publishing)

**Interfaces:**

- Consumes: .vsix file, OPEN_VSX_KEY env var
- Produces: Published extension on both marketplaces

- [ ] **Step 1: Ensure OPEN_VSX_KEY is set**

Run: `echo $OPEN_VSX_KEY` (or check .env)
Expected: Key is available

- [ ] **Step 2: Run publish script**

Run: `bun run publish`
Expected: Publishes to VSCode Marketplace and Open VSX

- [ ] **Step 3: Verify publication**

Run: Check marketplace URLs after publish
Expected: Version 0.4.4 visible on both marketplaces

- [ ] **Step 4: Create git tag**

```bash
git tag v0.4.4
git push origin v0.4.4
```

- [ ] **Step 5: Push commits and tags**

```bash
git push origin main
```
