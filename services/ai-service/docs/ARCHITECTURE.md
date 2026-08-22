# SIIP AI/ML Service Architecture

This document details the high-level architecture of the SIIP AI/ML service layer.

## Hybrid Design

SIIP's AI layer follows a hybrid architecture, combining deep learning with rule-based heuristics and structured reasoning:

```
                  +--------------------------+
                  |    FastAPI Router Layer  |
                  +-------------+------------+
                                |
             +------------------+------------------+
             |                                     |
    +--------v--------+                   +--------v--------+
    |   AI Services   |                   |  Repositories   |
    | - Analyzer      |                   | - Local JSON    |
    | - Embeddings    |                   | - pgvector      |
    | - Similarity    |                   +-----------------+
    | - Gap Finder    |
    | - Matching      |
    +--------+--------+
             |
    +--------v--------+
    |   LLM Providers |
    | - MockLLM       |
    | - OpenAI        |
    +-----------------+
```

### Components

1. **Challenge Intelligence (`ChallengeAnalyzer`)**: Standardizes text preprocessing, identifies domain classification deterministically via keyword filters, and runs Mock/OpenAI structured extraction to determine severity, affected populations, and missing factors.
2. **Semantic Embedding (`EmbeddingService`)**: Lazy-loads the lightweight `all-MiniLM-L6-v2` SentenceTransformer model locally. Dimension checks on startup guarantee L2-normalized 384-dimensional vectors.
3. **Similarity Engine (`SimilarityService`)**: Evaluates cosine similarity (dot product on normalized vectors). Features hybrid scores boosted by exact domain match (+10%) and partial context match (+5%).
4. **Custom DBSCAN (`ClusteringService`)**: Pure-python density-based spatial clustering of applications with noise, avoiding heavy scikit-learn DLL lock issues on developer platforms.
5. **Innovation Gap Finder (`GapAnalyzer`)**: Classifies societal issues into five categories (research, technology, data, adaptation, expertise) using rule-based keywords, calibrated text rules, and LLM reasoning.
6. **Expertise Normalization (`utils/normalization.py`)**: Resolves arbitrary phrases using rapidfuzz WRatio comparison to map onto a controlled taxonomy of 19 tags.
7. **University Matching (`MatchingService`)**: Ranks 15 seed universities deterministically based on weighted scoring:
   - Domain: 30%
   - Expertise: 25%
   - Department: 15%
   - Previous Projects: 15%
   - Facilities: 10%
   - Location: 5%
