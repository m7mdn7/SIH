import json
import os
from typing import Any

from app.core.config import settings
from app.core.logging import logger
from app.repositories.base import BaseRepository


class LocalRepository(BaseRepository):
    def __init__(self):
        self.challenges_file = os.path.join(
            settings.DATA_DIR, "challenges", "sample_challenges.json"
        )
        self.data: dict[str, dict[str, Any]] = {}
        self._load_data()

    def _load_data(self):
        if os.path.exists(self.challenges_file):
            try:
                with open(self.challenges_file, "r", encoding="utf-8") as f:
                    content = json.load(f)
                    # Support both list and dictionary storage formats
                    challenges_list = (
                        content
                        if isinstance(content, list)
                        else content.get("challenges", [])
                    )
                    for ch in challenges_list:
                        # Index by id
                        ch_id = ch.get("id") or ch.get("challengeId")
                        if ch_id:
                            self.data[ch_id] = ch
                logger.info(
                    f"[LocalRepository] Loaded {len(self.data)} challenges from {self.challenges_file}"
                )
            except Exception as e:
                logger.error(f"[LocalRepository] Failed to parse challenges file: {e}")
        else:
            logger.warning(
                f"[LocalRepository] Challenges file not found at {self.challenges_file}. Initializing empty."
            )

    def _save_data(self):
        try:
            # Ensure folder exists
            os.makedirs(os.path.dirname(self.challenges_file), exist_ok=True)
            with open(self.challenges_file, "w", encoding="utf-8") as f:
                # Save as a list
                json.dump(list(self.data.values()), f, indent=2, ensure_ascii=False)
            logger.info(
                f"[LocalRepository] Saved {len(self.data)} challenges to {self.challenges_file}"
            )
        except Exception as e:
            logger.error(f"[LocalRepository] Failed to write challenges file: {e}")

    def save_challenge(
        self,
        challenge_id: str,
        title: str,
        description: str,
        embedding: list[float],
        metadata: dict[str, Any],
    ) -> None:
        self.data[challenge_id] = {
            "id": challenge_id,
            "title": title,
            "description": description,
            "embedding": embedding,
            **metadata,
        }
        self._save_data()

    def get_challenge(self, challenge_id: str) -> dict[str, Any] | None:
        return self.data.get(challenge_id)

    def get_all_challenges(self) -> list[dict[str, Any]]:
        return list(self.data.values())
