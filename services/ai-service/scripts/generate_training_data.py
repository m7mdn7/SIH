import json
import os
import random
import re

random.seed(42)  # For reproducibility

# Ensure target directories exist
os.makedirs("data/raw", exist_ok=True)
os.makedirs("data/processed", exist_ok=True)
os.makedirs("data/training", exist_ok=True)
os.makedirs("data/evaluation", exist_ok=True)

# Load taxonomy
taxonomy_path = "app/data/domain_taxonomy.json"
with open(taxonomy_path, "r", encoding="utf-8") as f:
    taxonomy = json.load(f)

domains = taxonomy["domains"]

# Typo injection dictionary
TYPOS = {
    "farmer": ["farmar", "famer", "farmr"],
    "spoilage": ["spoild", "spoilige", "spoilagee"],
    "storage": ["storge", "storige", "storaage"],
    "water": ["watar", "wter", "wauter"],
    "school": ["skool", "schul", "shool"],
    "hospital": ["hospitall", "hosptal", "hospitl"],
    "electricity": ["electrisity", "elecricity", "electrity"],
    "contamination": ["contaminasion", "contamnation", "contamnation"],
    "village": ["vilage", "villige", "vllage"],
    "government": ["goverment", "govment", "govt"],
    "livelihood": ["livelyhood", "livlihood", "livelihod"],
    "accessible": ["accesible", "acessible", "accessable"],
    "refrigeration": ["refrigerasion", "refrigation", "refrigaration"],
    "treatment": ["treatement", "tretment"],
    "infrastructure": ["infrastruture", "infrastucture"],
    "pollution": ["polusion", "pollusion"],
    "disaster": ["disastor", "disasterr"],
    "safety": ["safty", "saftey"]
}

def inject_typos(text: str) -> str:
    words = text.split()
    new_words = []
    for w in words:
        w_lower = w.lower()
        # strip punctuation
        clean_w = re.sub(r'[^\w]', '', w_lower)
        if clean_w in TYPOS and random.random() < 0.4:
            typo_w = random.choice(TYPOS[clean_w])
            # keep capitalization pattern
            if w.istitle():
                typo_w = typo_w.title()
            new_words.append(typo_w)
        else:
            new_words.append(w)
    return " ".join(new_words)

# Grammatical issues
POOR_GRAMMAR_PREFIXES = [
    "i am writing because",
    "need help very urgent for",
    "please resolve the issue of",
    "facing too much problem in",
    "people suffering from",
    "in our area there is",
    "we do not have proper",
    "some problem is coming in"
]

# Clean structure templates
CLEAN_TEMPLATES = [
    "A major challenge in our area is the {issue} affecting {stakeholders}.",
    "The community is experiencing {issue}, which directly impacts {stakeholders}.",
    "We are facing severe {issue}. This is particularly difficult for {stakeholders}.",
    "Due to {issue}, many {stakeholders} are unable to function properly.",
    "The lack of adequate solutions for {issue} has left {stakeholders} vulnerable."
]

SHORT_TEMPLATES = [
    "no {issue} here",
    "{issue} problem",
    "bad {issue} for {stakeholders}",
    "need {issue} support",
    "suffering from {issue}"
]

LONG_TEMPLATES = [
    "I want to report a critical issue regarding {issue}. Over the past few months, we have observed that {stakeholders} are struggling because of this. There are no proper systems in place to handle it, leading to widespread dissatisfaction. Local authorities have been informed but no action was taken. We urgently need expertise and assistance to resolve this.",
    "This petition is on behalf of {stakeholders} who are severely impacted by {issue}. The current situation is unsustainable and requires immediate intervention. We believe a combination of local community effort and technical innovation is the only way forward. Currently, we lack any baseline data or plans to address this.",
    "A detailed investigation into our local conditions shows that {issue} is the primary constraint. This affects {stakeholders} on a daily basis, causing economic loss and health concerns. We request the implementation team to perform a gap analysis and propose a suitable technology adaptation as soon as possible."
]

AMBIGUOUS_TEMPLATES = [
    "something is wrong with the {issue} and {stakeholders} are complaining.",
    "we have a situation here regarding {issue}.",
    "is anyone planning to fix {issue} for {stakeholders}?",
    "the local {issue} is in very bad condition."
]

def generate_cases_for_domain(domain_info, count):
    generated = []
    dom_name = domain_info["name"]
    subdomains = domain_info["subdomains"]
    concepts = domain_info["representative_concepts"]
    example_phrases = domain_info["example_phrases"]
    synonyms = domain_info["synonyms"]
    
    # stakeholder terms based on domain
    stakeholders_map = {
        "Agriculture": ["farmers", "crop growers", "agricultural workers", "mandi vendors"],
        "Water Management": ["village residents", "local households", "community members", "school children"],
        "Healthcare": ["patients", "rural citizens", "mothers and children", "elderly patients"],
        "Education": ["students", "primary school kids", "local teachers", "blind students"],
        "Sanitation": ["slum dwellers", "community members", "residents of the ward", "civic staff"],
        "Environment": ["local community", "residents living near landfill", "citizens"],
        "Energy": ["local households", "shopkeepers", "irrigation farmers", "health clinics"],
        "Urban Infrastructure": ["commuters", "pedestrians", "residents of old buildings", "drivers"],
        "Rural Livelihoods": ["artisans", "handloom weavers", "women self-help groups", "pottery makers"],
        "Accessibility": ["wheelchair users", "blind students", "disabled individuals", "elderly citizens"],
        "Public Administration": ["pensioners", "local citizens", "welfare beneficiaries", "applicants"],
        "Transportation": ["commuters", "bus passengers", "daily travelers", "pedestrians"],
        "Disaster Management": ["coastal villagers", "residents in hazard zone", "relief camp members"],
        "Community Development": ["weekly market vendors", "children playing", "youth groups", "local readers"],
        "Public Safety": ["women walking at night", "pedestrians", "neighborhood residents"],
        "Other": ["gaming pc owners", "party organizers", "cryptocurrency buyers", "home cooks", "software engineers"]
    }
    
    stakeholders = stakeholders_map.get(dom_name, ["citizens", "local people", "stakeholders"])
    
    # We will generate different types of challenges
    for i in range(count):
        # Pick random components
        sub = random.choice(subdomains)
        concept = random.choice(concepts)
        st = random.choice(stakeholders)
        
        # Determine case type (0: clean, 1: poor grammar, 2: short, 3: long, 4: ambiguous, 5: typo, 6: missing info)
        case_type = i % 7
        
        title = f"{sub} issue affecting {st}"
        
        if case_type == 0:  # Clean
            description = random.choice(CLEAN_TEMPLATES).format(issue=concept, stakeholders=st)
            quality = "high"
        elif case_type == 1:  # Poor grammar
            prefix = random.choice(POOR_GRAMMAR_PREFIXES)
            description = f"{prefix} {concept} which is bad for {st}."
            # make grammar a bit broken
            description = description.replace("is bad", "are bad").replace("problem is", "problem are")
            quality = "medium"
        elif case_type == 2:  # Short
            description = random.choice(SHORT_TEMPLATES).format(issue=concept, stakeholders=st)
            quality = "low"
        elif case_type == 3:  # Long
            description = random.choice(LONG_TEMPLATES).format(issue=concept, stakeholders=st)
            quality = "high"
        elif case_type == 4:  # Ambiguous
            description = random.choice(AMBIGUOUS_TEMPLATES).format(issue=concept, stakeholders=st)
            quality = "medium"
        elif case_type == 5:  # Typo
            desc_raw = random.choice(CLEAN_TEMPLATES).format(issue=concept, stakeholders=st)
            description = inject_typos(desc_raw)
            title = inject_typos(title)
            quality = "medium"
        else:  # Missing info (very basic)
            description = f"The community has some concerns about {concept}."
            quality = "low"
            
        # Key factors / missing info expectations
        expected_key_factors = [f"Issue related to {concept}", f"Affects {st}"]
        expected_missing_info = ["Exact quantitative impact", "Current storage/operational constraints"]
        
        generated.append({
            "id": f"gen_{dom_name.lower().replace(' ', '_')}_{i}",
            "title": title,
            "description": description,
            "domain": dom_name,
            "subdomain": sub,
            "problemType": f"General {dom_name} Issue",
            "severity": random.choice(["low", "medium", "high"]),
            "expectedKeyFactors": expected_key_factors,
            "expectedMissingInformation": expected_missing_info,
            "quality": quality
        })
        
    return generated

# Programmatic data generation
all_training_data = []
all_evaluation_data = []

for dom in domains:
    # 52 examples per domain for training -> 52 * 16 = 832 examples (matches 800+ requirement)
    train_cases = generate_cases_for_domain(dom, 52)
    all_training_data.extend(train_cases)
    
    # 10 examples per domain for evaluation -> 10 * 16 = 160 examples (matches 150+ requirement)
    eval_cases = generate_cases_for_domain(dom, 10)
    all_evaluation_data.extend(eval_cases)

# Add some explicitly multi-domain cases to training & evaluation
multi_domain_examples = [
    {
        "id": "gen_multidomain_0",
        "title": "Flooding contaminates drinking water and roads",
        "description": "Severe flooding from storms has contaminated local borewells and drinking water resources while washing away roads in our block.",
        "domain": "Water Management",
        "secondaryDomains": ["Disaster Management", "Urban Infrastructure"],
        "subdomain": "Water Quality",
        "problemType": "Multi-domain environmental threat",
        "severity": "high",
        "expectedKeyFactors": ["Flooding impact", "Drinking water contamination", "Road damage"],
        "expectedMissingInformation": ["Emergency response status", "Water filtration options"],
        "quality": "high"
    },
    {
        "id": "gen_multidomain_1",
        "title": "Drought leads to crop failure and school dropout",
        "description": "Lack of rain has caused complete crop failure for farmers. Families are struggling financially, leading to kids dropping out of school to work.",
        "domain": "Agriculture",
        "secondaryDomains": ["Education", "Rural Livelihoods"],
        "subdomain": "Crop Production",
        "problemType": "Socio-agricultural crisis",
        "severity": "high",
        "expectedKeyFactors": ["Drought crop failure", "Financial distress", "School dropout"],
        "expectedMissingInformation": ["Alternative income sources", "School fees details"],
        "quality": "high"
    },
    {
        "id": "gen_multidomain_2",
        "title": "Unlit streets cause safety risks and transit delays",
        "description": "Streetlights are completely broken on transit corridors, making commutes unsafe for women and causing traffic slowdowns at night.",
        "domain": "Transportation",
        "secondaryDomains": ["Urban Infrastructure", "Public Safety"],
        "subdomain": "Commuter Safety",
        "problemType": "Infrastructure safety risk",
        "severity": "medium",
        "expectedKeyFactors": ["Streetlight malfunction", "Public safety risk", "Transit delay"],
        "expectedMissingInformation": ["Streetlight owner details", "Police patrol frequency"],
        "quality": "high"
    }
]

all_training_data.extend(multi_domain_examples)
# add to evaluation too
all_evaluation_data.extend(multi_domain_examples)

# Save datasets
with open("data/training/train_dataset.json", "w", encoding="utf-8") as f:
    json.dump(all_training_data, f, indent=2, ensure_ascii=False)

with open("data/evaluation/challenge_cases.json", "w", encoding="utf-8") as f:
    json.dump(all_evaluation_data, f, indent=2, ensure_ascii=False)

print(f"Data Generation Successful!")
print(f"Total training examples: {len(all_training_data)}")
print(f"Total evaluation examples: {len(all_evaluation_data)}")
