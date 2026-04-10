import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def normalize_code(code: str) -> str:
    # Remove single-line comments (Python and JS/C++)
    code = re.sub(r'//.*|#.*', '', code)
    # Remove multi-line comments
    code = re.sub(r'/\*[\s\S]*?\*/', '', code)
    # Replace explicit string literals with a standard token to prevent evasion
    code = re.sub(r'"(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'', '<STR>', code)
    # Normalize whitespaces to single spaces
    code = re.sub(r'\s+', ' ', code).strip()
    return code

def chunk_code(code: str, chunk_size=10):
    """Splits tokenized code into overlapping n-gram chunks for matrix comparison."""
    words = code.split(' ')
    chunks = []
    if len(words) < chunk_size:
        return [" ".join(words)] if words and words[0] else []
    for i in range(len(words) - chunk_size + 1):
         chunks.append(" ".join(words[i:i+chunk_size]))
    return chunks

def detect_plagiarism(code1: str, code2: str):
    # Obfuscation resistance: normalize code first
    norm1 = normalize_code(code1)
    norm2 = normalize_code(code2)
    
    chunks1 = chunk_code(norm1)
    chunks2 = chunk_code(norm2)

    if not chunks1 or not chunks2:
         return {"similarity": 0, "flagged_pairs": []}

    # Vectorize the code chunks
    vectorizer = TfidfVectorizer()
    all_chunks = chunks1 + chunks2
    vectorizer.fit(all_chunks)

    vec1 = vectorizer.transform(chunks1)
    vec2 = vectorizer.transform(chunks2)

    # Compute similarity matrix
    matrix = cosine_similarity(vec1, vec2)
    
    flagged_pairs = []
    threshold = 0.80 # 80% similarity threshold for flagging a specific pair
    
    if len(chunks1) == 0:
        overall_sim = 0
    else:
        # Calculate overall similarity percentage
        max_sims = np.max(matrix, axis=1)
        overall_sim = float(np.mean(max_sims) * 100)

    # Find highest matching flagged pairs
    for i in range(len(chunks1)):
        for j in range(len(chunks2)):
            if matrix[i][j] > threshold:
                flagged_pairs.append({
                    "chunk1_index": i,
                    "chunk2_index": j,
                    "chunk1_preview": chunks1[i],
                    "chunk2_preview": chunks2[j],
                    "similarity": round(float(matrix[i][j]) * 100, 2)
                })

    # Sort and remove extreme duplicates using a set for the previews
    flagged_pairs = sorted(flagged_pairs, key=lambda x: x['similarity'], reverse=True)
    unique_pairs = []
    seen = set()
    for pair in flagged_pairs:
        ident = (pair["chunk1_preview"], pair["chunk2_preview"])
        if ident not in seen:
            seen.add(ident)
            unique_pairs.append(pair)
            if len(unique_pairs) >= 15: # Limit to top 15 pairs
                break

    return {
        "similarity": round(overall_sim, 2),
        "flagged_pairs": unique_pairs
    }
