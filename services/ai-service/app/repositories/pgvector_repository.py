from typing import Any

from app.core.config import settings
from app.core.logging import logger
from app.repositories.base import BaseRepository


class PGVectorRepository(BaseRepository):
    def __init__(self):
        self.conn = None
        self.psycopg2 = None
        try:
            import psycopg2
            import psycopg2.extras

            self.psycopg2 = psycopg2
        except ImportError:
            logger.warning(
                "[PGVectorRepository] psycopg2 library is not installed. To use PGVectorRepository, please install psycopg2-binary."
            )
            raise RuntimeError("psycopg2 library not available")

    def validate_connection(self) -> bool:
        """Validate if the database connection can be established."""
        if not self.psycopg2:
            return False
        try:
            conn = self.psycopg2.connect(
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                database=settings.DB_NAME,
                connect_timeout=3,
            )
            conn.close()
            return True
        except Exception as e:
            logger.warning(f"[PGVectorRepository] Connection validation failed: {e}")
            return False

    def _get_connection(self):
        if not self.psycopg2:
            raise RuntimeError("psycopg2 is not loaded")
        if self.conn is None or self.conn.closed != 0:
            self.conn = self.psycopg2.connect(
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                database=settings.DB_NAME,
            )
        return self.conn

    def save_challenge(
        self,
        challenge_id: str,
        title: str,
        description: str,
        embedding: list[float],
        metadata: dict[str, Any],
    ) -> None:
        if not self.psycopg2:
            raise RuntimeError("psycopg2 is not loaded")
        try:
            conn = self._get_connection()
            with conn.cursor() as cur:
                # Ensure pgvector extension and table exist
                cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS challenge_embeddings (
                        challenge_id VARCHAR(100) PRIMARY KEY,
                        title TEXT NOT NULL,
                        description TEXT NOT NULL,
                        embedding vector(384) NOT NULL,
                        metadata JSONB NOT NULL
                    );
                """)
                cur.execute(
                    """
                    INSERT INTO challenge_embeddings (challenge_id, title, description, embedding, metadata)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (challenge_id) DO UPDATE 
                    SET title = EXCLUDED.title, description = EXCLUDED.description, 
                        embedding = EXCLUDED.embedding, metadata = EXCLUDED.metadata;
                    """,
                    (
                        challenge_id,
                        title,
                        description,
                        embedding,
                        self.psycopg2.extras.Json(metadata),
                    ),
                )
            conn.commit()
            logger.info(
                f"[PGVectorRepository] Saved challenge {challenge_id} to database."
            )
        except Exception as e:
            logger.error(f"[PGVectorRepository] Failed to save challenge: {e}")
            raise RuntimeError(f"Database save failed: {e}")

    def get_challenge(self, challenge_id: str) -> dict[str, Any] | None:
        if not self.psycopg2:
            return None
        try:
            conn = self._get_connection()
            with conn.cursor(cursor_factory=self.psycopg2.extras.RealDictCursor) as cur:
                cur.execute(
                    "SELECT challenge_id as id, title, description, embedding, metadata FROM challenge_embeddings WHERE challenge_id = %s;",
                    (challenge_id,),
                )
                row = cur.fetchone()
                if row:
                    row_dict = dict(row)
                    if isinstance(row_dict["embedding"], str):
                        row_dict["embedding"] = [
                            float(x)
                            for x in row_dict["embedding"].strip("[]").split(",")
                        ]
                    meta = row_dict.pop("metadata")
                    if isinstance(meta, dict):
                        row_dict.update(meta)
                    return row_dict
            return None
        except Exception as e:
            logger.error(f"[PGVectorRepository] Failed to get challenge: {e}")
            return None

    def get_all_challenges(self) -> list[dict[str, Any]]:
        if not self.psycopg2:
            return []
        try:
            conn = self._get_connection()
            with conn.cursor(cursor_factory=self.psycopg2.extras.RealDictCursor) as cur:
                cur.execute(
                    "SELECT challenge_id as id, title, description, embedding, metadata FROM challenge_embeddings;"
                )
                rows = cur.fetchall()
                results = []
                for r in rows:
                    r_dict = dict(r)
                    if isinstance(r_dict["embedding"], str):
                        r_dict["embedding"] = [
                            float(x) for x in r_dict["embedding"].strip("[]").split(",")
                        ]
                    meta = r_dict.pop("metadata")
                    if isinstance(meta, dict):
                        r_dict.update(meta)
                    results.append(r_dict)
                return results
        except Exception as e:
            logger.error(f"[PGVectorRepository] Failed to list challenges: {e}")
            return []
