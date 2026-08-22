from fastapi import APIRouter, HTTPException, status

from app.core.logging import logger
from app.schemas.models import GapAnalysisInput, InnovationGap
from app.services.gap_analyzer import gap_analyzer

router = APIRouter()


@router.post(
    "",
    response_model=InnovationGap,
    summary="Analyze the innovation gap of a challenge",
)
async def gap_analysis(payload: GapAnalysisInput):
    if not payload.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description is required for gap analysis.",
        )

    logger.info(f"[API] POST /gap-analysis for challenge ID: {payload.challengeId}")
    try:
        result = gap_analyzer.analyze_gap(
            challenge_id=payload.challengeId,
            description=payload.description,
            ai_analysis=payload.aiAnalysis,
        )
        return result
    except Exception as e:
        logger.error(f"[API] Error in POST /gap-analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gap analysis failed: {e!s}",
        )
