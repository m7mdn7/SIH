import re

from app.core.config import settings
from app.core.logging import logger
from app.providers.mock_llm import MockLLMProvider
from app.providers.openai_provider import OpenAICompatibleProvider
from app.schemas.models import ChallengeAIAnalysis
from app.taxonomy.domains import DOMAIN_KEYWORDS, DOMAINS


class ChallengeAnalyzer:
    def __init__(self):
        # Instantiate LLM providers based on config
        self.mock_provider = MockLLMProvider()
        self.openai_provider = OpenAICompatibleProvider()

    def preprocess_text(self, text: str) -> str:
        """Standardize text by lowercasing and stripping punctuation."""
        text = text.lower()
        text = re.sub(r"[^\w\s]", "", text)
        return text.strip()

    def get_deterministic_domain(self, title: str, description: str) -> str | None:
        """Classify domain deterministically based on keyword indicators."""
        combined_text = self.preprocess_text(title + " " + description)

        best_domain = None
        max_matches = 0

        for domain, keywords in DOMAIN_KEYWORDS.items():
            matches = sum(
                1 for keyword in keywords if f" {keyword} " in f" {combined_text} "
            )
            if matches > max_matches:
                max_matches = matches
                best_domain = domain

        return best_domain

    def analyze(
        self, challenge_id: str, title: str, description: str
    ) -> ChallengeAIAnalysis:
        logger.info(f"Analyzing challenge {challenge_id} title: '{title}'")

        # Determine provider
        provider_name = settings.LLM_PROVIDER.lower()
        analysis = None

        if provider_name == "openai" and self.openai_provider.client:
            try:
                analysis = self.openai_provider.analyze_challenge(
                    challenge_id, title, description
                )
            except Exception as e:
                logger.warning(
                    f"OpenAI analysis failed, falling back to mock provider. Error: {e}"
                )
                provider_name = "mock"

        if not analysis:
            # Run mock provider
            analysis = self.mock_provider.analyze_challenge(
                challenge_id, title, description
            )

        # Taxonomy Validation
        if analysis.domain not in DOMAINS:
            logger.warning(
                f"Classified domain '{analysis.domain}' is not in controlled taxonomy. Running fallback."
            )
            deterministic_domain = self.get_deterministic_domain(title, description)
            analysis.domain = deterministic_domain or "Urban Infrastructure"
            analysis.subdomain = "General Utilities"
            analysis.problemType = "General Infrastructure Issue"

        # Refine missing information to not include fake facts
        # Verify confidence score is within 0.0 - 1.0 bounds
        analysis.confidence = max(0.0, min(1.0, analysis.confidence))

        # Calculate a final boost to confidence if we also matched deterministic keyword signals
        deterministic_domain = self.get_deterministic_domain(title, description)
        if deterministic_domain == analysis.domain:
            analysis.confidence = min(1.0, analysis.confidence + 0.05)

        return analysis


challenge_analyzer = ChallengeAnalyzer()
