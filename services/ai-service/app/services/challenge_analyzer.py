import re

from app.core.config import settings
from app.core.logging import logger
from app.providers.mock_llm import MockLLMProvider
from app.providers.openai_provider import OpenAICompatibleProvider
from app.schemas.models import ChallengeAIAnalysis
from app.taxonomy.domains import DOMAIN_KEYWORDS


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

        from app.services.classification_service import classification_service

        res_class = classification_service.classify(title, description)

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

        # Overwrite with hybrid classification outputs
        analysis.domain = res_class["domain"]
        analysis.primaryDomain = res_class["primaryDomain"]
        analysis.secondaryDomains = res_class["secondaryDomains"]
        analysis.classificationStatus = res_class["classificationStatus"]
        analysis.confidence = res_class["confidence"]
        analysis.explainability = res_class["signals"]

        # If domain-specific subdomains or problemTypes exist, calibrate them
        if res_class["domain"] == "Other":
            analysis.subdomain = "Unknown"
            analysis.problemType = "Unclassified / Out of Scope"
            analysis.severity = "low"

        # Extend missing information
        for info in res_class["missingInformation"]:
            if info not in analysis.missingInformation:
                analysis.missingInformation.append(info)

        # Run Evidence Validation
        from app.services.evidence_validator import evidence_validator
        analysis = evidence_validator.validate_analysis_against_input(
            title, description, analysis
        )

        return analysis


challenge_analyzer = ChallengeAnalyzer()
