from fastapi import APIRouter, HTTPException, status
from app.schemas.models import ChallengeInput, ChallengeAIAnalysis
from app.services.challenge_analyzer import challenge_analyzer
from app.core.logging import logger

router = APIRouter()

@router.post("", response_model=ChallengeAIAnalysis, summary="Analyze a societal challenge")
async def analyze(payload: ChallengeInput):
    if not payload.title or not payload.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title and description are required"
        )
    
    logger.info(f"[API] POST /analyze for challenge ID: {payload.id}")
    try:
        result = challenge_analyzer.analyze(payload.id, payload.title, payload.description)
        return result
    except Exception as e:
        logger.error(f"[API] Error in POST /analyze: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )
