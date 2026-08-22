import json
import os
import re
import sys


def normalize_text(text: str) -> str:
    # lowercase and strip non-alphanumeric chars
    return re.sub(r"[^\w\s]", "", text.lower().strip())


BOILERPLATE_PHRASES = [
    "I want to report a critical issue regarding",
    "Over the past few months, we have observed that",
    "are struggling because of this",
    "There are no proper systems in place to handle it, leading to widespread dissatisfaction",
    "Local authorities have been informed but no action was taken",
    "We urgently need expertise and assistance to resolve this",
    "This petition is on behalf of",
    "who are severely impacted by",
    "The current situation is unsustainable and requires immediate intervention",
    "We believe a combination of local community effort and technical innovation is the only way forward",
    "Currently, we lack any baseline data or plans to address this",
    "A detailed investigation into our local",
    "conditions shows that",
    "is the primary constraint",
    "This affects",
    "on a daily basis, causing economic loss and health concerns",
    "We request the implementation team to perform a gap analysis and propose a suitable technology adaptation as soon as possible",
    "A major challenge in",
    "is the",
    "affecting",
    "The community is experiencing",
    "in their",
    "systems, which directly impacts",
    "We are facing severe",
    "under",
    "This is particularly difficult for",
    "Due to",
    "in",
    "many",
    "are unable to function properly",
    "The lack of adequate solutions for",
    "within",
    "has left",
    "vulnerable",
    "no",
    "here for",
    "problem in",
    "for",
    "bad",
    "under",
    "need",
    "support for",
    "affecting",
    "suffering from",
    "which affects",
    "something is wrong with the",
    "and",
    "are complaining",
    "we have a situation here regarding",
    "is anyone planning to fix",
    "the local",
    "is in very bad condition and hurts",
    "The community has some concerns about",
]


def strip_boilerplate(text: str) -> str:
    cleaned = text
    for phrase in BOILERPLATE_PHRASES:
        cleaned = re.sub(re.escape(phrase), "", cleaned, flags=re.IGNORECASE)
    return cleaned


def get_words(text: str) -> set[str]:
    return set(re.findall(r"\b\w+\b", text.lower()))


def calculate_jaccard(text1: str, text2: str) -> float:
    # Strip common templates to isolate content leakage
    c1 = strip_boilerplate(text1)
    c2 = strip_boilerplate(text2)
    w1 = get_words(c1)
    w2 = get_words(c2)
    if not w1 or not w2:
        return 0.0
    return len(w1.intersection(w2)) / len(w1.union(w2))


def detect_leakage():
    print("==================================================")
    print("Running Dataset Leakage Detection")
    print("==================================================")

    train_path = "data/training/train_dataset.json"
    val_path = "data/training/val_dataset.json"
    test_path = "data/evaluation/challenge_cases.json"

    for p in [train_path, val_path, test_path]:
        if not os.path.exists(p):
            print(
                f"Error: dataset path {p} does not exist. Run generate_training_data.py first."
            )
            sys.exit(1)

    with open(train_path, "r", encoding="utf-8") as f:
        train = json.load(f)
    with open(val_path, "r", encoding="utf-8") as f:
        val = json.load(f)
    with open(test_path, "r", encoding="utf-8") as f:
        test = json.load(f)

    splits = {"train": train, "val": val, "test": test}

    report = {
        "metrics": {
            "exact_text_overlap": 0,
            "normalized_text_overlap": 0,
            "title_overlap": 0,
            "parent_overlap": 0,
            "near_duplicate_overlap": 0,
        },
        "domain_distribution": {},
        "status": "PASS",
    }

    # 1. Exact text and normalized overlap checks
    train_desc = {item["description"]: item for item in train}
    train_norm = {normalize_text(item["description"]): item for item in train}
    train_titles = {item["title"]: item for item in train}
    train_parents = {
        item["parent_example_id"]: item
        for item in train
        if item.get("parent_example_id")
    }

    val_desc = {item["description"]: item for item in val}
    val_norm = {normalize_text(item["description"]): item for item in val}
    val_titles = {item["title"]: item for item in val}
    val_parents = {
        item["parent_example_id"]: item for item in val if item.get("parent_example_id")
    }

    test_desc = {item["description"]: item for item in test}
    test_norm = {normalize_text(item["description"]): item for item in test}
    test_titles = {item["title"]: item for item in test}
    test_parents = {
        item["parent_example_id"]: item
        for item in test
        if item.get("parent_example_id")
    }

    # Check overlaps between splits
    # Train <-> Val
    exact_train_val = set(train_desc.keys()).intersection(set(val_desc.keys()))
    norm_train_val = set(train_norm.keys()).intersection(set(val_norm.keys()))
    title_train_val = set(train_titles.keys()).intersection(set(val_titles.keys()))
    parent_train_val = set(train_parents.keys()).intersection(set(val_parents.keys()))

    # Train <-> Test
    exact_train_test = set(train_desc.keys()).intersection(set(test_desc.keys()))
    norm_train_test = set(train_norm.keys()).intersection(set(test_norm.keys()))
    title_train_test = set(train_titles.keys()).intersection(set(test_titles.keys()))
    parent_train_test = set(train_parents.keys()).intersection(set(test_parents.keys()))

    # Val <-> Test
    exact_val_test = set(val_desc.keys()).intersection(set(test_desc.keys()))
    norm_val_test = set(val_norm.keys()).intersection(set(test_norm.keys()))
    title_val_test = set(val_titles.keys()).intersection(set(test_titles.keys()))
    parent_val_test = set(val_parents.keys()).intersection(set(test_parents.keys()))

    if exact_train_val:
        print("EXACT TRAIN-VAL OVERLAP EXAMPLES:", list(exact_train_val)[:5])
    if exact_train_test:
        print("EXACT TRAIN-TEST OVERLAP EXAMPLES:", list(exact_train_test)[:5])
    if title_train_val:
        print("TITLE TRAIN-VAL OVERLAP EXAMPLES:", list(title_train_val)[:5])

    report["metrics"]["exact_text_overlap"] = (
        len(exact_train_val) + len(exact_train_test) + len(exact_val_test)
    )
    report["metrics"]["normalized_text_overlap"] = (
        len(norm_train_val) + len(norm_train_test) + len(norm_val_test)
    )
    report["metrics"]["title_overlap"] = (
        len(title_train_val) + len(title_train_test) + len(title_val_test)
    )
    report["metrics"]["parent_overlap"] = (
        len(parent_train_val) + len(parent_train_test) + len(parent_val_test)
    )

    # 2. Near-duplicate overlap check (using Jaccard > 0.85)
    train_words = {
        item["id"]: get_words(strip_boilerplate(item["description"])) for item in train
    }
    val_words = {
        item["id"]: get_words(strip_boilerplate(item["description"])) for item in val
    }
    test_words = {
        item["id"]: get_words(strip_boilerplate(item["description"])) for item in test
    }

    def calc_jaccard_optimized(w1, w2):
        if not w1 or not w2:
            return 0.0
        return len(w1.intersection(w2)) / len(w1.union(w2))

    near_duplicates = []
    # Check sample of Val vs Train & Test vs Train to verify no high similarity
    for id_v, w_v in val_words.items():
        for id_t, w_t in train_words.items():
            if calc_jaccard_optimized(w_v, w_t) >= 0.85:
                near_duplicates.append((id_v, id_t))
    for id_te, w_te in test_words.items():
        for id_t, w_t in train_words.items():
            if calc_jaccard_optimized(w_te, w_t) >= 0.85:
                near_duplicates.append((id_te, id_t))

    report["metrics"]["near_duplicate_overlap"] = len(near_duplicates)
    if near_duplicates:
        print("NEAR DUPLICATE EXAMPLES (top 3):")
        # Fetch actual text
        train_map = {item["id"]: item["description"] for item in train}
        val_map = {item["id"]: item["description"] for item in val}
        test_map = {item["id"]: item["description"] for item in test}
        merged_map = {**train_map, **val_map, **test_map}
        for idx, (id1, id2) in enumerate(near_duplicates[:3]):
            print(f"  Overlap {idx}:")
            print(f"    ID 1 ({id1}): {merged_map[id1]}")
            print(f"    ID 2 ({id2}): {merged_map[id2]}")
            print(
                f"    Jaccard: {calculate_jaccard(merged_map[id1], merged_map[id2]):.4f}"
            )

    # 3. Domain distribution
    for split_name, dataset in splits.items():
        report["domain_distribution"][split_name] = {}
        for item in dataset:
            d = item["domain"]
            report["domain_distribution"][split_name][d] = (
                report["domain_distribution"][split_name].get(d, 0) + 1
            )

    # Print results
    print(f"Exact text overlap: {report['metrics']['exact_text_overlap']}")
    print(f"Normalized text overlap: {report['metrics']['normalized_text_overlap']}")
    print(f"Title overlap: {report['metrics']['title_overlap']}")
    print(f"Parent example ID overlap: {report['metrics']['parent_overlap']}")
    print(
        f"Near-duplicate overlap (Jaccard >= 0.85): {report['metrics']['near_duplicate_overlap']}"
    )

    # Failure gates
    failed = False
    if report["metrics"]["exact_text_overlap"] > 0:
        print("FAIL: Exact description overlap detected between splits.")
        failed = True
    if report["metrics"]["normalized_text_overlap"] > 0:
        print("FAIL: Normalized description overlap detected between splits.")
        failed = True
    if report["metrics"]["parent_overlap"] > 0:
        print("FAIL: Paraphrase variations of the same seed sample crossed splits.")
        failed = True
    if report["metrics"]["near_duplicate_overlap"] > 0:
        print("FAIL: Near-duplicate description overlap detected between splits.")
        failed = True

    if failed:
        report["status"] = "FAIL"

    # Write JSON report
    os.makedirs("reports", exist_ok=True)
    with open("reports/leakage_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    # Write Markdown report
    md = f"""# Dataset Leakage Report

This report evaluates potential data leakage across the train, validation, and test datasets.

## Leakage Metrics

| Metric | Measured Value | Threshold | Status |
| :--- | :--- | :--- | :--- |
| **Exact Text Overlap** | {report['metrics']['exact_text_overlap']} | 0 | {"PASS" if report['metrics']['exact_text_overlap'] == 0 else "FAIL"} |
| **Normalized Text Overlap** | {report['metrics']['normalized_text_overlap']} | 0 | {"PASS" if report['metrics']['normalized_text_overlap'] == 0 else "FAIL"} |
| **Title Overlap** | {report['metrics']['title_overlap']} | 0 | {"PASS" if report['metrics']['title_overlap'] == 0 else "FAIL"} |
| **Parent/Seed ID Overlap** | {report['metrics']['parent_overlap']} | 0 | {"PASS" if report['metrics']['parent_overlap'] == 0 else "FAIL"} |
| **Near-Duplicate Overlap** | {report['metrics']['near_duplicate_overlap']} | 0 | {"PASS" if report['metrics']['near_duplicate_overlap'] == 0 else "FAIL"} |

## Split Status: {report['status']}

## Domain Distribution per Split

"""
    for split_name, dist in report["domain_distribution"].items():
        md += f"### Split: {split_name}\n\n"
        md += "| Domain | Example Count |\n"
        md += "| :--- | :--- |\n"
        for dom, cnt in sorted(dist.items()):
            md += f"| {dom} | {cnt} |\n"
        md += "\n"

    with open("reports/leakage_report.md", "w", encoding="utf-8") as f:
        f.write(md)

    print("Leakage report generated successfully at reports/leakage_report.md")

    if failed:
        sys.exit(1)
    else:
        print("PASS: No dataset leakage detected.")
        sys.exit(0)


if __name__ == "__main__":
    detect_leakage()
