---
title: "Source: Skills Lab GitHub CLAUDE.md (generated)"
type: src
tags: [skills-lab, claude-md, github, documentation]
sources: [src-skills-lab-prd]
created: 2026-05-22
updated: 2026-05-22
---

# Source: Skills Lab GitHub CLAUDE.md (generated)

Generated from wiki pages for copy-paste into the Skills Lab GitHub repo root.
Copy everything inside the fenced block below.

---

````markdown
# Skills Lab — Claude Code Context

## What This Project Is

Skills Lab is a web app where Singapore public service officers and teams can share, discover and manage agent skills. The core value proposition: reduce duplicated effort by creating a shared commons where skills are built once and reused widely across agencies.

Access is restricted to `.gov.sg` email domains.

---

## MVP Feature Set

### 1. Skill Upload & Management
- Upload skill profiles using the Skill Specification template (see below)
- Edit and update skills at any time
- Store skills with metadata: skill type, skill function, data classification tier

### 2. Skills Gallery
- Browse and discover skills shared by other teams and agencies
- Upvote / downvote skills
- Display shows approval status and adopt / adapt / request-new guidance

### 3. Account Management
- Email-based sign-in
- `.gov.sg` domain restriction

---

## The Skill Specification Template

Every skill is defined using these fields:

| Field | Purpose |
|---|---|
| **Purpose** | What the skill is for; the problem it solves |
| **User role** | Who uses this skill and in what context |
| **Inputs** | What the skill needs to operate |
| **Decision logic** | How the skill reasons or decides |
| **Output format** | What the skill produces and how it is structured |
| **Failure conditions** | When the skill should not run, or known failure modes |

Metadata fields: skill type (common / sector-specific / agency-local), skill function (policy / service delivery / etc.), data classification tier.

---

## MVP Success Metrics

- 50 skills uploaded per month (1 per person assigned an agent)
- Reuse rate — skills adopted by more than one team or agency
- Non-engineer contribution rate — skills submitted by policy/operations owners, not developers
- Officer satisfaction with discoverability and trust signals

---

## Docs Structure

```
docs/
├── architecture.md       — system components, data flow, auth
├── data-model.md         — skill object schema, metadata fields
├── features/
│   ├── skill-upload.md   — upload feature spec and acceptance criteria
│   ├── gallery.md        — gallery feature spec
│   └── account.md        — auth and account management spec
└── decisions/            — ADRs: one file per significant decision
```

---

## Documentation Discipline

**After any meaningful unit of work**, sync the docs before moving on:

1. What code was written or changed?
2. What does it actually do (not what it was supposed to do)?
3. How does the implementation differ from what's in the docs?

Then:
- Update `docs/features/[feature].md` to match the real implementation
- Update `docs/data-model.md` if the schema changed
- If a decision was made (even implicitly in code), write an ADR in `docs/decisions/`

After docs are current, surface:
- Gaps between the PRD and what was built
- New open questions the implementation raises

**Don't assume the docs are right. Make them true.**

### ADR format (docs/decisions/ADR-NNN-title.md)

```
# ADR-[N]: [title]
**Date:** YYYY-MM-DD
**Status:** decided

## Context
## Decision
## Rationale
## Consequences
```

---

## Open Technical Questions (unresolved at MVP launch)

- What does the approval workflow look like? (who approves, on what criteria, how long)
- How are skills versioned when a contributor updates them?
- What are the data classification tiers and how do they gate access?
- What do "Guardrails" mean in the technical context? (referenced in PRD but not defined)
- What is the UX for non-engineer contributors completing the Skill Spec form?

Do not invent answers to these. Flag them as open if they surface in implementation.
````

---

## How to Use This

1. Copy the content inside the fenced block above into the root `CLAUDE.md` of the Skills Lab GitHub repo
2. When Claude Code there generates or updates docs, it will use this context to stay PRD-grounded
3. When any open question above gets resolved in implementation, update the CLAUDE.md and ingest the decision back into this wiki
