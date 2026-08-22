from collections import Counter
from typing import Any

import numpy as np

from app.core.logging import logger
from app.repositories.local_repository import LocalRepository
from app.services.embedding_service import embedding_service


class ClusteringService:
    def __init__(self):
        self._repo = None

    @property
    def repo(self) -> LocalRepository:
        if self._repo is None:
            self._repo = LocalRepository()
        return self._repo

    def _dbscan_fit_predict(
        self, X: np.ndarray, eps: float, min_samples: int
    ) -> list[int]:
        """Pure-Python DBSCAN implementation using Cosine distance matrix."""
        n_samples = X.shape[0]
        # -2 represents unvisited/unclassified
        labels = [-2] * n_samples
        cluster_id = 0

        # Calculate cosine distance: 1 - cosine_similarity (dot product for normalized vectors)
        # Prevent numerical precision clipping errors
        dists = 1.0 - np.dot(X, X.T)
        dists = np.clip(dists, 0.0, 2.0)

        def get_neighbors(i):
            return [j for j in range(n_samples) if dists[i, j] <= eps]

        def expand_cluster(i, neighbors):
            labels[i] = cluster_id
            queue = list(neighbors)
            idx = 0
            while idx < len(queue):
                point = queue[idx]
                idx += 1
                if labels[point] == -2:  # Unvisited
                    labels[point] = cluster_id
                    pt_neighbors = get_neighbors(point)
                    if len(pt_neighbors) >= min_samples:
                        for n in pt_neighbors:
                            if n not in queue:
                                queue.append(n)
                elif labels[point] == -1:  # Noise upgraded to border point
                    labels[point] = cluster_id

        for i in range(n_samples):
            if labels[i] != -2:
                continue
            neighbors = get_neighbors(i)
            if len(neighbors) < min_samples:
                labels[i] = -1  # Noise
                continue
            # Expand cluster
            expand_cluster(i, neighbors)
            cluster_id += 1

        return [l if l != -2 else -1 for l in labels]

    def cluster_challenges(
        self, eps: float = 0.25, min_samples: int = 2
    ) -> dict[str, Any]:
        logger.info(
            f"Running custom DBSCAN clustering (eps={eps}, min_samples={min_samples})..."
        )

        challenges = self.repo.get_all_challenges()
        if not challenges:
            logger.warning("No challenges found to cluster.")
            return {"clusters": {}, "outliers": []}

        # 1. Fetch or compute embeddings
        embeddings_list = []
        valid_challenges = []

        for ch in challenges:
            ch_id = ch.get("id") or ch.get("challengeId")
            ch_title = ch.get("title", "")
            ch_desc = ch.get("description", "")
            ch_dom = ch.get("domain", "")

            emb = ch.get("embedding")
            if not emb:
                rep = embedding_service.get_challenge_text_representation(
                    ch_title, ch_desc, ch_dom
                )
                emb = embedding_service.encode(rep)
                # Cache it
                ch["embedding"] = emb
                self.repo.save_challenge(
                    ch_id,
                    ch_title,
                    ch_desc,
                    emb,
                    {
                        "domain": ch_dom,
                        "subdomain": ch.get("subdomain", ""),
                        "locationContext": ch.get("locationContext", ""),
                        "expectedSeverity": ch.get("expectedSeverity", ""),
                    },
                )

            embeddings_list.append(emb)
            valid_challenges.append(ch)

        X = np.array(embeddings_list)
        logger.info(f"Loaded feature matrix shape: {X.shape}")

        # 2. Run Custom DBSCAN
        labels = self._dbscan_fit_predict(X, eps=eps, min_samples=min_samples)

        clusters = {}
        outliers = []

        for idx, label in enumerate(labels):
            ch = valid_challenges[idx]
            ch_data = {
                "id": ch.get("id") or ch.get("challengeId"),
                "title": ch.get("title"),
                "domain": ch.get("domain"),
                "description": ch.get("description"),
            }
            if label == -1:
                outliers.append(ch_data)
            else:
                cluster_key = int(label)
                if cluster_key not in clusters:
                    clusters[cluster_key] = []
                clusters[cluster_key].append(ch_data)

        # 3. Formulate summaries
        summarized_clusters = {}
        for c_id, ch_list in clusters.items():
            domains = [ch["domain"] for ch in ch_list]
            domain_counts = Counter(domains)
            primary_domain = domain_counts.most_common(1)[0][0]

            # Simple keyword extraction from titles for topic label
            words = []
            for ch in ch_list:
                words.extend(ch["title"].lower().split())
            stop_words = {
                "and",
                "the",
                "of",
                "in",
                "at",
                "due",
                "to",
                "lack",
                "system",
                "a",
                "for",
                "with",
                "high",
                "low",
            }
            filtered_words = [w for w in words if w not in stop_words and len(w) > 3]
            word_counts = Counter(filtered_words)
            top_keywords = [w[0] for w in word_counts.most_common(3)]
            topic = (
                f"Issues relating to {', '.join(top_keywords)}"
                if top_keywords
                else "General group"
            )

            summarized_clusters[c_id] = {
                "topic": topic,
                "primaryDomain": primary_domain,
                "size": len(ch_list),
                "challenges": ch_list,
            }

        return {"clusters": summarized_clusters, "outliers": outliers}


clustering_service = ClusteringService()
