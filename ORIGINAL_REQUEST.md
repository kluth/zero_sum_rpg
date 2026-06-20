# Original User Request

## Initial Request — 2026-06-20T10:19:03+02:00

The goal is to harden the existing `tools/semantic_diversity` tool to make it production-ready and absolutely bulletproof. Once hardened, the tool must be executed to analyze all markdown files in the `scenarios` directory and report their semantic diversity score.

Working directory: /home/matthias/project/zero_sum_rpg
Integrity mode: development

## Requirements

### R1. Mathematical Resilience
Refactor the Determinantal Point Process (DPP) algorithm to support large document counts (e.g., $N=55$) without floating-point underflow. You must use a mathematically stable approach such as Log-Determinant (`slogdet`) so the tool can evaluate large corpuses.

### R2. Edge-Case Hardening
The tool must gracefully handle edge cases—such as zero-byte files, unreadable files, or unsupported formats—without crashing. Invalid files should be skipped and logged.

### R3. JSON Report Generation
The tool must output a final JSON report upon completion. This report should contain the overall semantic diversity metric and a detailed list of any file-specific errors or skips.

## Acceptance Criteria

### Testing & Robustness
- [ ] The unit test suite is updated to verify mathematical stability for large matrices and passes successfully.
- [ ] The unit test suite is updated to verify edge-case handling (e.g., zero-byte files) and passes successfully.

### Execution & Output
- [ ] The tool successfully executes against the `scenarios/` directory without fatal crashes.
- [ ] A `diversity_report.json` file is produced containing a mathematically valid diversity metric (avoiding the `0.000000` underflow) and a list of any errors.
