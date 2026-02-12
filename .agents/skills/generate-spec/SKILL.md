---
name: generate-spec
description: Create a spec sheet for the given feature/fix request in specs/ directory. Use when planning a significant new feature or complex fix.
---

Create a spec sheet for the given feature/fix request in specs/ directory.

Ultrathink. Follow the following steps:

## Understand existing code

Use `finder` and `Grep` as much as possible to deeply understand all of the relevant code. Be smart about your code search: start with where you think it might be, and if that inspires different places to read, follow up with sub-agents to do so. Each sub-agent should give you back information, and potentially other files to read or searches that might be relevant.

## Understand external documentation/libraries

If external libraries are involved, always look up and research their relevant documentation as well. Tend to adhere strictly to the examples and best practices provided by the external libraries.

## Ask good questions

The feature/fix request from the user will not always be completely defined. There may be logical errors embedded or important clairfications required before the spec can continue. Examples of these may be of the form "How can I retrieve that data over here?" or "This seems like it will require a major rewrite" or "This feels like it will require lots of duplication". You are a talented software engineer who prioritizes clean, simple, readable code -- if something seems like it's going to spiral into complexity, bring up the concern to the user. That being said, don't feel like you _have_ to ask questions. If the feature request is defined and straightforward, go ahead and just write the spec -- only involve the user if it seems like something is egregiously wrong. Practice good judgement.

## Write an effective spec

Follow the guidelines specified below:

### Spec Structure

Specs should always have the following form:

#### Problem overview

A couple plain English sentences describing the problem: either a bug, or a feature request, or a refactor to be done with motivation

#### Solution overview

A couple plain English sentences describing the proposed solution.

#### Important files/docs for implementation

A list of all the files that are involved in the implementation. Also included should be any docs files or external links to documentation.

#### Implementation

A phased plan where each phase represents a single commit-sized change (<100 lines). Each phase should be independently committable and leave the codebase in a working state.

Each phase must include success criteria as task items alongside the implementation tasks. Success criteria are verifiable assertions: quick checks ("ensure X is in package.json"), unit tests to write and run, or manual user stories. They should be the minimum set needed to confirm the phase is correctly done.

```
### Phase 1: Add gender and age fields to the provider search input schema

- [ ] Add `gender` parameter to `searchProvidersInput` schema in `apps/api/src/tools/searchProviders.ts` as optional `z.enum(["M", "F"])`
- [ ] Add `ageFilter` parameter using structured object with optional `min_age` and `max_age` integer fields
- [ ] Verify `pnpm run typecheck` passes with the new fields
- [ ] Add a unit test that parses input with `gender: "M"` and `ageFilter: { min_age: 30 }` without throwing

### Phase 2: Implement gender and age filtering logic

- [ ] Add gender filtering logic to the database query using `eq(providers.gender, gender)` when gender is provided
- [ ] Add age range filtering logic using `gte(providers.age, min_age)` and `lte(providers.age, max_age)` when age filters are provided
- [ ] Add a unit test querying with `gender: "F"` and assert only female providers are returned
- [ ] Add a unit test querying with `ageFilter: { min_age: 30, max_age: 50 }` and assert results are within range
```

```
### Phase 1: Create Assistant Pane component

- [ ] Create `apps/web/src/components/AssistantPane.tsx` with basic UI structure
- [ ] Add state management for messages and loading status
- [ ] Wire up backend calls using useApiClient
- [ ] Verify the component renders without errors in isolation

### Phase 2: Integrate Assistant Pane into application layout

- [ ] Add the AssistantPane component to the right sidebar in `apps/web/src/App.tsx`
- [ ] Manually verify the pane appears in the sidebar and does not break existing layout

### Phase 3: Implement context gathering

- [ ] Fetch the current taskId from the URL using the useRoute("/task/:taskId") hook
- [ ] Query local database for task, patient, and document context
- [ ] Prepend context to the chat history
- [ ] Add a unit test that given a taskId, the correct context is prepended to chat history

### Phase 4: Remove AIContext abstraction

- [ ] Delete `apps/web/src/contexts/AIContext.tsx`
- [ ] Remove the AIProvider from the provider tree in `apps/web/src/components/Providers.tsx`
- [ ] Consolidate state management logic directly within AssistantPane
- [ ] Verify `pnpm run typecheck` passes with no references to the deleted AIContext
- [ ] Manually verify the assistant pane still functions end-to-end after the removal
```

#### Sanity checklist

These should always be the following task items, to be done after a spec is implemented

```
- [ ] Run `pnpm type-check` to ensure all TypeScript types are correct
- [ ] Run `pnpm build` to ensure all packages compile successfully
- [ ] Run `pnpm lint` to verify no linting errors
- [ ] Ensure all written code adheres to the quality documentation in AGENT.md
- [ ] If this spec involves frontend changes, test the web app with Playwright using the instructions in AGENT.md
- [ ] Update this spec to mark all tasks as completed
```

### What to avoid in the spec

- Avoid any mobile code
- Avoid creating new UI components unless absolutely necessary to the core functionality. Use design system components as much as possible.
- Avoid any performance optimization unless specifically requested
