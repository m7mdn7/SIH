from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.logging import logger


class SIIPAIException(Exception):
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "Validation failure", "details": exc.errors()},
    )


async def siip_exception_handler(request: Request, exc: SIIPAIException):
    logger.error(f"SIIP AI Error: {exc.message}")
    return JSONResponse(status_code=exc.status_code, content={"error": exc.message})


async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unexpected internal error")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Unexpected internal server error"},
    )
