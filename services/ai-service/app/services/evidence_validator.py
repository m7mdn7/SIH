import re

from app.core.logging import logger
from app.schemas.models import ChallengeAIAnalysis


class EvidenceValidator:
    def _extract_all_numbers(self, text: str) -> list[str]:
        """Extract all digits from text."""
        return re.findall(r"\b\d+[\d,]*\b", text)

    def validate_analysis_against_input(
        self, title: str, description: str, analysis: ChallengeAIAnalysis
    ) -> ChallengeAIAnalysis:
        logger.info(
            f"[EvidenceValidator] Validating analysis for challengeId: {analysis.challengeId}"
        )
        input_text = (title + " " + description).lower()

        # 1. Check for unsupported numbers in affectedPopulation
        pop_numbers = self._extract_all_numbers(analysis.affectedPopulation)
        input_numbers = self._extract_all_numbers(input_text)

        unsupported_pop_number = False
        for num in pop_numbers:
            if num not in input_numbers:
                unsupported_pop_number = True
                break

        if unsupported_pop_number:
            logger.warning(
                f"[EvidenceValidator] Found unsupported numbers in affectedPopulation: {analysis.affectedPopulation}"
            )
            # Replace with conservative abstraction
            if analysis.domain.lower() == "agriculture":
                analysis.affectedPopulation = "Farmers and agricultural stakeholders"
            elif analysis.domain.lower() == "water management":
                analysis.affectedPopulation = (
                    "Local residents dependent on groundwater resources"
                )
            elif analysis.domain.lower() == "healthcare":
                analysis.affectedPopulation = (
                    "Patients and healthcare consumers in the area"
                )
            elif analysis.domain.lower() == "education":
                analysis.affectedPopulation = (
                    "Students, teachers, and educational stakeholders"
                )
            else:
                analysis.affectedPopulation = (
                    "Local community members and affected stakeholders"
                )

            if (
                "Exact count of affected stakeholders"
                not in analysis.missingInformation
            ):
                analysis.missingInformation.append(
                    "Exact count of affected stakeholders"
                )

        # 2. Check each key factor for unsupported environment / infrastructure claims
        validated_factors = []
        for factor in analysis.keyFactors:
            factor_lower = factor.lower()
            unsupported = False

            # Rule for electricity/grid power
            if any(
                w in factor_lower for w in ["grid", "electricity", "power", "utility"]
            ) and not any(
                w in input_text
                for w in ["grid", "electricity", "power", "utility", "generator"]
            ):
                logger.warning(
                    f"[EvidenceValidator] Removing unsupported key factor: {factor}"
                )
                unsupported = True
                if (
                    "Electricity availability and reliability"
                    not in analysis.missingInformation
                ):
                    analysis.missingInformation.append(
                        "Electricity availability and reliability"
                    )

            # Rule for temperature/weather/heat
            if any(
                w in factor_lower
                for w in ["temperature", "heat", "afternoon", "weather", "sun"]
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
                    f"[EvidenceValidator] Removing unsupported key factor: {factor}"
                )
                unsupported = True
                if (
                    "Local environmental and weather conditions"
                    not in analysis.missingInformation
                ):
                    analysis.missingInformation.append(
                        "Local environmental and weather conditions"
                    )

            # Rule for numbers in key factors
            factor_numbers = self._extract_all_numbers(factor)
            for num in factor_numbers:
                if num not in input_numbers:
                    logger.warning(
                        f"[EvidenceValidator] Removing key factor due to unsupported number '{num}': {factor}"
                    )
                    unsupported = True

            if not unsupported:
                validated_factors.append(factor)

        # Update keyFactors
        analysis.keyFactors = validated_factors

        # Ensure missingInformation has no duplicates and contains standard metrics if missing
        analysis.missingInformation = list(dict.fromkeys(analysis.missingInformation))

        return analysis


evidence_validator = EvidenceValidator()
