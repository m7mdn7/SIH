from fastapi import APIRouter
from app.schemas.models import GapAnalysisInput, InnovationGap

router = APIRouter()

@router.post("", response_model=InnovationGap)
def gap_analysis(payload: GapAnalysisInput):
    # Stub response
    pass
