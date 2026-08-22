import json
import os
import sys

# Validate dataset files
datasets_to_validate = [
    "data/training/train_dataset.json",
    "data/training/val_dataset.json",
    "data/evaluation/challenge_cases.json",
]

taxonomy_path = "app/data/domain_taxonomy.json"
if not os.path.exists(taxonomy_path):
    print(f"Error: Taxonomy file not found at {taxonomy_path}")
    sys.exit(1)

with open(taxonomy_path, "r", encoding="utf-8") as f:
    taxonomy = json.load(f)

canonical_domains = {d["name"] for d in taxonomy["domains"]}

print("==================================================")
print("Starting SIIP Dataset Validation Pipeline")
print("==================================================")

required_fields = {
    "id",
    "title",
    "description",
    "domain",
    "subdomain",
    "problemType",
    "severity",
    "expectedKeyFactors",
    "expectedMissingInformation",
    "quality",
}

all_ok = True
validation_report = {}

for ds in datasets_to_validate:
    print(f"Validating dataset: {ds}")
    if not os.path.exists(ds):
        print(f"Error: Dataset file not found at {ds}")
        all_ok = False
        continue

    with open(ds, "r", encoding="utf-8") as f:
        data = json.load(f)

    total_records = len(data)
    domain_coverage = {}
    missing_fields_count = 0
    invalid_domains_count = 0
    short_descriptions_count = 0

    for record in data:
        # Check fields
        missing_fields = required_fields - set(record.keys())
        if missing_fields:
            missing_fields_count += 1
            all_ok = False
            continue

        # Check domain
        dom = record["domain"]
        if dom not in canonical_domains:
            invalid_domains_count += 1
            all_ok = False

        domain_coverage[dom] = domain_coverage.get(dom, 0) + 1

        # Check description length
        desc = record["description"]
        if not desc or len(desc.strip()) < 10:
            short_descriptions_count += 1

    print(f"  Total records validated: {total_records}")
    print(f"  Missing fields records: {missing_fields_count}")
    print(f"  Invalid domain records: {invalid_domains_count}")
    print(f"  Short description (<10 chars) records: {short_descriptions_count}")
    print("  Domain coverage (number of examples per domain):")
    for d, c in sorted(domain_coverage.items()):
        print(f"    - {d}: {c}")

    validation_report[ds] = {
        "total_records": total_records,
        "missing_fields_count": missing_fields_count,
        "invalid_domains_count": invalid_domains_count,
        "short_descriptions_count": short_descriptions_count,
        "domain_coverage": domain_coverage,
    }
    print("-" * 50)

os.makedirs("reports", exist_ok=True)
with open("reports/dataset_validation.json", "w", encoding="utf-8") as f:
    json.dump(validation_report, f, indent=2)

if all_ok:
    print("SUCCESS: All datasets are fully compliant with SIIP schemas and taxonomy!")
else:
    print(
        "ERROR: Schema or taxonomy compliance errors found during dataset validation!"
    )
    sys.exit(1)
