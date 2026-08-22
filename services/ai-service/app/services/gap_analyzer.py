from typing import Optional, List
from app.core.config import settings
from app.core.logging import logger
from app.schemas.models import ChallengeAIAnalysis, InnovationGap
from app.taxonomy.gaps import GAPS
from app.providers.mock_llm import MockLLMProvider
from app.providers.openai_provider import OpenAICompatibleProvider
from app.utils.normalization import normalize_expertise_list

class GapAnalyzer:
    def __init__(self):
        self.mock_provider = MockLLMProvider()
        self.openai_provider = OpenAICompatibleProvider()

    def get_calibrated_text(self, text: str) -> str:
        """Enforces that statements regarding solution existence are calibrated safely."""
        text_clean = text
        # If the LLM makes direct unverified statements like "No solution exists", calibrate it
        if "no solution exists" in text_clean.lower():
            text_clean = text_clean.replace("No solution exists", "Based on the provided challenge context, no viable solution is currently implemented")
            text_clean = text_clean.replace("no solution exists", "based on the provided challenge context, no viable solution is currently implemented")
        return text_clean

    def analyze_gap(
        self, 
        challenge_id: str, 
        description: str, 
        ai_analysis: Optional[ChallengeAIAnalysis] = None
    ) -> InnovationGap:
        logger.info(f"Finding innovation gap for challenge {challenge_id}")
        
        provider_name = settings.LLM_PROVIDER.lower()
        gap = None

        if provider_name == "openai" and self.openai_provider.client:
            try:
                gap = self.openai_provider.analyze_gap(challenge_id, description, ai_analysis)
            except Exception as e:
                logger.warning(f"OpenAI gap analysis failed, falling back to mock provider. Error: {e}")
                provider_name = "mock"

        if not gap:
            gap = self.mock_provider.analyze_gap(challenge_id, description, ai_analysis)

        # 1. Taxonomy validation of Gap Type
        if gap.gapType not in GAPS:
            logger.warning(f"Returned gapType '{gap.gapType}' is not in controlled taxonomy. Defaulting to 'technology'.")
            gap.gapType = "technology"

        # 2. Calibrate language to prevent safety violations
        gap.description = self.get_calibrated_text(gap.description)
        gap.rationale = self.get_calibrated_text(gap.rationale)
        gap.recommendedAction = self.get_calibrated_text(gap.recommendedAction)

        # 3. Normalize required expertise tags to controlled vocabulary
        gap.requiredExpertise = normalize_expertise_list(gap.requiredExpertise)

        # 4. Enforce confidence range bounds
        gap.confidence = max(0.0, min(1.0, gap.confidence))

        return gap

gap_analyzer = GapAnalyzer()
