from typing import List, Optional
from rapidfuzz import process, fuzz
from app.taxonomy.expertise import EXPERTISE_TAGS, EXPERTISE_ALIASES

def normalize_expertise_tag(candidate: str) -> Optional[str]:
    """Fuzzy normalize an arbitrary expertise string to a controlled tag."""
    candidate_clean = candidate.strip().lower()
    if not candidate_clean:
        return None
        
    # 1. Exact match in controlled list
    for tag in EXPERTISE_TAGS:
        if tag.lower() == candidate_clean:
            return tag
            
    # 2. Exact match in aliases
    for alias, tag in EXPERTISE_ALIASES.items():
        if alias.lower() == candidate_clean:
            return tag
            
    # 3. Fuzzy match against aliases (score >= 85)
    alias_keys = list(EXPERTISE_ALIASES.keys())
    if alias_keys:
        match = process.extractOne(candidate_clean, alias_keys, scorer=fuzz.WRatio)
        if match and match[1] >= 85.0:
            matched_alias = match[0]
            return EXPERTISE_ALIASES[matched_alias]
        
    # 4. Fuzzy match against controlled tags (score >= 80)
    match_tag = process.extractOne(candidate_clean, EXPERTISE_TAGS, scorer=fuzz.WRatio)
    if match_tag and match_tag[1] >= 80.0:
        return match_tag[0]
        
    return None

def normalize_expertise_list(candidates: List[str]) -> List[str]:
    """Normalize a list of raw expertise candidate strings."""
    normalized = []
    for c in candidates:
        norm = normalize_expertise_tag(c)
        if norm and norm not in normalized:
            normalized.append(norm)
            
    # Fallback to Social Sciences if no tags could be normalized
    if not normalized:
        normalized = ["Social Sciences"]
    return normalized
