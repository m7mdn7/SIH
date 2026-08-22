import uuid

from fastapi import APIRouter, HTTPException, status

from app.core.logging import logger
from app.schemas.models import ProcessInput, ProcessOutput
from app.services.intelligence_pipeline import intelligence_pipeline

router = APIRouter()


@router.post(
    "",
    response_model=ProcessOutput,
    summary="Run the complete end-to-end SIIP intelligence pipeline",
)
async def process_challenge(payload: ProcessInput):
    if not payload.title or not payload.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title and Description are required for end-to-end processing.",
        )

    logger.info(f"[API] POST /process title: {payload.title}")
    try:
        ch_id = payload.challengeId or f"ch_{uuid.uuid4().hex[:8]}"
        res = await intelligence_pipeline.process_challenge(
            challenge_id=ch_id,
            title=payload.title,
            description=payload.description,
            context=payload.context,
        )
        return res
    except Exception as e:
        logger.error(f"[API] Error in POST /process: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Intelligence pipeline failed: {e!s}",
        )
