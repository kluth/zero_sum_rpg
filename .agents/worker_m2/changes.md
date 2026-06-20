# Changes Summary

This document records the changes made to the `tools/semantic_diversity` tool for hardening, including mathematical resilience (slogdet), edge-case handling (skipped files resilience), protobuf/JSON updates, and tests update.

## Modifed Files

1. `semantic_diversity/domain.py`:
   - Modified `DiversityScore` validation to support log-determinant bounds (`[-inf, 1e-9]`). Reject anything greater than `1e-9` (or `nan`).
2. `semantic_diversity/math_services.py`:
   - Refactored `calculate_dpp_diversity` to use `np.linalg.slogdet`. Returns log-determinant. If `sign <= 0`, return `float('-inf')`.
3. `semantic_diversity/ports.py`:
   - Updated `DocumentRepositoryPort.load_documents` return type to `Result[tuple[List[RawDocument], dict[str, str]], str]`.
4. `semantic_diversity/adapters/local_file_repository.py`:
   - Updated `load_documents` to skip non-existent files, empty (zero-byte) files, unsupported file extensions, and files that fail document validation.
   - Logs warnings using python's `logging` module.
   - Accumulates successfully loaded documents and skipped files, returning `Ok((docs, skipped_files))`.
5. `semantic_diversity/contracts/semantic_diversity.proto`:
   - Added `map<string, string> skipped_files = 4;` to `CalculateDiversityResponse`.
6. `semantic_diversity/app/controller.py`:
   - Handled the unpacked `(docs, skipped_files)` tuple.
   - Populated the protobuf response map `skipped_files`.
   - Fails with `success = False` if no valid documents were loaded.
7. `tools/semantic_diversity/run_check.py`:
   - Wrote `diversity_report.json` containing `success`, `diversity_score`, `error_message`, and `skipped_files` to the project root.
8. Test Files (`tests/domain/test_domain.py`, `tests/domain/test_math.py`, `tests/services/test_diversity_service.py`, `tests/adapters/test_local_file_repository.py`, and `tests/app/test_controller.py`):
   - Adjusted assertions to reflect the new log-determinant range.
   - Adjusted `load_documents` assertions to match the returned tuple structure.
   - Added test coverage for empty and invalid files.

---

## Commands Run & Outputs

### 1. Re-compiling Protobuf Contract
Command run from `/home/matthias/project/zero_sum_rpg/tools/semantic_diversity`:
```bash
../../venv/bin/python -m grpc_tools.protoc -I. --python_out=. semantic_diversity/contracts/semantic_diversity.proto
```
*Result*: Command completed successfully with no stdout/stderr output, regenerating `semantic_diversity/contracts/semantic_diversity_pb2.py`.

### 2. Running Unit Tests
Command run from `/home/matthias/project/zero_sum_rpg/tools/semantic_diversity`:
```bash
../../venv/bin/python -m unittest discover tests
```
*Output*:
```
...File is empty: /tmp/tmp835xi1dw/empty.md
.Validation failed for /tmp/tmp6kztqjk0/invalid.md: Document content cannot be empty.
.File not found: nonexistent.md
..Unsupported file extension: .txt
.File not found: invalid.md
................
----------------------------------------------------------------------
Ran 24 tests in 0.771s

OK
```

### 3. Running run_check.py
Command run from `/home/matthias/project/zero_sum_rpg/tools/semantic_diversity`:
```bash
../../venv/bin/python run_check.py
```
*Output*:
```
Found 55 scenario markdown files.
Calculating semantic diversity...
/home/matthias/project/zero_sum_rpg/venv/lib/python3.13/site-packages/scipy/spatial/distance.py:1290: RuntimeWarning: invalid value encountered in sqrt
  return np.sqrt(js / 2.0)
Semantic Diversity Score: -inf
```

The output file `/home/matthias/project/zero_sum_rpg/diversity_report.json` was generated successfully with the following content:
```json
{
    "success": true,
    "diversity_score": -Infinity,
    "error_message": "",
    "skipped_files": {}
}
```
