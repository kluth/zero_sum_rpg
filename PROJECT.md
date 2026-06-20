# Project: semantic_diversity Hardening

## Architecture
- Module/package boundaries:
  - Domain Layer: `domain.py`, `math_services.py`
  - Ports: `ports.py`
  - Adapters: `adapters/lda_adapter.py`, `adapters/local_file_repository.py`
  - Application: `app/controller.py`
  - Services: `services/diversity_service.py`
- Data flow: Local files -> Repository Adapter -> RawDocuments -> LDA Adapter (Topic Distributions) -> Math Services (slogdet) -> Controller -> Runner/JSON output.
- Shared interfaces: `DocumentRepositoryPort`, `TopicModelPort`

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Explore & Design | Perform repository exploration, find test commands, verify dependency configuration. | None | DONE |
| 2 | M2: Implementation | Implement slogdet in math_services.py, modify local_file_repository.py to skip invalid files, update app/controller.py and run_check.py for JSON reporting. | M1 | DONE |
| 3 | M3: Verification | Update unit tests, run tests, verify stability on large corpuses, perform reviews, and run forensic audit. | M2 | DONE |
| 4 | M4: Production Run | Execute against scenarios/ to generate diversity_report.json. | M3 | DONE |

## Interface Contracts
### DocumentRepositoryPort ↔ Controller / Service
- `load_documents(file_paths: List[str]) -> Result[tuple[List[RawDocument], dict[str, str]], str]`
  - Loads and extracts text from file paths, returns list of successfully loaded documents and a dictionary mapping skipped/failed file paths to their error messages.
