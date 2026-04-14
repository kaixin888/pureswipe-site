# clowand Multi-Agent Rectification & Evolution Rules (v1.0)

Based on the [multi-agent-report.md](multi-agent-report.md) findings (2026-04-14), all agents must adhere to:

## 1. Evidence-Based Reporting (P0 - False Positives)
- **Problem**: Agents say "PASS" or "Success" when code isn't even pushed.
- **Evolution**: No "PASS" without raw evidence (curl logs, browser screenshots, or grep outputs).
- **Rule**: Every summary must include: **"What was tested" + "Link to Raw Evidence"**.

## 2. Supervisor Hierarchy (P0 - Command Bombardment)
- **Problem**: Multiple agents giving overlapping or conflicting instructions.
- **Evolution**: **电商专家 (TL)** is the sole coordinator. All members report to TL. Only TL issues final deployment instructions to the user.
- **Rule**: Daily Assistant will focus on **Project Archiving** and **Verification**, avoiding redundant summaries.

## 3. Automated Deployment Only (P0 - Paste Failures)
- **Problem**: Manual code pasting leads to truncation and broken websites.
- **Evolution**: **Watt Toolkit** has fixed Git connectivity. All updates must use `git push` or GitHub API.
- **Rule**: Never ask the user to manually copy/paste more than 5 lines of code.

## 4. Shared Memory (P1 - Memory Sync)
- **Problem**: Agents are disconnected and "forget" previous decisions.
- **Evolution**: **MemPalace** is the source of truth. Every core decision (Refund Policy, SEO Tags) must be saved in drawers.
- **Rule**: Before any task, agents MUST use `mempalace_search` to align with the latest truth.

## 5. Role Integrity (P1 - Role Overlap)
- **Problem**: Auditor editing code; Assistant acting as Programmer.
- **Evolution**:
    - **Auditor**: Audits only (Black-box testing).
    - **Programmer**: Codes only.
    - **Daily Assistant**: Archives decisions and verifies the Auditor's PASS.

*Archived by Daily Assistant on 2026-04-14*
