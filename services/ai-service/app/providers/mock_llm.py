import re
import uuid

from app.core.logging import logger
from app.providers.base import BaseLLMProvider
from app.schemas.models import ChallengeAIAnalysis, InnovationGap


class MockLLMProvider(BaseLLMProvider):
    def _contains_number(self, text: str) -> bool:
        """Helper to check if a string contains any numeric digits."""
        return bool(re.search(r"\d+", text))

    def _extract_numbers_and_phrases(self, text: str) -> list[str]:
        """Extract explicit numeric claims or count expressions from the text."""
        # Find matches like "150 local mandi vendors", "2,000 daily consumers"
        matches = re.findall(r"\b\d+[\s\w-]{1,30}\b", text)
        return matches

    def analyze_challenge(
        self, challenge_id: str, title: str, description: str
    ) -> ChallengeAIAnalysis:
        logger.info(f"[MockLLM] Analyzing challenge: {title}")
        combined_text = (title + " " + description).lower()

        # 1. Determine Domain deterministically
        domain = "Urban Infrastructure"
        subdomain = "General Utilities"
        problem_type = "Infrastructure Maintenance"

        if any(
            w in combined_text
            for w in [
                "tomato",
                "spoilage",
                "vegetable",
                "rot",
                "cooling",
                "storage",
                "harvest",
                "crop",
                "farm",
                "agri",
                "post-harvest",
            ]
        ):
            domain = "Agriculture"
            subdomain = "Post-Harvest Management"
            problem_type = "Food Spoilage and Storage"
        elif any(
            w in combined_text
            for w in [
                "water",
                "well",
                "nitrate",
                "contamination",
                "drinking",
                "filter",
                "pipeline",
                "drought",
                "rainwater",
                "fluoride",
            ]
        ):
            domain = "Water Management"
            subdomain = "Drinking Water Security"
            problem_type = "Groundwater Contamination"
        elif any(
            w in combined_text
            for w in [
                "health",
                "hospital",
                "clinic",
                "disease",
                "vaccine",
                "doctor",
                "medicine",
                "patient",
            ]
        ):
            domain = "Healthcare"
            subdomain = "Primary Care Access"
            problem_type = "Rural Healthcare Services"
        elif any(
            w in combined_text
            for w in [
                "school",
                "student",
                "teacher",
                "learning",
                "classroom",
                "education",
                "literacy",
            ]
        ):
            domain = "Education"
            subdomain = "Digital Education Services"
            problem_type = "Educational Inequality"
        elif any(
            w in combined_text
            for w in [
                "pollution",
                "waste",
                "compost",
                "landfill",
                "air quality",
                "plastic",
                "recycling",
                "e-waste",
            ]
        ):
            domain = "Environment"
            subdomain = "Waste Management"
            problem_type = "Organic Waste Processing"
        elif any(
            w in combined_text
            for w in [
                "energy",
                "power",
                "solar",
                "grid",
                "electricity",
                "turbine",
                "battery",
            ]
        ):
            domain = "Energy"
            subdomain = "Renewable Grid Power"
            problem_type = "Off-Grid Power Systems"
        elif any(
            w in combined_text
            for w in [
                "traffic",
                "road",
                "junction",
                "commute",
                "transit",
                "metro",
                "bus",
                "signal",
            ]
        ):
            domain = "Urban Infrastructure"
            subdomain = "Transportation Systems"
            problem_type = "Traffic Congestion"
        elif any(
            w in combined_text
            for w in [
                "accessible",
                "wheelchair",
                "blind",
                "deaf",
                "ramp",
                "disability",
                "assistive",
            ]
        ):
            domain = "Accessibility"
            subdomain = "Public Facility Access"
            problem_type = "Physical Barrier Mitigation"
        elif any(
            w in combined_text
            for w in [
                "government",
                "municipal",
                "welfare",
                "subsidy",
                "bureaucracy",
                "public service",
            ]
        ):
            domain = "Public Administration"
            subdomain = "Welfare Scheme Delivery"
            problem_type = "Digital Public Services"
        elif any(
            w in combined_text
            for w in [
                "handicraft",
                "artisan",
                "cooperative",
                "weaver",
                "cottage",
                "livelihood",
            ]
        ):
            domain = "Rural Livelihoods"
            subdomain = "Smallholder Economics"
            problem_type = "Microenterprise Enablement"

        # Determine Severity and Scale
        severity = "medium"
        if any(
            w in combined_text
            for w in [
                "severe",
                "extreme",
                "crisis",
                "dying",
                "contamination",
                "toxic",
                "loss",
                "critical",
            ]
        ):
            severity = "high"
        elif any(
            w in combined_text for w in ["minor", "slow", "annoyance", "occasional"]
        ):
            severity = "low"

        scale = "community"
        if any(
            w in combined_text for w in ["mandi", "market", "village", "neighborhood"]
        ):
            scale = "village"
        elif any(w in combined_text for w in ["district", "city", "region"]):
            scale = "district"
        elif any(w in combined_text for w in ["state", "country", "national"]):
            scale = "state"
        elif any(w in combined_text for w in ["household", "family", "personal"]):
            scale = "individual"

        # 2. Formulate affected population without inventing numbers unless explicitly supplied
        explicit_numbers = self._extract_numbers_and_phrases(
            description
        ) + self._extract_numbers_and_phrases(title)
        if explicit_numbers:
            affected_pop = (
                f"Affected population includes: {', '.join(explicit_numbers)}"
            )
        else:
            # Conservative abstraction based on domain
            if domain == "Agriculture":
                affected_pop = "Farmers and agricultural stakeholders"
            elif domain == "Water Management":
                affected_pop = "Local residents dependent on groundwater resources"
            elif domain == "Healthcare":
                affected_pop = "Patients and healthcare consumers in the area"
            elif domain == "Education":
                affected_pop = "Students, teachers, and educational stakeholders"
            elif domain == "Environment":
                affected_pop = "Community residents exposed to environmental factors"
            elif domain == "Energy":
                affected_pop = "Residents requiring power access"
            elif domain == "Urban Infrastructure":
                affected_pop = "Commuters and urban residents using transport routes"
            elif domain == "Accessibility":
                affected_pop = (
                    "Individuals with accessibility needs and public building users"
                )
            elif domain == "Public Administration":
                affected_pop = "Citizens and public service welfare beneficiaries"
            else:
                affected_pop = "Rural artisans and cooperative members"

        # 3. Dynamic Key Factors based strictly on matching keywords (evidence-grounded)
        key_factors = []
        missing_info = []

        # Default fallback missing information items
        missing_info.append("Exact count of affected stakeholders")
        missing_info.append("Historical baseline data metrics")

        if domain == "Agriculture":
            # Check cold storage/cooling
            if any(
                w in combined_text
                for w in ["storage", "cooling", "refrigeration", "cool"]
            ):
                key_factors.append("Lack of affordable cold storage")
            else:
                missing_info.append("Current storage alternatives")

            # Check spoilage/rot
            if any(w in combined_text for w in ["spoil", "rot", "waste", "lose"]):
                key_factors.append("Post-harvest crop spoilage")
            else:
                missing_info.append("Quantity of crop produce lost")

            # Check temperature/heat
            if any(
                w in combined_text
                for w in ["temperature", "heat", "afternoon", "weather", "sun"]
            ):
                key_factors.append("High local ambient temperatures")
            else:
                missing_info.append("Local environmental and climate conditions")

            # Check electricity/grid
            if any(
                w in combined_text for w in ["grid", "power", "electricity", "utility"]
            ):
                key_factors.append("Unreliable grid power")
            else:
                missing_info.append("Electricity availability and reliability")

        elif domain == "Water Management":
            if any(
                w in combined_text
                for w in ["runoff", "fertilizer", "chemical", "nitrate"]
            ):
                key_factors.append("Agricultural chemical runoff in groundwater")
            else:
                missing_info.append("Source and concentration of chemical contaminants")

            if any(
                w in combined_text for w in ["filtration", "filter", "clean", "purif"]
            ):
                key_factors.append("Absence of community water filtration")
            else:
                missing_info.append("Current community water purification status")

            if any(
                w in combined_text
                for w in ["well", "borewell", "tubewell", "extraction"]
            ):
                key_factors.append("Groundwater extraction and source dependency")
            else:
                missing_info.append("Borewell and groundwater extraction statistics")

        elif domain == "Urban Infrastructure":
            if any(w in combined_text for w in ["signal", "timer", "light"]):
                key_factors.append("Suboptimal traffic signal timing configurations")
            else:
                missing_info.append("Traffic signal timing configurations and data")

            if any(
                w in combined_text
                for w in ["junction", "exit", "subway", "station", "boarding"]
            ):
                key_factors.append("Boarding space and junction bottlenecks")
            else:
                missing_info.append("Junction capacity and boarding flow data")

            if any(w in combined_text for w in ["traffic", "gridlock", "congest"]):
                key_factors.append("Peak traffic flow concentration")
            else:
                missing_info.append("Peak traffic hours and vehicle volume metrics")

        else:
            # Generic domain fallback key factors
            key_factors.append("Lack of structural resource allocation")
            key_factors.append("Unoptimized local configurations")

        # If no key factors were triggered, provide a conservative fallback
        if not key_factors:
            key_factors.append(f"Lack of {domain.lower()} support systems")

        # Ensure missingInformation has no duplicates
        missing_info = list(dict.fromkeys(missing_info))

        return ChallengeAIAnalysis(
            id=f"an_{uuid.uuid4().hex[:8]}",
            challengeId=challenge_id,
            domain=domain,
            subdomain=subdomain,
            problemType=problem_type,
            severity=severity,
            affectedPopulation=affected_pop,
            scale=scale,
            keyFactors=key_factors,
            missingInformation=missing_info,
            confidence=0.89,
        )

    def analyze_gap(
        self,
        challenge_id: str,
        description: str,
        ai_analysis: ChallengeAIAnalysis | None = None,
    ) -> InnovationGap:
        logger.info(f"[MockLLM] Gap analysis for challenge ID: {challenge_id}")
        combined_text = description.lower()

        # Step 1: Sequential check of gap triggers
        if any(
            w in combined_text
            for w in [
                "research",
                "study",
                "scientific",
                "investigate",
                "undocumented",
                "unknown effect",
                "salinity",
            ]
        ):
            gap_type = "research"
            desc = "Lack of foundational scientific research or material properties understanding."
            rationale = "Based on the available information, the primary gap appears to be scientific uncertainty as the physical or biological variables are undocumented for this local context."
            action = "Conduct primary laboratory assays and baseline academic studies."
            expertise = ["Environmental Science", "Social Sciences", "Agronomy"]
        elif any(
            w in combined_text
            for w in [
                "data",
                "record",
                "test",
                "measure",
                "database",
                "stats",
                "map",
                "fluoride",
            ]
        ):
            gap_type = "data"
            desc = "Missing baseline demographic, volume, or contamination data sets."
            rationale = "Based on the available information, the primary gap appears to be insufficient data preventing decision-making or modeling distribution patterns."
            action = (
                "Setup a crowd-sourced monitoring network and publish open datasets."
            )
            expertise = ["Data Science", "Computer Science", "Social Sciences"]
        elif any(
            w in combined_text
            for w in [
                "expert",
                "skill",
                "training",
                "faculty",
                "bilingual",
                "education",
            ]
        ):
            gap_type = "expertise"
            desc = "Absent localized technical training or specialized knowledge."
            rationale = "Based on the available information, the primary gap appears to be the unavailability of specialized skills in local institutions."
            action = "Organize university workshop accelerators and compile training manuals."
            expertise = ["Education Technology", "Social Sciences"]
        elif any(
            w in combined_text
            for w in [
                "adaptation",
                "low-cost",
                "rural context",
                "affordable",
                "passive",
                "clay",
                "sand",
                "refrigeration",
                "cooling",
                "storage",
                "spoilage",
            ]
        ):
            gap_type = "adaptation"
            desc = "Need for off-grid, low-cost adaptation of existing systems."
            rationale = "Based on the available information, the primary gap appears to be suitability (affordability/infrastructure) as active refrigeration exists but is not viable under local constraints."
            action = "Design and construct passive zero-energy evaporative cooling chambers utilizing clay and sand."
            expertise = [
                "Thermal Engineering",
                "Mechanical Engineering",
                "Agricultural Engineering",
            ]
        elif any(
            w in combined_text
            for w in [
                "sensor",
                "device",
                "iot",
                "timer",
                "signal",
                "software",
                "automation",
                "computer vision",
            ]
        ):
            gap_type = "technology"
            desc = "Lack of smart automated control loop logic."
            rationale = "Based on the available information, the primary gap appears to be technology access since static control mechanisms require automated density-adaptive signal systems."
            action = (
                "Implement computer vision cameras with density-aware control loops."
            )
            expertise = [
                "Computer Science",
                "Artificial Intelligence",
                "Electrical Engineering",
            ]
        else:
            # Default fallback gap is technology
            gap_type = "technology"
            desc = "Missing real-time monitoring and automation technology."
            rationale = "Based on the available information, the primary gap appears to be technology availability since no systems are installed to collect live metrics or coordinate operations."
            action = (
                "Deploy custom sensor instrumentation and integrate smart dashboards."
            )
            expertise = ["Computer Science", "Data Science", "Electrical Engineering"]

        return InnovationGap(
            id=f"gap_{uuid.uuid4().hex[:8]}",
            challengeId=challenge_id,
            gapType=gap_type,
            description=desc,
            rationale=rationale,
            recommendedAction=action,
            requiredExpertise=expertise,
            confidence=0.87,
        )
