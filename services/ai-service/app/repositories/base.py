from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any

class BaseRepository(ABC):
    @abstractmethod
    def save_challenge(self, challenge_id: str, title: str, description: str, embedding: List[float], metadata: Dict[str, Any]) -> None:
        """Save challenge details along with its embedding vector."""
        pass
        
    @abstractmethod
    def get_challenge(self, challenge_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve challenge details and its embedding."""
        pass
        
    @abstractmethod
    def get_all_challenges(self) -> List[Dict[str, Any]]:
        """Retrieve list of all challenges containing their embeddings."""
        pass
