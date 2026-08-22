import os
import json
from app.services.gap_analyzer import gap_analyzer
from app.core.config import settings

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    test_file = os.path.join(base_dir, "data", "evaluation", "gap_test_cases.json")
    
    if not os.path.exists(test_file):
        print(f"Test cases file not found at {test_file}")
        return
        
    with open(test_file, 'r', encoding='utf-8') as f:
        cases = json.load(f)
        
    print("==================================================")
    print("Evaluating Innovation Gap Finder Accuracy")
    print("==================================================")
    print(f"Dataset Size: {len(cases)} cases")
    print(f"Active Provider: {settings.LLM_PROVIDER}\n")

    correct = 0

    for idx, case in enumerate(cases):
        desc = case["description"]
        exp_gap = case["expectedGap"]

        result = gap_analyzer.analyze_gap(f"eval_gap_{idx}", desc)
        
        is_ok = result.gapType.lower() == exp_gap.lower()
        if is_ok:
            correct += 1

        print(f"Case #{idx+1}:")
        print(f"  Description: '{desc[:60]}...'")
        print(f"  Gap Type -> Expected: {exp_gap:<15} | Predicted: {result.gapType:<15} | [{'PASS' if is_ok else 'FAIL'}]")
        print(f"  Expertise: {result.requiredExpertise}")
        print("-" * 50)

    accuracy = (correct / len(cases)) * 100
    print("\nGap Analysis Evaluation Summary:")
    print(f"Accuracy: {accuracy:.1f}% ({correct}/{len(cases)} correct)")

if __name__ == "__main__":
    main()
