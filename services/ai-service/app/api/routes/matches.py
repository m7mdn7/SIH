from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.models import MatchesInput, UniversityMatch
from app.services.matching_service import matching_service
from app.services.challenge_analyzer import challenge_analyzer
from app.core.logging import logger

router = APIRouter()

@router.post("", response_model=List[UniversityMatch], summary="Find matching university partners")
async def match_universities(payload: MatchesInput):
    if not payload.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description is required for matching."
        )
    
    logger.info(f"[API] POST /matches for challenge ID: {payload.challengeId}")
    try:
        # Resolve domain dynamically using challenge_analyzer fallback if not passed directly
        analysis = challenge_analyzer.analyze(payload.challengeId, "", payload.description)
        domain = analysis.domain
        
        results = matching_service.find_matches(
            domain=domain,
            description=payload.description,
            gap_analysis=payload.gapAnalysis
        )
        return results
    except Exception as e:
        logger.error(f"[API] Error in POST /matches: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"University matching failed: {str(e)}"
        )
