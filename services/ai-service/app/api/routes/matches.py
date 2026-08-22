from fastapi import APIRouter
from typing import List
from app.schemas.models import MatchesInput, UniversityMatch

router = APIRouter()

@router.post("", response_model=List[UniversityMatch])
def match_universities(payload: MatchesInput):
    # Stub response
    pass
