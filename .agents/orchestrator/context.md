# Context: semantic_diversity Hardening

## Requirements Reference
- **R1**: Mathematical Resilience. DPP algorithm must use log-determinant (slogdet) to support $N=55$ without underflow.
- **R2**: Edge-Case Hardening. Zero-byte files, unreadable files, and unsupported formats must be skipped/logged, not crash the tool.
- **R3**: JSON Report. Generate `diversity_report.json` with the overall diversity metric and a list of file-specific errors/skips.

## Codebase Layout
- `tools/semantic_diversity/run_check.py`: Entrypoint for running the tool.
- `tools/semantic_diversity/semantic_diversity/domain.py`: Domain models (TopicDistribution, DiversityScore, RawDocument, Result).
- `tools/semantic_diversity/semantic_diversity/math_services.py`: DPP diversity calculation using similarity matrix (JSD).
- `tools/semantic_diversity/semantic_diversity/ports.py`: Repository and topic model port interfaces.
- `tools/semantic_diversity/semantic_diversity/adapters/lda_adapter.py`: sklearn LDA model adapter.
- `tools/semantic_diversity/semantic_diversity/adapters/local_file_repository.py`: File loading from path (PDF, MD).
- `tools/semantic_diversity/semantic_diversity/app/controller.py`: Handle request using repository and service.
- `tools/semantic_diversity/semantic_diversity/services/diversity_service.py`: Topic model fitting and diversity scoring.
- `tools/semantic_diversity/tests/`: Unit test suite (adapters, app, domain, services).

## Execution Target
- Corpus to analyze: `scenarios/*.md` (approx. 55 files).
- Output: `diversity_report.json` at project root.
