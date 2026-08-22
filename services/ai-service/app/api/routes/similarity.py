from fastapi import APIRouter, HTTPException, status

from app.core.logging import logger
from app.schemas.models import SimilarityInput, SimilarityMatch
from app.services.similarity_service import similarity_service

router = APIRouter()


@router.post(
    "", response_model=list[SimilarityMatch], summary="Search for similar challenges"
)
async def similarity_search(payload: SimilarityInput):
    if not payload.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description is required for similarity search.",
        )

    logger.info(f"[API] POST /similarity search query: '{payload.title or ''}'")
    try:
        results = similarity_service.find_similar(
            title=payload.title,
            description=payload.description,
            challenge_id=payload.challengeId,
            domain=payload.domain,
            limit=payload.limit or 10,
        )
        return results
    except Exception as e:
        logger.error(f"[API] Error in POST /similarity: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Similarity search failed: {e!s}",
        )
