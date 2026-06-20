# Analysis and Proposal: semantic_diversity Hardening

This document provides a detailed analysis of the `tools/semantic_diversity` tool and outlines the implementation proposal for the required hardening (Milestone M1).

---

## 1. Test Execution Command

The unit test suite is located in the `tests/` directory and utilizes the Python standard `unittest` framework (with `hypothesis` for property-based testing). 

Because `pytest` is not installed in the virtual environment, the tests must be run using Python's built-in `unittest` module.

### Proposed Verification Command
To run all tests from the `tools/semantic_diversity` directory:
```bash
../../venv/bin/python -m unittest discover tests
```

---

## 2. Protobuf Compilation (`protoc`) Verification

We audited the availability of the protocol buffer compiler (`protoc`) and the necessity of regenerating `semantic_diversity_pb2.py`.

### Findings:
1. **Global `protoc`**: The `protoc` command is not available on the global system `PATH` (fails with exit code 127).
2. **Virtual Environment `protoc`**: The virtual environment (`venv`) has the `grpcio-tools` compiler installed. Both the binary `venv/bin/python-grpc-tools-protoc` and the Python module `grpc_tools.protoc` are available and report version **libprotoc 33.5**.
3. **Regeneration Requirement**: If we modify `semantic_diversity.proto` (e.g. to include a map field of skipped files in the response), we must regenerate the compiled output.

### Proposed Compilation Command
Run this command from the `tools/semantic_diversity` directory to regenerate `semantic_diversity_pb2.py`:
```bash
../../venv/bin/python -m grpc_tools.protoc -Isemantic_diversity/contracts --python_out=semantic_diversity/contracts semantic_diversity/contracts/semantic_diversity.proto
```
*Note: To ensure the generated output is correctly referenceable as `semantic_diversity.contracts.semantic_diversity_pb2`, compile with `-I. --python_out=.` relative to the root of `tools/semantic_diversity`:*
```bash
../../venv/bin/python -m grpc_tools.protoc -I. --python_out=. semantic_diversity/contracts/semantic_diversity.proto
```

---

## 3. Implementation Analysis

### R1. Mathematical Resilience (slogdet)
For a large corpus size of $N=55$ documents, using `np.linalg.det` to calculate the similarity matrix determinant can easily suffer from floating-point underflow (evaluating to exactly `0.0` due to multiplying many small eigenvalues) or numerical instability.

We propose two options to address this using `np.linalg.slogdet` (which computes the sign and log-determinant stably).

#### Option A: DiversityScore as Log-Determinant (Recommended)
This option changes the semantic meaning of `DiversityScore` to represent the log-determinant directly. This preserves full numerical granularity for large $N$ (instead of losing precision when exponentiating).

* **`semantic_diversity/domain.py`**
  ```python
  class DiversityScore:
      def __init__(self, value: float):
          self._value = value
          
      @property
      def value(self) -> float:
          return self._value

      @classmethod
      def create(cls, value: float) -> Result['DiversityScore', str]:
          # Log-determinant of a similarity matrix is bounded in [-inf, 0.0]
          if value > 0.0:
              return Err("Diversity score (log-determinant) must be non-positive.")
          return Ok(cls(value))
  ```

* **`semantic_diversity/math_services.py`**
  ```python
  def calculate_dpp_diversity(distributions: List[TopicDistribution]) -> Result[DiversityScore, str]:
      with tracer.start_as_current_span("calculate_dpp_diversity"):
          if not distributions:
              return Err("Cannot calculate diversity for empty list.")
          
          n = len(distributions)
          kernel_matrix = np.zeros((n, n))
          
          for i in range(n):
              for j in range(n):
                  jsd_res = calculate_jsd(distributions[i], distributions[j])
                  if jsd_res.is_err():
                      return Err(f"Failed to build kernel: {jsd_res.unwrap_err()}")
                  dist = jsd_res.unwrap()
                  similarity = 1.0 - dist
                  kernel_matrix[i, j] = similarity
                  
          try:
              # Use slogdet for numerical stability
              sign, logdet = np.linalg.slogdet(kernel_matrix)
              if sign <= 0:
                  logdet = float('-inf')
              return DiversityScore.create(float(logdet))
          except Exception as e:
              return Err(f"Error calculating matrix log-determinant: {str(e)}")
  ```

#### Option B: DiversityScore as Determinant (Clamped via slogdet)
This option keeps the diversity score as a determinant value in `[0, 1]`, but uses `slogdet` to prevent intermediate underflow in product calculations.

* **`semantic_diversity/domain.py`**
  ```python
  class DiversityScore:
      def __init__(self, value: float):
          self._value = value
          
      @property
      def value(self) -> float:
          return self._value

      @classmethod
      def create(cls, value: float) -> Result['DiversityScore', str]:
          # Add a tolerance of 1e-9 for minor float precision variations
          if value < -1e-9 or value > 1.0 + 1e-9:
              return Err("Diversity score must be within [0, 1].")
          clamped_value = max(0.0, min(1.0, value))
          return Ok(cls(clamped_value))
  ```

* **`semantic_diversity/math_services.py`**
  ```python
  def calculate_dpp_diversity(distributions: List[TopicDistribution]) -> Result[DiversityScore, str]:
      with tracer.start_as_current_span("calculate_dpp_diversity"):
          # ... matrix construction ...
          try:
              sign, logdet = np.linalg.slogdet(kernel_matrix)
              if sign <= 0:
                  det = 0.0
              else:
                  det = np.exp(logdet)
              return DiversityScore.create(float(det))
          except Exception as e:
              return Err(f"Error calculating matrix determinant: {str(e)}")
  ```

---

### R2. Edge-Case Hardening
We must modify `LocalFileRepositoryAdapter` to support the interface contract specified in `PROJECT.md`.

#### Interface Signature Update (`ports.py`):
```python
class DocumentRepositoryPort(ABC):
    @abstractmethod
    def load_documents(self, file_paths: List[str]) -> Result[tuple[List[RawDocument], dict[str, str]], str]:
        """Loads and extracts text from local file paths, returning successfully loaded documents and a dictionary of skipped files to error messages."""
        pass
```

#### Proposed Adapter Logic (`adapters/local_file_repository.py`):
```python
import os
import logging
from typing import List, Tuple, Dict
from semantic_diversity.domain import Result, Ok, Err, RawDocument
from semantic_diversity.ports import DocumentRepositoryPort
from pypdf import PdfReader
from opentelemetry import trace

tracer = trace.get_tracer(__name__)
logger = logging.getLogger(__name__)

class LocalFileRepositoryAdapter(DocumentRepositoryPort):
    def load_documents(self, file_paths: List[str]) -> Result[Tuple[List[RawDocument], Dict[str, str]], str]:
        with tracer.start_as_current_span("LocalFileRepositoryAdapter.load_documents"):
            docs = []
            skipped_files = {}
            
            for path in file_paths:
                # 1. Existence check
                if not os.path.exists(path):
                    err_msg = f"File not found: {path}"
                    logger.warning(err_msg)
                    skipped_files[path] = err_msg
                    continue
                
                # 2. Empty file (zero-byte) check
                try:
                    if os.path.getsize(path) == 0:
                        err_msg = f"File is empty (zero-byte): {path}"
                        logger.warning(err_msg)
                        skipped_files[path] = err_msg
                        continue
                except Exception as e:
                    err_msg = f"Error checking file size for {path}: {str(e)}"
                    logger.warning(err_msg)
                    skipped_files[path] = err_msg
                    continue
                
                # 3. Extension validation
                ext = os.path.splitext(path)[1].lower()
                if ext not in ('.md', '.pdf'):
                    err_msg = f"Unsupported file extension '{ext}' for {path}. Only .md and .pdf are supported."
                    logger.warning(err_msg)
                    skipped_files[path] = err_msg
                    continue
                
                # 4. Content extraction
                try:
                    if ext == '.md':
                        with open(path, 'r', encoding='utf-8') as f:
                            content = f.read()
                    elif ext == '.pdf':
                        reader = PdfReader(path)
                        if not reader.pages:
                            raise ValueError("PDF file has no pages")
                        content = "".join([page.extract_text() for page in reader.pages])
                        
                    # 5. RawDocument validation
                    doc_res = RawDocument.create(content)
                    if doc_res.is_err():
                        err_msg = f"Failed to create document from {path}: {doc_res.unwrap_err()}"
                        logger.warning(err_msg)
                        skipped_files[path] = err_msg
                        continue
                        
                    docs.append(doc_res.unwrap())
                except Exception as e:
                    err_msg = f"Error reading file {path}: {str(e)}"
                    logger.warning(err_msg)
                    skipped_files[path] = err_msg
                    
            return Ok((docs, skipped_files))
```

---

### R3. JSON Report

To support structured report output containing diversity scores and a list of skipped files/errors:

1. **Modify `semantic_diversity.proto`**:
   Add a `skipped_files` map to `CalculateDiversityResponse`:
   ```protobuf
   message CalculateDiversityResponse {
       double diversity_score = 1;
       bool success = 2;
       string error_message = 3;
       map<string, string> skipped_files = 4;
   }
   ```

2. **Modify `semantic_diversity/app/controller.py`**:
   Unwrap the tuple from `load_documents`, populate the protobuf map, and ensure it fails gracefully if zero valid documents are found.
   ```python
   def handle_request(self, request: CalculateDiversityRequest) -> CalculateDiversityResponse:
       with tracer.start_as_current_span("SemanticDiversityController.handle_request"):
           resp = CalculateDiversityResponse()
           
           docs_res = self._repository.load_documents(list(request.file_paths))
           if docs_res.is_err():
               resp.success = False
               resp.error_message = docs_res.unwrap_err()
               return resp
               
           docs, skipped_files = docs_res.unwrap()
           resp.skipped_files.update(skipped_files)
           
           if not docs:
               resp.success = False
               resp.error_message = "No valid documents found to calculate diversity."
               return resp
               
           score_res = self._service.calculate_diversity(docs)
           if score_res.is_err():
               resp.success = False
               resp.error_message = score_res.unwrap_err()
               return resp
               
           resp.success = True
           resp.diversity_score = score_res.unwrap().value
           return resp
   ```

3. **Modify `run_check.py`**:
   Import `json`, define output file `diversity_report.json` in the project root, and write the result.
   ```python
   import json
   import os
   # ...
   
   def main():
       # ...
       base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
       # ... controller call ...
       
       report_data = {
           "success": resp.success,
           "diversity_score": resp.diversity_score if resp.success else None,
           "error_message": resp.error_message if not resp.success else "",
           "skipped_files": dict(resp.skipped_files)
       }
       
       report_path = os.path.normpath(os.path.join(base_dir, 'diversity_report.json'))
       try:
           with open(report_path, 'w', encoding='utf-8') as f:
               json.dump(report_data, f, indent=4)
           print(f"JSON report written to {report_path}")
       except Exception as e:
           print(f"Failed to write JSON report: {str(e)}")
           
       if resp.success:
           print(f"Semantic Diversity Score: {resp.diversity_score:.6f}")
       else:
           print(f"Failed to calculate diversity: {resp.error_message}")
   ```
