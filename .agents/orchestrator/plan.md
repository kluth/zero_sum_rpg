# Hardening Plan: semantic_diversity

This plan outlines the steps to harden the `tools/semantic_diversity` tool to make it production-ready and run it on `scenarios/`.

## 1. Objectives
- **R1. Mathematical Resilience**: Refactor the DPP algorithm to use `slogdet` (log-determinant) for stability on large corpuses ($N=55$) and avoid floating-point underflow.
- **R2. Edge-Case Hardening**: Gracefully handle and skip invalid files (zero-byte, unreadable, unsupported formats) without crashing.
- **R3. JSON Report Generation**: Produce `diversity_report.json` containing the overall diversity score and a detailed list of skips/errors.
- **Execution**: Run the tool on the `scenarios/` directory and produce the final JSON report.

## 2. Iteration Loop Strategy (Orchestration Pattern: Project)
We will run a direct Explorer -> Worker -> Reviewer -> Challenger -> Auditor iteration loop.
- **Phase 1: Exploration**: Spawn `teamwork_preview_explorer` to perform a comprehensive code audit, propose modifications, verify Python dependencies, and determine if `protoc` compilation is needed.
- **Phase 2: Implementation**: Spawn `teamwork_preview_worker` to implement all changes (slogdet, skipping/logging in file repo, protobuf updates if any, JSON report output in `run_check.py`, and test updates).
- **Phase 3: Verification**:
  - Spawn `teamwork_preview_reviewer` to review code correctness, readability, and API boundaries.
  - Spawn `teamwork_preview_challenger` to run unit/integration tests and verify $N=55$ stability.
  - Spawn `teamwork_preview_auditor` to perform integrity forensics.
- **Phase 4: Run & Report**: Run the hardened tool on `scenarios/` to generate `diversity_report.json` and deliver the final report.

## 3. Milestones
| Milestone | Description | Status |
|-----------|-------------|--------|
| M1: Explore & Design | Analyze code, dependencies, and layout; propose implementation details. | Pending |
| M2: Implementation | Modify math_services, local_file_repository, controller, and run_check. | Pending |
| M3: Verification | Run tests, verify stability, perform reviews and integrity audits. | Pending |
| M4: Production Run | Execute against scenarios/ and produce diversity_report.json. | Pending |
