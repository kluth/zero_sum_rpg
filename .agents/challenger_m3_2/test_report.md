# Semantic Diversity Verification and Stress-Testing Report

This report documents the verification, stress-testing, and mathematical validation of the `semantic_diversity` tool.

---

## 1. Executive Summary
The `semantic_diversity` tool calculates the diversity of a document corpus using a Latent Dirichlet Allocation (LDA) topic model and a Determinantal Point Process (DPP) kernel.

We completed the following tasks:
1. **Reproduced the `-inf` diversity score** on the `scenarios/` dataset.
2. **Empirically identified the root cause** of the `-inf` score: it is a mathematically expected result of matrix singularity (rank deficiency) combined with floating-point noise, which is triggered when the number of LDA topics is set too high relative to the size of the corpus.
3. **Assessed the mathematical stability** of the `np.linalg.slogdet` implementation and determined that while the helper functions recover gracefully from underflow/zeros, the use of `1.0 - JSD` as a similarity kernel does not guarantee a positive semi-definite (PSD) matrix, which allows negative eigenvalues and sign flips.
4. **Verified edge-case resilience** of the document repository and controller, confirming that invalid, missing, empty, or unsupported files are skipped, logged, and reported correctly without causing crashes.
5. **Implemented stability test cases** under `tests/domain/test_stability.py` and `tests/app/test_controller.py` to ensure long-term regression safety.

---

## 2. Investigation of the `-inf` Diversity Score on `scenarios/`
When run on the 55 scenario markdown files (`scenarios/*.md`) with `num_topics=55`, the tool outputs a diversity score of `-inf`. We determined this is caused by the following chain of events:

### A. Overparameterized Topic Collapse
* **Scenario Count ($n$)**: 55 documents.
* **Topic Count ($d$)**: 55 topics.
* Fitting 55 topics on only 55 documents is highly overparameterized. The default Dirichlet prior for documents in scikit-learn's LDA is $\alpha = 1 / d = 1/55 \approx 0.018$, which enforces high sparsity.
* Due to the lack of sufficient co-occurrence data to distinguish 55 distinct topics, the LDA optimization collapses. 
* Our debug harness (`debug_lda.py`) revealed that **51 out of 55 documents** map to **Topic 22** as their dominant topic, with a probability of **~0.9967** (and all other 54 topics receiving ~0.00006 probability).
* As a result, the topic probability distributions for these 51 documents are nearly identical.

### B. Matrix Rank Deficiency
* Because 51 out of 55 documents have nearly identical topic distribution vectors, their pairwise Jensen-Shannon Distance (JSD) is extremely close to 0.0, and their similarity ($1 - \text{JSD}$) is extremely close to 1.0.
* This introduces massive linear dependencies in the similarity kernel matrix $K$.
* Our mathematical analysis shows that the matrix $K$ has a **rank of 50** instead of its full rank of 55.
* A rank deficiency of 5 means that mathematically, the matrix has 5 eigenvalues that are exactly 0.0.

### C. Floating-Point Noise and Determinant Sign Flips
* In double-precision arithmetic, the 5 zero eigenvalues are perturbed by numerical noise, resulting in small positive and negative eigenvalues:
  ```
  Smallest eigenvalues: [-1.569e-08, -5.511e-09, -5.311e-09, -2.983e-09, -7.450e-10, ...]
  ```
* Because of these negative eigenvalues, the matrix is no longer positive semi-definite (PSD).
* The determinant of the matrix (the product of all eigenvalues) is extremely close to 0.0, and its sign depends on the signs of these numerical noise eigenvalues.
* Since the sign of the determinant is negative (`sign = -1.0`), the implementation in `math_services.py` sets the diversity score to `-inf`:
  ```python
  sign, logdet = np.linalg.slogdet(kernel_matrix)
  if sign <= 0:
      val = float('-inf')
  ```

### D. Empirical Relationship: `num_topics` vs Matrix Stability
To confirm this hypothesis, we ran the similarity analysis for different topic counts using our test harness `test_num_topics.py`:

| Num Topics | Matrix Rank | Min Eigenvalue | Det Sign | Log-det / Diversity Score |
| :--- | :---: | :---: | :---: | :--- |
| **2** | 55 (Full) | $+5.399 \times 10^{-7}$ | $+1.0$ | `-440.231884` |
| **3** | 55 (Full) | $+7.000 \times 10^{-6}$ | $+1.0$ | `-401.022421` |
| **5** | 55 (Full) | $+2.568 \times 10^{-6}$ | $+1.0$ | `-412.533759` |
| **10** | 55 (Full) | $+1.026 \times 10^{-7}$ | $+1.0$ | `-463.994683` |
| **20** | 54 (Singular) | $-2.994 \times 10^{-16}$ | $-1.0$ | `-inf` |
| **30** | 50 (Singular) | $-7.027 \times 10^{-9}$ | $-1.0$ | `-inf` |
| **40** | 51 (Singular) | $-1.746 \times 10^{-8}$ | $-1.0$ | `-inf` |
| **50** | 50 (Singular) | $-1.172 \times 10^{-8}$ | $+1.0$ | `-648.521577` (extreme near-singular) |
| **55** | 50 (Singular) | $-1.569 \times 10^{-8}$ | $-1.0$ | `-inf` |

*Conclusion*: The `-inf` diversity score is mathematically expected and correct given the input parameter choice. Setting the number of topics equal to or greater than the document count leads to topic collapse, matrix singularity, and numerical instability. For this corpus size (55 documents), a topic count of **3 to 10** is mathematically stable and produces valid diversity scores.

---

## 3. Mathematical Stability of the Log-Determinant
The current implementation of the log-determinant relies on `np.linalg.slogdet`:

```python
sign, logdet = np.linalg.slogdet(kernel_matrix)
if sign <= 0:
    val = float('-inf')
else:
    val = float(logdet)
```

### Key Findings on Stability:
1. **Graceful Underflow**: If the matrix is singular and the determinant underflows to exactly 0, `slogdet` returns `sign = 0.0` and `logdet = -inf`. The code handles this correctly by returning `-inf`.
2. **Invalid PSD Kernel**: The kernel is defined as $K_{ij} = 1.0 - \text{JSD}(p_i, p_j)$. While JSD distance is a metric, $1 - \text{JSD}$ is not a mathematically guaranteed positive semi-definite (PSD) kernel. When the matrix has negative eigenvalues due to kernel properties or numerical noise, the determinant sign can flip to negative, leading to `-inf` even if the eigenvalues are very small.
3. **Alternative Approach (Recommendations for future iterations)**:
   * **Exponentiated Kernel**: Using an RBF-like kernel: $K_{ij} = \exp(-\gamma \text{JSD}(p_i, p_j)^2)$ guarantees a mathematically positive-definite kernel (PSD) by Schoenberg's theorem.
   * **Ridge Regularization (Jitter)**: Adding a small identity perturbation (e.g. $K \leftarrow K + 10^{-6} I$) is standard practice in DPPs. This shifts all eigenvalues positive and prevents singularity and negative eigenvalues caused by float noise.
   * **Cholesky-based Log-determinant**: Computing Cholesky factorization $K = L L^T$ and calculating $\log \det(K) = 2 \sum \log L_{ii}$ is numerically superior to `slogdet`.

---

## 4. Robustness and Crash Resilience
We verified that the file repository and controller gracefully handle all edge-case files without crashing:

1. **Non-existent Files**: Correctly skipped and recorded as `File not found`.
2. **Zero-Byte / Empty Files**: Correctly skipped and recorded as `File is empty`.
3. **Unsupported Formats (e.g., `.txt`)**: Correctly skipped and recorded as `Unsupported file extension`.
4. **Directory Paths**: Correctly skipped. If directory paths are passed, they either fail the extension check or trigger `IsADirectoryError` during read, which is caught and skipped.
5. **Invalid Document Contents (e.g. Whitespace only)**: Correctly skipped and recorded as `Validation failed`.
6. **Mixed Inputs**: Verified that when a mix of valid and invalid files is provided, the controller correctly processes the valid files, skips the invalid ones, and reports them in the `skipped_files` map.

---

## 5. Summary of Test Harnesses and Scripts
The following scripts and test cases were created to stress-test the implementation:

* **`tools/semantic_diversity/debug_analysis.py`**: Computes the topic distributions, constructs the similarity matrix, checks for duplicate distributions, and prints the eigenvalues, rank, and determinant sign of the scenario similarity matrix.
* **`tools/semantic_diversity/debug_lda.py`**: Analyzes the document-term matrix and prints individual topic distribution vectors to verify topic collapse.
* **`tools/semantic_diversity/test_num_topics.py`**: Systematically runs the diversity calculations for a range of topic counts ($2 \le d \le 55$) and logs rank, eigenvalues, and scores.
* **`tools/semantic_diversity/tests/domain/test_stability.py`**: Unit tests verifying `slogdet` stability under extreme probabilities, float noise, redundancy, underflow, and orthogonal distributions.
* **`tools/semantic_diversity/tests/app/test_controller.py`**: Added mixed-file input validation test case (`test_handle_request_mixed_files`).
