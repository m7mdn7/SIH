import numpy as np

from app.core.config import settings
from app.core.logging import logger


class EmbeddingService:
    def __init__(self):
        self._model = None

    @property
    def model(self):
        if self._model is None:
            logger.info(
                f"Lazy loading sentence-transformers model: {settings.EMBEDDING_MODEL}"
            )
            try:
                from sentence_transformers import SentenceTransformer

                self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
                logger.info("SentenceTransformer model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load SentenceTransformer model: {e}")
                raise RuntimeError(f"Model load failed: {e}")
        return self._model

    def get_dimension(self) -> int:
        """Get the embedding vector dimension."""
        # For sentence-transformers/all-MiniLM-L6-v2 it is 384
        return 384

    def normalize_vector(self, vector: np.ndarray) -> np.ndarray:
        """Normalize a numpy vector to unit length (L2 norm)."""
        norm = np.linalg.norm(vector)
        if norm == 0:
            return vector
        return vector / norm

    def encode(self, text: str) -> list[float]:
        """Encode a single text into a normalized embedding vector."""
        logger.debug("Encoding single text.")
        embedding = self.model.encode(text, convert_to_numpy=True)
        normalized = self.normalize_vector(embedding)
        return normalized.tolist()

    def encode_batch(self, texts: list[str]) -> list[list[float]]:
        """Encode a list of texts into normalized embedding vectors."""
        logger.info(f"Encoding batch of {len(texts)} texts.")
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        normalized_embeddings = []
        for emb in embeddings:
            normalized_embeddings.append(self.normalize_vector(emb).tolist())
        return normalized_embeddings

    def get_challenge_text_representation(
        self, title: str, description: str, domain: str | None = None
    ) -> str:
        """Combine fields into standard representation for similarity comparison."""
        rep = f"Title: {title.strip()}\nDescription: {description.strip()}"
        if domain:
            rep += f"\nDomain: {domain.strip()}"
        return rep


embedding_service = EmbeddingService()
