from fastapi import APIRouter
from typing import List
from app.schemas.models import SimilarityInput, SimilarityMatch

router = APIRouter()

@router.post("", response_model=List[SimilarityMatch])
def similarity_search(payload: SimilarityInput):
    # Stub response
    pass
