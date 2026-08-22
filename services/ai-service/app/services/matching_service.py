import json
import os
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger
from app.schemas.models import UniversityMatch, InnovationGap

class MatchingService:
    def __init__(self):
        self.universities_file = os.path.join(settings.DATA_DIR, "universities", "sample_universities.json")
        self.universities = []
        self._load_universities()

    def _load_universities(self):
        if os.path.exists(self.universities_file):
            try:
                with open(self.universities_file, 'r', encoding='utf-8') as f:
                    self.universities = json.load(f)
                logger.info(f"[MatchingService] Loaded {len(self.universities)} university profiles.")
            except Exception as e:
                logger.error(f"[MatchingService] Failed to load universities dataset: {e}")
        else:
            logger.warning(f"[MatchingService] Universities dataset not found at {self.universities_file}")

    def find_matches(
        self, 
        domain: str, 
        description: str, 
        gap_analysis: Optional[InnovationGap] = None
    ) -> List[UniversityMatch]:
        logger.info(f"Matching universities for domain: {domain}")
        
        required_expertise = gap_analysis.requiredExpertise if gap_analysis else []
        matches = []

        for uni in self.universities:
            reasons = []
            
            # 1. Domain Match (30%)
            domain_score = 0.0
            uni_domains = [d.lower() for d in uni.get("domains", [])]
            if domain.lower() in uni_domains:
                domain_score = 100.0
                reasons.append(f"Strong match for the {domain} domain")
            
            # 2. Expertise Match (25%)
            expertise_score = 0.0
            uni_expertise = [e.lower() for e in uni.get("expertise", [])]
            matched_exp = []
            if required_expertise:
                for req in required_expertise:
                    if req.lower() in uni_expertise:
                        matched_exp.append(req)
                if len(required_expertise) > 0:
                    expertise_score = (len(matched_exp) / len(required_expertise)) * 100.0
                if matched_exp:
                    reasons.append(f"Expertise in: {', '.join(matched_exp)}")

            # 3. Department Availability (15%)
            dept_score = 0.0
            uni_depts = [d.lower() for d in uni.get("departments", [])]
            # Simple keyword match
            keywords = domain.lower().split()
            matched_depts = []
            for dept in uni_depts:
                if any(kw in dept for kw in keywords):
                    dept_score = 100.0
                    matched_depts.append(dept.title())
            if matched_depts:
                reasons.append(f"Departments present: {', '.join(matched_depts)}")

            # 4. Previous Relevant Projects (15%)
            project_score = 0.0
            uni_projects = [p.lower() for p in uni.get("previousProjects", [])]
            desc_words = set(description.lower().split())
            desc_words = {w for w in desc_words if len(w) > 4}
            matched_projects = []
            for proj in uni_projects:
                proj_words = set(proj.split())
                overlap = proj_words.intersection(desc_words)
                if overlap:
                    project_score = 100.0
                    matched_projects.append(proj.title())
            if matched_projects:
                reasons.append(f"Relevant past work: {', '.join(matched_projects[:2])}")

            # 5. Infrastructure Capability (10%)
            infra_score = 0.0
            uni_infra = [i.lower() for i in uni.get("infrastructure", [])]
            matched_infra = []
            # Check domain related infra words
            infra_keywords = []
            if domain.lower() == "agriculture":
                infra_keywords = ["cooling", "storage", "lab", "farm"]
            elif domain.lower() == "water management":
                infra_keywords = ["testing", "filtration", "water"]
            elif domain.lower() == "urban infrastructure":
                infra_keywords = ["signal", "sensor", "traffic"]

            for infra in uni_infra:
                if any(ik in infra for ik in infra_keywords):
                    infra_score = 100.0
                    matched_infra.append(infra.title())
            if matched_infra:
                reasons.append(f"Specialized facilities: {', '.join(matched_infra[:2])}")

            # 6. Location / Context Match (5%)
            location_score = 50.0  # Default moderate location score
            
            # Compute final weighted score
            final_score = (
                domain_score * 0.30 +
                expertise_score * 0.25 +
                dept_score * 0.15 +
                project_score * 0.15 +
                infra_score * 0.10 +
                location_score * 0.05
            )

            if final_score > 0:
                matches.append(UniversityMatch(
                    universityId=uni.get("id"),
                    name=uni.get("name"),
                    matchScore=round(final_score, 1),
                    reasons=reasons
                ))

        # Sort matches in descending order of matchScore
        matches.sort(key=lambda x: x.matchScore, reverse=True)
        return matches

matching_service = MatchingService()
