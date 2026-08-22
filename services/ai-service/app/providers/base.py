from abc import ABC, abstractmethod
from typing import Optional
from app.schemas.models import ChallengeAIAnalysis, InnovationGap

class BaseLLMProvider(ABC):
    @abstractmethod
    def analyze_challenge(self, challenge_id: str, title: str, description: str) -> ChallengeAIAnalysis:
        """Analyze a raw societal challenge to extract domain, problem type, factors, etc."""
        pass
        
    @abstractmethod
    def analyze_gap(self, challenge_id: str, description: str, ai_analysis: Optional[ChallengeAIAnalysis] = None) -> InnovationGap:
        """Identify the primary innovation gap type, rationale, action steps, and required expertise."""
        pass
