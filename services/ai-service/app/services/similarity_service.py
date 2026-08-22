import numpy as np
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger
from app.repositories.local_repository import LocalRepository
from app.services.embedding_service import embedding_service
from app.schemas.models import SimilarityMatch

class SimilarityService:
    def __init__(self):
        self._repo = None

    @property
    def repo(self) -> LocalRepository:
        if self._repo is None:
            self._repo = LocalRepository()
        return self._repo

    def get_cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        a = np.array(v1)
        b = np.array(v2)
        dot = np.dot(a, b)
        # Vectors are L2 normalized, so cosine similarity is the dot product
        return float(dot)

    def calculate_hybrid_score(
        self, 
        sim: float, 
        ch_domain: Optional[str], 
        target_domain: Optional[str], 
        ch_loc: Optional[str], 
        target_loc: Optional[str]
    ) -> float:
        domain_boost = 0.0
        if ch_domain and target_domain and ch_domain.strip().lower() == target_domain.strip().lower():
            domain_boost = 1.0

        context_boost = 0.0
        if ch_loc and target_loc:
            w1 = set(ch_loc.lower().split())
            w2 = set(target_loc.lower().split())
            overlap = w1.intersection(w2)
            overlap = {w for w in overlap if w not in {"in", "at", "the", "on", "of", "and"}}
            if len(overlap) > 0:
                context_boost = 1.0

        final_score = sim * 0.85 + domain_boost * 0.10 + context_boost * 0.05
        return final_score

    def find_similar(
        self, 
        title: Optional[str], 
        description: str, 
        challenge_id: Optional[str] = None, 
        domain: Optional[str] = None, 
        limit: int = 10
    ) -> List[SimilarityMatch]:
        query_title = title or ""
        logger.info(f"Finding similar challenges for '{query_title}' (limit={limit})")
        
        # 1. Compute embedding of the query challenge
        text_rep = embedding_service.get_challenge_text_representation(query_title, description, domain)
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

            if not ch_emb:
                rep = embedding_service.get_challenge_text_representation(ch_title, ch_desc, ch_dom)
                ch_emb = embedding_service.encode(rep)
                # Cache it in database
                ch["embedding"] = ch_emb
                self.repo.save_challenge(ch_id, ch_title, ch_desc, ch_emb, {
                    "domain": ch_dom,
                    "subdomain": ch.get("subdomain", ""),
                    "locationContext": ch.get("locationContext", ""),
                    "expectedSeverity": ch.get("expectedSeverity", "")
                })

            sim = self.get_cosine_similarity(target_vector, ch_emb)
            
            # Calculate hybrid scoring
            ch_loc = ch.get("locationContext")
            hybrid_score = self.calculate_hybrid_score(sim, ch_dom, domain, ch_loc, None)
            
            # Determine relationship category based on thresholds
            if hybrid_score >= settings.SIMILARITY_DUPLICATE_THRESHOLD:
                rel = "duplicate"
            elif hybrid_score >= settings.SIMILARITY_RELATED_THRESHOLD:
                rel = "related"
            elif hybrid_score >= 0.60:
                rel = "weakly_related"
            else:
                continue # Skip unrelated

            matches.append({
                "challengeId": ch_id,
                "score": round(hybrid_score, 4),
                "relationship": rel
            })

        # Sort descending by score
        matches.sort(key=lambda x: x["score"], reverse=True)
        
        return [
            SimilarityMatch(
                challengeId=m["challengeId"],
                score=m["score"],
                relationship=m["relationship"]
            )
            for m in matches[:limit]
        ]

similarity_service = SimilarityService()
