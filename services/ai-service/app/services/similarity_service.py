import numpy as np

from app.core.config import settings
from app.core.logging import logger
from app.repositories.local_repository import LocalRepository
from app.schemas.models import SimilarityMatch
from app.services.embedding_service import embedding_service


class SimilarityService:
    def __init__(self):
        self._repo = None

    @property
    def repo(self) -> LocalRepository:
        if self._repo is None:
            self._repo = LocalRepository()
        return self._repo

    def get_cosine_similarity(self, v1: list[float], v2: list[float]) -> float:
        a = np.array(v1)
        b = np.array(v2)
        dot = np.dot(a, b)
        # Vectors are L2 normalized, so cosine similarity is the dot product
        return float(dot)

    def calculate_hybrid_score(
        self,
        sim: float,
        ch_domain: str | None,
        target_domain: str | None,
        ch_loc: str | None,
        target_loc: str | None,
    ) -> float:
        domain_boost = 0.0
        if (
            ch_domain
            and target_domain
            and ch_domain.strip().lower() == target_domain.strip().lower()
        ):
            domain_boost = 1.0

        context_boost = 0.0
        if ch_loc and target_loc:
            w1 = set(ch_loc.lower().split())
            w2 = set(target_loc.lower().split())
            overlap = w1.intersection(w2)
            overlap = {
                w for w in overlap if w not in {"in", "at", "the", "on", "of", "and"}
            }
            if len(overlap) > 0:
                context_boost = 1.0

        final_score = sim * 0.85 + domain_boost * 0.10 + context_boost * 0.05
        return final_score

    def find_similar(
        self,
        title: str | None,
        description: str,
        challenge_id: str | None = None,
        domain: str | None = None,
        limit: int = 10,
    ) -> list[SimilarityMatch]:
        query_title = title or ""
        logger.info(f"Finding similar challenges for '{query_title}' (limit={limit})")

        # 1. Compute embedding of the query challenge
        text_rep = embedding_service.get_challenge_text_representation(
            query_title, description, domain
        )
        target_vector = embedding_service.encode(text_rep)

        # 2. Retrieve all challenges from local repo
        all_challenges = self.repo.get_all_challenges()
        matches = []

        for ch in all_challenges:
            ch_id = ch.get("id") or ch.get("challengeId")

            # Skip comparing with self
            if challenge_id and ch_id == challenge_id:
                continue

            # Fetch or generate embedding for stored challenge
            ch_emb = ch.get("embedding")
            ch_title = ch.get("title", "")
            ch_desc = ch.get("description", "")
            ch_dom = ch.get("domain", "")
            ch_loc = ch.get("locationContext", "")

            if not ch_emb:
                rep = embedding_service.get_challenge_text_representation(
                    ch_title, ch_desc, ch_dom
                )
                ch_emb = embedding_service.encode(rep)
                # Lazy save embedding to separate cache (does NOT mutate seed challenges.json)
                self.repo.save_embedding(ch_id, ch_emb)

            sim = self.get_cosine_similarity(target_vector, ch_emb)

            # Calculate hybrid scoring
            domain_boost_val = (
                1.0
                if (
                    ch_dom
                    and domain
                    and ch_dom.strip().lower() == domain.strip().lower()
                )
                else 0.0
            )
            # Simple context matching on location
            context_boost_val = 0.0

            hybrid_score = self.calculate_hybrid_score(
                sim, ch_dom, domain, ch_loc, None
            )

            # Determine relationship category based on thresholds
            if hybrid_score >= settings.SIMILARITY_DUPLICATE_THRESHOLD:
                rel = "duplicate"
            elif hybrid_score >= settings.SIMILARITY_RELATED_THRESHOLD:
                rel = "related"
            else:
                rel = "weakly_related"

            # Retain explainability metadata
            explain_meta = {
                "semanticScore": round(sim, 4),
                "domainBoost": round(domain_boost_val * 0.10, 4),
                "contextBoost": round(context_boost_val * 0.05, 4),
                "finalScore": round(hybrid_score, 4),
            }

            matches.append(
                {
                    "challengeId": ch_id,
                    "score": round(hybrid_score, 4),
                    "relationship": rel,
                    "explainability": explain_meta,
                }
            )

        # Sort descending by score
        matches.sort(key=lambda x: x["score"], reverse=True)

        return [
            SimilarityMatch(
                challengeId=m["challengeId"],
                score=m["score"],
                relationship=m["relationship"],
                explainability=m["explainability"],
            )
            for m in matches[:limit]
        ]


similarity_service = SimilarityService()
