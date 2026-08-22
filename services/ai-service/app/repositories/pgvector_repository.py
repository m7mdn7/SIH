from typing import Any

from app.core.logging import logger
from app.repositories.base import BaseRepository


class PGVectorRepository(BaseRepository):
    def __init__(self):
        logger.warning(
            "[PGVectorRepository] PostgreSQL driver stub initialized. Not connected to a live DB."
        )

    def save_challenge(
        self,
        challenge_id: str,
        title: str,
        description: str,
        embedding: list[float],
        metadata: dict[str, Any],
    ) -> None:
        logger.info(
            f"[PGVectorRepository] Stub save_challenge triggered for {challenge_id}."
        )
        # Real implementation would run INSERT INTO challenge_embeddings ...

    def get_challenge(self, challenge_id: str) -> dict[str, Any] | None:
        logger.info(
            f"[PGVectorRepository] Stub get_challenge triggered for {challenge_id}."
        )
        return None

    def get_all_challenges(self) -> list[dict[str, Any]]:
        logger.info("[PGVectorRepository] Stub get_all_challenges triggered.")
        return []
