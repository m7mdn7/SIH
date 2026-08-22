import numpy as np
import pytest

from app.services.embedding_service import embedding_service


def test_embedding_dimensions():
    dim = embedding_service.get_dimension()
    assert dim == 384


def test_embedding_norm():
    vec = embedding_service.encode("Test challenge text representation.")
    norm = np.linalg.norm(vec)
    assert pytest.approx(norm, abs=1e-5) == 1.0
