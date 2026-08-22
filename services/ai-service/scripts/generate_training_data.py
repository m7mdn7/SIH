import hashlib
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
    "safety": ["safty", "saftey"],
}


def inject_typos(text: str) -> str:
    words = text.split()
    new_words = []
    for w in words:
        w_lower = w.lower()
        clean_w = re.sub(r"[^\w]", "", w_lower)
        if clean_w in TYPOS and random.random() < 0.4:
            typo_w = random.choice(TYPOS[clean_w])
            if w.istitle():
                typo_w = typo_w.title()
            new_words.append(typo_w)
        else:
            new_words.append(w)
    return " ".join(new_words)


# Templates
POOR_GRAMMAR_PREFIXES = [
    "i am writing because",
    "need help very urgent for",
    "please resolve the issue of",
    "facing too much problem in",
    "people suffering from",
    "in our area there is",
    "we do not have proper",
    "some problem is coming in",
]

CLEAN_TEMPLATES = [
    "A major challenge in {sub} is the {issue} affecting {stakeholders}.",
    "The community is experiencing {issue} in their {sub} systems, which directly impacts {stakeholders}.",
    "We are facing severe {issue} under {sub}. This is particularly difficult for {stakeholders}.",
    "Due to {issue} in {sub}, many {stakeholders} are unable to function properly.",
    "The lack of adequate solutions for {issue} within {sub} has left {stakeholders} vulnerable.",
]

SHORT_TEMPLATES = [
    "no {issue} in {sub} for {stakeholders}",
    "{issue} problem in {sub} for {stakeholders}",
    "bad {issue} under {sub} for {stakeholders}",
    "need {issue} support for {sub} affecting {stakeholders}",
    "suffering from {issue} in {sub} which affects {stakeholders}",
]

LONG_TEMPLATES = [
    "I want to report a critical issue regarding {issue} in our {sub} sector. Over the past few months, we have observed that {stakeholders} are struggling because of this. There are no proper systems in place to handle it, leading to widespread dissatisfaction. Local authorities have been informed but no action was taken. We urgently need expertise and assistance to resolve this.",
    "This petition is on behalf of {stakeholders} who are severely impacted by {issue} within {sub}. The current situation is unsustainable and requires immediate intervention. We believe a combination of local community effort and technical innovation is the only way forward. Currently, we lack any baseline data or plans to address this.",
    "A detailed investigation into our local {sub} conditions shows that {issue} is the primary constraint. This affects {stakeholders} on a daily basis, causing economic loss and health concerns. We request the implementation team to perform a gap analysis and propose a suitable technology adaptation as soon as possible.",
]

AMBIGUOUS_TEMPLATES = [
    "something is wrong with the {issue} in {sub} and {stakeholders} are complaining.",
    "we have a situation here regarding {issue} affecting {sub} for {stakeholders}.",
    "is anyone planning to fix {issue} in {sub} for {stakeholders}?",
    "the local {issue} under {sub} is in very bad condition and hurts {stakeholders}.",
]


def generate_pool_for_domain(domain_info):
    pool = []
    dom_name = domain_info["name"]
    subdomains = domain_info["subdomains"]
    concepts = domain_info["representative_concepts"]

    stakeholders_map = {
        "Agriculture": [
            "farmers",
            "crop growers",
            "agricultural workers",
            "mandi vendors",
        ],
        "Water Management": [
            "village residents",
            "local households",
            "community members",
            "school children",
        ],
        "Healthcare": [
            "patients",
            "rural citizens",
            "mothers and children",
            "elderly patients",
        ],
        "Education": [
            "students",
            "primary school kids",
            "local teachers",
            "blind students",
        ],
        "Sanitation": [
            "slum dwellers",
            "community members",
            "residents of the ward",
            "civic staff",
        ],
        "Environment": [
            "local community",
            "residents living near landfill",
            "citizens",
        ],
        "Energy": [
            "local households",
            "shopkeepers",
            "irrigation farmers",
            "health clinics",
        ],
        "Urban Infrastructure": [
            "commuters",
            "pedestrians",
            "residents of old buildings",
            "drivers",
        ],
        "Rural Livelihoods": [
            "artisans",
            "handloom weavers",
            "women self-help groups",
            "pottery makers",
        ],
        "Accessibility": [
            "wheelchair users",
            "blind students",
            "disabled individuals",
            "elderly citizens",
        ],
        "Public Administration": [
            "pensioners",
            "local citizens",
            "welfare beneficiaries",
            "applicants",
        ],
        "Transportation": [
            "commuters",
            "bus passengers",
            "daily travelers",
            "pedestrians",
        ],
        "Disaster Management": [
            "coastal villagers",
            "residents in hazard zone",
            "relief camp members",
        ],
        "Community Development": [
            "weekly market vendors",
            "children playing",
            "youth groups",
            "local readers",
        ],
        "Public Safety": [
            "women walking at night",
            "pedestrians",
            "neighborhood residents",
        ],
        "Other": [
            "gaming pc owners",
            "party organizers",
            "cryptocurrency buyers",
            "home cooks",
            "software engineers",
        ],
    }

    stakeholders = stakeholders_map.get(
        dom_name, ["citizens", "local people", "stakeholders"]
    )

    # Generate exactly 12 unique parent groups to partition systematically
    for group_idx in range(12):
        sub = subdomains[group_idx % len(subdomains)]
        concept = concepts[group_idx % len(concepts)]
        st = stakeholders[group_idx % len(stakeholders)]

        fingerprint = hashlib.md5(f"{sub}_{concept}_{st}".encode()).hexdigest()

        for case_type_idx in range(7):
            title = f"{sub} - {concept} issue affecting {st}"
            quality = "medium"
            gen_type = "clean"

            if case_type_idx == 0:
                description = random.choice(CLEAN_TEMPLATES).format(
                    sub=sub, issue=concept, stakeholders=st
                )
                quality = "high"
                gen_type = "clean"
            elif case_type_idx == 1:
                prefix = random.choice(POOR_GRAMMAR_PREFIXES)
                description = f"{prefix} {concept} in {sub} which is bad for {st}."
                description = description.replace("is bad", "are bad").replace(
                    "problem is", "problem are"
                )
                quality = "medium"
                gen_type = "poor_grammar"
            elif case_type_idx == 2:
                description = random.choice(SHORT_TEMPLATES).format(
                    sub=sub, issue=concept, stakeholders=st
                )
                quality = "low"
                gen_type = "short"
            elif case_type_idx == 3:
                description = random.choice(LONG_TEMPLATES).format(
                    sub=sub, issue=concept, stakeholders=st
                )
                quality = "high"
                gen_type = "long"
            elif case_type_idx == 4:
                description = random.choice(AMBIGUOUS_TEMPLATES).format(
                    sub=sub, issue=concept, stakeholders=st
                )
                quality = "medium"
                gen_type = "ambiguous"
            elif case_type_idx == 5:
                desc_raw = random.choice(CLEAN_TEMPLATES).format(
                    sub=sub, issue=concept, stakeholders=st
                )
                description = inject_typos(desc_raw)
                title = inject_typos(title)
                quality = "medium"
                gen_type = "typo"
            else:
                description = f"The community has some concerns about {concept} under {sub} affecting {st}."
                quality = "low"
                gen_type = "missing_info"

            expected_key_factors = [f"Issue related to {concept}", f"Affects {st}"]
            expected_missing_info = [
                "Exact quantitative impact",
                "Current storage/operational constraints",
            ]

            pool.append(
                {
                    "id": f"gen_{dom_name.lower().replace(' ', '_')}_{group_idx}_{case_type_idx}",
                    "title": title,
                    "description": description,
                    "domain": dom_name,
                    "subdomain": sub,
                    "problemType": f"General {dom_name} Issue",
                    "severity": random.choice(["low", "medium", "high"]),
                    "expectedKeyFactors": expected_key_factors,
                    "expectedMissingInformation": expected_missing_info,
                    "quality": quality,
                    "provenance": "synthetic_generator_v2",
                    "generation_type": gen_type,
                    "parent_example_id": fingerprint,
                }
            )

    return pool


# Run Pool Generation
pools_by_domain = {}
for dom in domains:
    pools_by_domain[dom["name"]] = generate_pool_for_domain(dom)

# Allocate splits ensuring no variations of the same parent_example_id cross splits!
train_data = []
val_data = []
test_data = []

for pool in pools_by_domain.values():
    # Group by parent_example_id
    grouped = {}
    for item in pool:
        pid = item["parent_example_id"]
        if pid not in grouped:
            grouped[pid] = []
        grouped[pid].append(item)

    pids = list(grouped.keys())
    random.shuffle(pids)

    # 8 groups to Train, 2 to Val, 2 to Test
    train_pids = pids[:8]
    val_pids = pids[8:10]
    test_pids = pids[10:12]

    for pid in train_pids:
        for item in grouped[pid]:
            item["split"] = "train"
            train_data.append(item)

    for pid in val_pids:
        for item in grouped[pid]:
            item["split"] = "val"
            val_data.append(item)

    for pid in test_pids:
        for item in grouped[pid]:
            item["split"] = "test"
            test_data.append(item)

# Add explicit multi-domain cases
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
        "expectedKeyFactors": [
            "Flooding impact",
            "Drinking water contamination",
            "Road damage",
        ],
        "expectedMissingInformation": [
            "Emergency response status",
            "Water filtration options",
        ],
        "quality": "high",
        "provenance": "synthetic_generator_v2",
        "generation_type": "multi_domain",
        "parent_example_id": "multidomain_0",
        "split": "train",
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
        "expectedKeyFactors": [
            "Drought crop failure",
            "Financial distress",
            "School dropout",
        ],
        "expectedMissingInformation": [
            "Alternative income sources",
            "School fees details",
        ],
        "quality": "high",
        "provenance": "synthetic_generator_v2",
        "generation_type": "multi_domain",
        "parent_example_id": "multidomain_1",
        "split": "val",
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
        "expectedKeyFactors": [
            "Streetlight malfunction",
            "Public safety risk",
            "Transit delay",
        ],
        "expectedMissingInformation": [
            "Streetlight owner details",
            "Police patrol frequency",
        ],
        "quality": "high",
        "provenance": "synthetic_generator_v2",
        "generation_type": "multi_domain",
        "parent_example_id": "multidomain_2",
        "split": "test",
    },
]

for item in multi_domain_examples:
    if item["split"] == "train":
        train_data.append(item)
    elif item["split"] == "val":
        val_data.append(item)
    elif item["split"] == "test":
        test_data.append(item)

# Save datasets
with open("data/training/train_dataset.json", "w", encoding="utf-8") as f:
    json.dump(train_data, f, indent=2, ensure_ascii=False)

with open("data/training/val_dataset.json", "w", encoding="utf-8") as f:
    json.dump(val_data, f, indent=2, ensure_ascii=False)

with open("data/evaluation/challenge_cases.json", "w", encoding="utf-8") as f:
    json.dump(test_data, f, indent=2, ensure_ascii=False)

print("Data Generation Successful!")
print(f"Total train examples: {len(train_data)}")
print(f"Total val examples: {len(val_data)}")
print(f"Total test examples: {len(test_data)}")
