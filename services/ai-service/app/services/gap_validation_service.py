import re

from app.core.logging import logger
from app.schemas.models import InnovationGap
from app.services.evidence_service import evidence_service


class GapValidationService:
    def __init__(self):
        pass

    def sanitize_unsupported_claims(
        self, text: str, title: str, description: str
    ) -> str:
        """
        Sanitizes unsupported claims from generated text.
        For example: "Grid unreliability makes refrigeration impossible" -> if no grid/power is mentioned,
        replace with a safer calibrated claim.
        """
        input_text = (title + " " + description).lower()
        sanitized = text

        # Grid power check
        if any(
            w in sanitized.lower()
            for w in [
                "grid unreliability",
                "power fluctuation",
                "electricity failure",
                "grid failure",
            ]
        ) and not any(
            w in input_text
            for w in ["grid", "electricity", "power", "utility", "generator"]
        ):
            logger.warning(
                "[GapValidationService] Sanitizing unsupported grid power claim from gap analysis."
            )
            sanitized = re.sub(
                r"\b(due to|because of|with|under)\s+(unreliable\s+)?(grid\s+power|electricity|grid\s+unreliability|power\s+fluctuations|power\s+failures)\b",
                "under local resource constraints",
                sanitized,
                flags=re.IGNORECASE,
            )
            # Direct replacement fallback
            sanitized = sanitized.replace(
                "Grid unreliability makes refrigeration impossible",
                "Lack of cooling options makes post-harvest storage difficult",
            )
            sanitized = sanitized.replace(
                "grid unreliability makes refrigeration impossible",
                "lack of cooling options makes post-harvest storage difficult",
            )

        # Temperature/weather check
        if any(
            w in sanitized.lower()
            for w in ["high ambient temperature", "extreme heat", "weather conditions"]
        ) and not any(
            w in input_text
            for w in [
                "temperature",
                "heat",
                "afternoon",
                "weather",
                "sun",
                "hot",
                "climate",
            ]
        ):
            logger.warning(
                "[GapValidationService] Sanitizing unsupported temperature/weather claim from gap analysis."
            )
            sanitized = re.sub(
                r"\b(due to|because of|with|under)\s+(high\s+)?(ambient\s+)?(temperatures?|extreme\s+heat|weather\s+conditions)\b",
                "under local climate factors",
                sanitized,
                flags=re.IGNORECASE,
            )

        return sanitized

    def validate_and_enrich_gap(
        self, title: str, description: str, gap: InnovationGap, domain: str
    ) -> InnovationGap:
        """
        Enriches the gap analysis with evidence, hypotheses, and unknowns,
        and sanitizes unsupported claims.
        """
        # 1. Extract structured evidence
        extracted = evidence_service.extract_evidence(title, description, domain)

        # 2. Enrich gap analysis object
        gap.evidence = extracted["supported_facts"]
        gap.hypotheses = extracted["hypotheses"]
        gap.unknowns = extracted["unknowns"]

        # 3. Sanitize fields
        gap.description = self.sanitize_unsupported_claims(
            gap.description, title, description
        )
        gap.rationale = self.sanitize_unsupported_claims(
            gap.rationale, title, description
        )
        gap.recommendedAction = self.sanitize_unsupported_claims(
            gap.recommendedAction, title, description
        )

        return gap


gap_validation_service = GapValidationService()
