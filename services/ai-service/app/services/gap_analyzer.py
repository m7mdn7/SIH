from app.core.config import settings
from app.core.logging import logger
from app.providers.mock_llm import MockLLMProvider
from app.providers.openai_provider import OpenAICompatibleProvider
from app.schemas.models import ChallengeAIAnalysis, InnovationGap, SimilarityMatch
from app.taxonomy.gaps import GAPS
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
            text_clean = text_clean.replace(
                "No solution exists",
                "Based on the provided challenge context, no viable solution is currently implemented",
            )
            text_clean = text_clean.replace(
                "no solution exists",
                "based on the provided challenge context, no viable solution is currently implemented",
            )
        return text_clean

    def analyze_gap(
        self,
        challenge_id: str,
        description: str,
        ai_analysis: ChallengeAIAnalysis | None = None,
        similar_challenges: list[SimilarityMatch] | None = None,
        context: dict | None = None,
    ) -> InnovationGap:
        logger.info(f"Finding innovation gap for challenge {challenge_id}")

        provider_name = settings.LLM_PROVIDER.lower()
        gap = None

        if provider_name == "openai" and self.openai_provider.client:
            try:
                # In OpenAI, we can serialize the similarity context and pass it in prompt
                gap = self.openai_provider.analyze_gap(
                    challenge_id, description, ai_analysis
                )
            except Exception as e:
                logger.warning(
                    f"OpenAI gap analysis failed, falling back to mock provider. Error: {e}"
                )
                provider_name = "mock"

        if not gap:
            gap = self.mock_provider.analyze_gap(challenge_id, description, ai_analysis)

        # STEP 1 to 5: Refine Mock Gap output with similarity context and hybrid rules
        # Hybrid reasoning updates
        # If similar challenges are present, evaluate them
        repeated_pattern = False
        duplicate_challenge_ids = []
        if similar_challenges:
            for match in similar_challenges:
                if match.score >= 0.85:
                    repeated_pattern = True
                    duplicate_challenge_ids.append(match.challengeId)

        # Refine gapType and Rationale based on similar challenges and input constraints
        if repeated_pattern and gap.gapType == "technology":
            # If standard technology exists or there's a duplicate pattern elsewhere, it's likely an adaptation issue
            gap.gapType = "adaptation"
            gap.description = (
                "Need for local adaptation and deployment of existing models."
            )
            gap.rationale = f"Based on the available information, the primary gap appears to be adaptation since similar patterns were identified in other locations (e.g. {', '.join(duplicate_challenge_ids[:2])})."
            gap.recommendedAction = "Adapt and scale existing solution designs from similar cases to local environmental constraints."

        # Make sure rationale starts conservatively
        if not gap.rationale.strip().startswith("Based on the available information"):
            gap.rationale = (
                "Based on the available information, the primary gap appears to be "
                + gap.rationale
            )

        # STEP 6: recommendedAction matches the selected gap
        if gap.gapType == "research":
            gap.recommendedAction = "Conduct baseline scientific study and laboratory assays to evaluate the specific problem characteristics."
        elif gap.gapType == "technology":
            gap.recommendedAction = "Develop and implement smart automated technology solutions tailored to the system parameters."
        elif gap.gapType == "adaptation":
            if not gap.recommendedAction or "clay" not in gap.recommendedAction.lower():
                gap.recommendedAction = "Adapt existing technology models to fit local constraints (affordability, infrastructure, climate)."
        elif gap.gapType == "data":
            gap.recommendedAction = "Collect structured data metrics and build a baseline database to monitor and model the issue."
        elif gap.gapType == "expertise":
            gap.recommendedAction = "Design local training workshops and establish skill development programs for community members."

        # STEP 7: Expertise Normalization
        if ai_analysis and ai_analysis.domain:
            # Inject domain-specific expertise
            if (
                ai_analysis.domain == "Agriculture"
                and "Agricultural Engineering" not in gap.requiredExpertise
            ):
                gap.requiredExpertise.append("Agricultural Engineering")
            elif (
                ai_analysis.domain == "Water Management"
                and "Water Resources" not in gap.requiredExpertise
            ):
                gap.requiredExpertise.append("Water Resources")
            elif (
                ai_analysis.domain == "Urban Infrastructure"
                and "Transportation" not in gap.requiredExpertise
            ):
                gap.requiredExpertise.append("Transportation")

        # 1. Taxonomy validation of Gap Type
        if gap.gapType not in GAPS:
            logger.warning(
                f"Returned gapType '{gap.gapType}' is not in controlled taxonomy. Defaulting to 'technology'."
            )
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
