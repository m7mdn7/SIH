from app.core.config import settings
from app.core.logging import logger
from app.repositories.base import BaseRepository
from app.repositories.local_repository import LocalRepository
from app.repositories.pgvector_repository import PGVectorRepository


def get_repository() -> BaseRepository:
    provider = settings.REPOSITORY_PROVIDER.lower()
    if provider == "pgvector":
        try:
            repo = PGVectorRepository()
            if repo.validate_connection():
                logger.info(
                    "[RepositoryFactory] Using PGVectorRepository (successfully validated connection)."
                )
                return repo
            else:
                logger.warning(
                    "[RepositoryFactory] PGVector connection failed validation. Falling back to LocalRepository."
                )
        except Exception as e:
            logger.warning(
                f"[RepositoryFactory] Failed to initialize PGVectorRepository: {e}. Falling back to LocalRepository."
            )

    logger.info("[RepositoryFactory] Using LocalRepository.")
    return LocalRepository()
