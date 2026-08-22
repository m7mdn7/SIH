from abc import ABC, abstractmethod
from typing import Any


class BaseRepository(ABC):
    @abstractmethod
    def save_challenge(
        self,
        challenge_id: str,
        title: str,
        description: str,
        embedding: list[float],
        metadata: dict[str, Any],
    ) -> None:
        """Save challenge details along with its embedding vector."""

    @abstractmethod
    def get_challenge(self, challenge_id: str) -> dict[str, Any] | None:
        """Retrieve challenge details and its embedding."""

    @abstractmethod
    def get_all_challenges(self) -> list[dict[str, Any]]:
        """Retrieve list of all challenges containing their embeddings."""
