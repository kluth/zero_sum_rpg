import os
import glob
import numpy as np
from scipy.spatial.distance import jensenshannon
from semantic_diversity.adapters.lda_adapter import LDAAdapter
from semantic_diversity.adapters.local_file_repository import LocalFileRepositoryAdapter
from semantic_diversity.services.diversity_service import SemanticDiversityService
from semantic_diversity.app.controller import SemanticDiversityController
from semantic_diversity.contracts.semantic_diversity_pb2 import CalculateDiversityRequest

def main():
    base_dir = "/home/matthias/project/zero_sum_rpg"
    scenario_files = glob.glob(os.path.join(base_dir, 'scenarios', '*.md'))
    print(f"Found {len(scenario_files)} scenario files.")
    
    repo = LocalFileRepositoryAdapter()
    lda = LDAAdapter(num_topics=55)
    
    docs_res = repo.load_documents(scenario_files)
    docs, skipped = docs_res.unwrap()
    print(f"Loaded {len(docs)} documents successfully. Skipped {len(skipped)}.")
    
    lda.fit(docs)
    
    distributions = []
    for doc in docs:
        dist = lda.transform(doc).unwrap()
        distributions.append(dist.probabilities)
        
    distributions = np.array(distributions)
    print("Distributions shape:", distributions.shape)
    
    # Calculate similarity kernel
    n = len(docs)
    kernel_matrix = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            dist = jensenshannon(distributions[i], distributions[j], base=2.0)
            if np.isnan(dist):
                dist = 0.0
            kernel_matrix[i, j] = 1.0 - dist
            
    print("Kernel matrix min:", kernel_matrix.min(), "max:", kernel_matrix.max())
    print("Kernel matrix diagonal range:", kernel_matrix.diagonal().min(), kernel_matrix.diagonal().max())
    
    # Eigenvalues
    eigenvalues = np.linalg.eigvalsh(kernel_matrix)
    print("Eigenvalues of kernel matrix:")
    print(eigenvalues)
    
    sign, logdet = np.linalg.slogdet(kernel_matrix)
    print("slogdet:", sign, logdet)

if __name__ == "__main__":
    main()
