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
        self.cache_file = os.path.join(
            settings.DATA_DIR, "cache", "challenge_embeddings.json"
        )
        self.seed_data: dict[str, dict[str, Any]] = {}
        self.cache_data: dict[str, Any] = {"embeddings": {}, "new_challenges": {}}
        self._load_seed_data()
        self._load_cache()

    def _load_seed_data(self):
        if os.path.exists(self.challenges_file):
            try:
                with open(self.challenges_file, "r", encoding="utf-8") as f:
                    content = json.load(f)
                    challenges_list = (
                        content
                        if isinstance(content, list)
                        else content.get("challenges", [])
                    )
                    for ch in challenges_list:
                        ch_id = ch.get("id") or ch.get("challengeId")
                        if ch_id:
                            self.seed_data[ch_id] = ch
                logger.info(
                    f"[LocalRepository] Loaded {len(self.seed_data)} seed challenges from {self.challenges_file}"
                )
            except Exception as e:
                logger.error(
                    f"[LocalRepository] Failed to parse seed challenges file: {e}"
                )
        else:
            logger.warning(
                f"[LocalRepository] Seed challenges file not found at {self.challenges_file}."
            )

    def _load_cache(self):
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    content = json.load(f)
                    self.cache_data["embeddings"] = content.get("embeddings", {})
                    self.cache_data["new_challenges"] = content.get(
                        "new_challenges", {}
                    )
                logger.info(
                    f"[LocalRepository] Loaded cache containing {len(self.cache_data['embeddings'])} embeddings and {len(self.cache_data['new_challenges'])} custom challenges."
                )
            except Exception as e:
                logger.error(
                    f"[LocalRepository] Failed to parse cache file: {e}. Initializing empty cache."
                )
        else:
            logger.info(
                "[LocalRepository] No cache file found. Initializing empty cache."
            )

    def _save_cache(self):
        try:
            os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(self.cache_data, f, indent=2, ensure_ascii=False)
            logger.info(
                f"[LocalRepository] Cache saved. Total embeddings: {len(self.cache_data['embeddings'])}, New challenges: {len(self.cache_data['new_challenges'])}"
            )
        except Exception as e:
            logger.error(f"[LocalRepository] Failed to write cache file: {e}")

    def save_challenge(
        self,
        challenge_id: str,
        title: str,
        description: str,
        embedding: list[float],
        metadata: dict[str, Any],
    ) -> None:
        # Save newly created challenge to the runtime cache (NOT the seed file)
        self.cache_data["new_challenges"][challenge_id] = {
            "id": challenge_id,
            "title": title,
            "description": description,
            **metadata,
        }
        if embedding:
            self.cache_data["embeddings"][challenge_id] = embedding
        self._save_cache()

    def get_challenge(self, challenge_id: str) -> dict[str, Any] | None:
        # Check cache first
        if challenge_id in self.cache_data["new_challenges"]:
            ch = dict(self.cache_data["new_challenges"][challenge_id])
            ch["embedding"] = self.cache_data["embeddings"].get(challenge_id)
            return ch
        # Check seed data
        if challenge_id in self.seed_data:
            ch = dict(self.seed_data[challenge_id])
            ch["embedding"] = self.cache_data["embeddings"].get(challenge_id)
            return ch
        return None

    def get_all_challenges(self) -> list[dict[str, Any]]:
        # Return merged view of seed challenges and custom cache challenges
        merged = []
        for ch_id, ch in self.seed_data.items():
            ch_copy = dict(ch)
            ch_copy["embedding"] = self.cache_data["embeddings"].get(ch_id)
            merged.append(ch_copy)
        for ch_id, ch in self.cache_data["new_challenges"].items():
            ch_copy = dict(ch)
            ch_copy["embedding"] = self.cache_data["embeddings"].get(ch_id)
            merged.append(ch_copy)
        return merged

    def save_embedding(self, challenge_id: str, embedding: list[float]) -> None:
        # Lazy save runtime generated embedding of existing/seed challenge
        self.cache_data["embeddings"][challenge_id] = embedding
        self._save_cache()
