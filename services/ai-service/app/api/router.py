from fastapi import APIRouter

from app.api.routes import analyze, gap_analysis, health, matches, similarity

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(
    analyze.router, prefix="/analyze", tags=["Challenge Intelligence"]
)
api_router.include_router(
    similarity.router, prefix="/similarity", tags=["Semantic Similarity"]
)
api_router.include_router(
    gap_analysis.router, prefix="/gap-analysis", tags=["Innovation Gap Analysis"]
)
api_router.include_router(
    matches.router, prefix="/matches", tags=["University Matching"]
)
