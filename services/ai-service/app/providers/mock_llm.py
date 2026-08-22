import uuid

from app.core.logging import logger
from app.providers.base import BaseLLMProvider
from app.schemas.models import ChallengeAIAnalysis, InnovationGap


class MockLLMProvider(BaseLLMProvider):
    def analyze_challenge(
        self, challenge_id: str, title: str, description: str
    ) -> ChallengeAIAnalysis:
        logger.info(f"[MockLLM] Analyzing challenge: {title}")
        text = (title + " " + description).lower()

        # Determine Domain
        domain = "Urban Infrastructure"
        subdomain = "General Utilities"
        problem_type = "Infrastructure Maintenance"

        if any(
            w in text
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
            w in text
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
            ]
        ):
            domain = "Water Management"
            subdomain = "Drinking Water Security"
            problem_type = "Groundwater Contamination"
        elif any(
            w in text
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
            w in text
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
            w in text
            for w in [
                "pollution",
                "waste",
                "compost",
                "landfill",
                "air quality",
                "plastic",
                "recycling",
            ]
        ):
            domain = "Environment"
            subdomain = "Waste Management"
            problem_type = "Organic Waste Processing"
        elif any(
            w in text
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
            w in text
            for w in [
                "traffic",
                "road",
                "junction",
                "commute",
                "transit",
                "metro",
                "bus",
            ]
        ):
            domain = "Urban Infrastructure"
            subdomain = "Transportation Systems"
            problem_type = "Traffic Congestion"
        elif any(
            w in text
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
            w in text
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
            w in text
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
            w in text
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
        elif any(w in text for w in ["minor", "slow", "annoyance", "occasional"]):
            severity = "low"

        scale = "community"
        if any(w in text for w in ["mandi", "market", "village", "neighborhood"]):
            scale = "village"
        elif any(w in text for w in ["district", "city", "region"]):
            scale = "district"
        elif any(w in text for w in ["state", "country", "national"]):
            scale = "state"
        elif any(w in text for w in ["household", "family", "personal"]):
            scale = "individual"

        # Extract Key Factors
        key_factors = []
        if domain == "Agriculture":
            key_factors = [
                "Lack of passive cooling storage",
                "Extreme afternoon temperatures",
                "Unreliable grid power",
            ]
        elif domain == "Water Management":
            key_factors = [
                "Agricultural runoff in groundwater",
                "Absence of community water filtration",
                "Unregulated chemical usage",
            ]
        elif domain == "Urban Infrastructure":
            key_factors = [
                "Suboptimal signal timing configurations",
                "Boarding space bottlenecks",
                "Peak traffic flow concentration",
            ]
        else:
            key_factors = [
                "Lack of structural resource allocation",
                "Outdated service delivery processes",
                "Unoptimized local configurations",
            ]

        # Extract Missing Info
        missing_info = []
        if domain == "Agriculture":
            missing_info = [
                "Daily volume of surplus crop supply",
                "Current waste disposal expenses",
            ]
        elif domain == "Water Management":
            missing_info = [
                "Comprehensive hydrogeological survey maps",
                "Seasonal water table changes",
            ]
        else:
            missing_info = [
                "Exact beneficiary demographic numbers",
                "System feedback loops",
            ]

        # Formulate affected population
        affected_pop = (
            f"Approximately {scale} members suffering from {problem_type.lower()}"
        )
        if domain == "Agriculture":
            affected_pop = (
                "Approximately 150 local mandi vendors and 2,000 daily consumers"
            )
        elif domain == "Water Management":
            affected_pop = (
                "Around 400 rural households dependent on local groundwater tubewells"
            )

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
        text = description.lower()

        # Default gap outputs
        gap_type = "technology"
        desc = "Missing real-time monitoring and automation technology."
        rationale = "No existing systems are installed to collect live metrics or coordinate operations."
        action = "Deploy custom sensor instrumentation and integrate smart dashboards."
        expertise = ["Computer Science", "Data Science", "Electrical Engineering"]

        # Check domain or indicators to map gap types
        if any(
            w in text
            for w in [
                "research",
                "study",
                "scientific",
                "investigate",
                "undocumented",
                "unknown effect",
            ]
        ):
            gap_type = "research"
            desc = "Lack of foundational scientific research or material properties understanding."
            rationale = "The physical or biological variables are undocumented for this local geography."
            action = "Conduct primary laboratory assays and baseline academic studies."
            expertise = ["Environmental Science", "Social Sciences", "Agronomy"]
        elif any(
            w in text
            for w in [
                "tomato",
                "spoilage",
                "vegetable",
                "rot",
                "cooling",
                "storage",
                "adaptation",
                "low-cost",
                "context",
                "power grid",
            ]
        ):
            gap_type = "adaptation"
            desc = "Need for off-grid, low-cost evaporative cooling storage system."
            rationale = "Standard active refrigeration exists but is not viable due to grid unreliability; passive cooling designs must be adapted for local mandate."
            action = "Design and construct passive zero-energy evaporative cooling chambers utilizing clay and sand."
            expertise = [
                "Thermal Engineering",
                "Mechanical Engineering",
                "Agricultural Engineering",
            ]
        elif any(
            w in text
            for w in [
                "sensor",
                "device",
                "iot",
                "timer",
                "signal",
                "software",
                "automation",
            ]
        ):
            gap_type = "technology"
            desc = "Lack of smart automated control loop logic."
            rationale = (
                "Timers are static and need automated density-adaptive signal systems."
            )
            action = (
                "Implement computer vision cameras with density-aware control loops."
            )
            expertise = [
                "Computer Science",
                "Artificial Intelligence",
                "Electrical Engineering",
            ]
        elif any(
            w in text
            for w in ["data", "record", "test", "measure", "database", "stats", "map"]
        ):
            gap_type = "data"
            desc = "Missing baseline demographic, volume, or contamination data sets."
            rationale = "No historical logs or spatial database exists to model the distribution patterns."
            action = (
                "Setup a crowd-sourced monitoring network and publish open datasets."
            )
            expertise = ["Data Science", "Computer Science", "Social Sciences"]
        elif any(
            w in text
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
            desc = (
                "Absent localized technical training or multidisciplinary curriculum."
            )
            rationale = "Specialized skills in post-harvest engineering are unavailable in local institutions."
            action = "Organize university workshop accelerators and compile interactive training manuals."
            expertise = ["Education Technology", "Social Sciences"]

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
