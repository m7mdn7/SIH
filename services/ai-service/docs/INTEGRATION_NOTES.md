# SIIP AI Layer Integration Notes

This document provides guidelines for Machine B (Express API) and Machine CC (Types) regarding integration of the AI/ML intelligence layer.

## Types Integration (Machine CC)
- **UniversityMatch**: The Pydantic model for matching has been updated to include a `reasons` field:
  ```typescript
  export interface UniversityMatch {
    universityId: str;
    name: str;
    matchScore: number;
    reasons?: string[]; // Optional explanation strings
  }
  ```
  *Recommendation*: Machine CC should ensure `@siip/types` aligns with this, enabling UI components to render explanation bullet points.

- **SimilarityMatch**: Returns `relationship` field:
  ```typescript
  export interface SimilarityMatch {
    challengeId: str;
    score: number;
    relationship?: 'duplicate' | 'related' | 'weakly_related';
  }
  ```
  *Recommendation*: Update types to support the optional `relationship` string.

---

## API Integration (Machine B)
- **Uvicorn Port**: The AI service runs on port `8000` by default.
- **Thresholds**: Ensure `SIMILARITY_DUPLICATE_THRESHOLD=0.70` and `SIMILARITY_RELATED_THRESHOLD=0.55` are set in the `.env` configuration file so that similarity scores align with `all-MiniLM-L6-v2` expectations.
- **Explainability**: The response of `POST /matches` now returns explanations. It is recommended that `apps/api` proxies this field back to `apps/web` so that university admins can see why they were matched to specific challenges.
