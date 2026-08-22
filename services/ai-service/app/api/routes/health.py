from fastapi import APIRouter

router = APIRouter()


@router.get("", summary="Get service health status")
def health_check():
    return {"status": "healthy"}
