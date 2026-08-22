import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.clustering_service import clustering_service


def main():
    print("==================================================")
    print("Starting SIIP Challenge Clustering Analysis")
    print("==================================================")

    # Use cosine distance eps=0.25 (which corresponds to 0.75 similarity threshold)
    # min_samples=2 to form a cluster
    results = clustering_service.cluster_challenges(eps=0.25, min_samples=2)

    clusters = results["clusters"]
    outliers = results["outliers"]

    print(f"\nDiscovered {len(clusters)} distinct clusters.")
    print(
        f"Discovered {len(outliers)} outliers (challenges not belonging to any cluster).\n"
    )

    for c_id, summary in clusters.items():
        print(f"Cluster {c_id}:")
        print(f"  Topic: {summary['topic']}")
        print(f"  Primary Domain: {summary['primaryDomain']}")
        print(f"  Challenges count: {summary['size']}")
        print("  Sample Challenges:")
        for ch in summary["challenges"][:3]:
            print(f"    - [{ch['id']}] {ch['title']}")
        print("-" * 40)

    if outliers:
        print("\nSample Outliers (Noise Points):")
        for ch in outliers[:5]:
            print(f"  - [{ch['id']}] {ch['title']} (Domain: {ch['domain']})")


if __name__ == "__main__":
    main()
