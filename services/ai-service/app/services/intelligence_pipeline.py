from app.core.logging import logger
from app.services.challenge_analyzer import challenge_analyzer
from app.services.evidence_validator import evidence_validator
from app.services.gap_analyzer import gap_analyzer
from app.services.matching_service import matching_service
from app.services.similarity_service import similarity_service


class IntelligencePipeline:
    async def process_challenge(
        self,
        challenge_id: str,
        title: str,
        description: str,
        context: dict | None = None,
    ) -> dict:
        logger.info(f"[IntelligencePipeline] Running E2E pipeline for: {title}")

        # 1. Challenge Analysis
        analysis = challenge_analyzer.analyze(challenge_id, title, description)

        # 2. Evidence Grounding Validation
        validated_analysis = evidence_validator.validate_analysis_against_input(
            title, description, analysis
        )

        # 3. Similarity Search (retrieves top 5 similar challenges)
        similar_challenges = similarity_service.find_similar(
            title=title,
            description=description,
            challenge_id=challenge_id,
            domain=validated_analysis.domain,
            limit=5,
        )

        # 4. Innovation Gap Analysis (passes similarity context)
        gap_analysis = gap_analyzer.analyze_gap(
            challenge_id=challenge_id,
            description=description,
            ai_analysis=validated_analysis,
            similar_challenges=similar_challenges,
            context=context,
        )

        # 5. University Matching
        loc = None
        if context and "locationContext" in context:
            loc = context["locationContext"]

        matches = matching_service.find_matches(
            domain=validated_analysis.domain,
            description=description,
            gap_analysis=gap_analysis,
            location_context=loc,
        )

        return {
            "analysis": validated_analysis,
            "similarChallenges": similar_challenges,
            "gapAnalysis": gap_analysis,
            "institutionMatches": matches,
        }


intelligence_pipeline = IntelligencePipeline()
