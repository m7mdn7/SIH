import os
import json
from app.services.challenge_analyzer import challenge_analyzer
from app.core.config import settings

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    test_file = os.path.join(base_dir, "data", "evaluation", "analysis_test_cases.json")
    
    if not os.path.exists(test_file):
        print(f"Test cases file not found at {test_file}")
        return
        
    with open(test_file, 'r', encoding='utf-8') as f:
        cases = json.load(f)
        
    print("==================================================")
    print("Evaluating Challenge Classification Accuracy")
    print("==================================================")
    print(f"Dataset Size: {len(cases)} cases")
    print(f"Active Provider: {settings.LLM_PROVIDER}\n")
    
    correct_domain = 0
    correct_severity = 0
    
    for idx, case in enumerate(cases):
        title = case["title"]
        desc = case["description"]
        exp_dom = case["expectedDomain"]
        exp_sev = case["expectedSeverity"]
        
        result = challenge_analyzer.analyze(f"eval_{idx}", title, desc)
        
        domain_ok = result.domain.lower() == exp_dom.lower()
        severity_ok = result.severity.lower() == exp_sev.lower()
        
        if domain_ok:
            correct_domain += 1
        if severity_ok:
            correct_severity += 1
            
        print(f"Case #{idx+1}: '{title}'")
        print(f"  Domain  -> Expected: {exp_dom:<20} | Predicted: {result.domain:<20} | [{'PASS' if domain_ok else 'FAIL'}]")
        print(f"  Severity-> Expected: {exp_sev:<20} | Predicted: {result.severity:<20} | [{'PASS' if severity_ok else 'FAIL'}]")
        print("-" * 50)
        
    domain_acc = (correct_domain / len(cases)) * 100
    severity_acc = (correct_severity / len(cases)) * 100
    
    print("\nEvaluation Summary:")
    print(f"Domain Accuracy   : {domain_acc:.1f}% ({correct_domain}/{len(cases)} correct)")
    print(f"Severity Accuracy : {severity_acc:.1f}% ({correct_severity}/{len(cases)} correct)")

if __name__ == "__main__":
    main()
