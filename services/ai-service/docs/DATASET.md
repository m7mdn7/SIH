# SIIP Datasets

This document details the synthetic seed datasets bundled with the AI/ML prototype service.

## 1. Challenges Dataset (`data/challenges/sample_challenges.json`)
The challenges dataset contains **100 synthetic but realistic** societal challenges generated dynamically using block templates.

- **Distribution**: 10 challenges per domain across 10 controlled domains (Agriculture, Water Management, Healthcare, Education, Environment, Energy, Urban Infrastructure, Accessibility, Public Administration, Rural Livelihoods).
- **Format**: List of objects containing `id`, `title`, `description`, `domain`, `subdomain`, `locationContext`, and `expectedSeverity`.
- **Duplicate/Related Groups**:
  - `ch_tomato_spoilage`, `ch_vegetable_rot`, and `ch_tomato_trans_damage` represent semantic duplicates/variations for testing similarity thresholds.
  - `ch_well_nitrate_1` and `ch_well_nitrate_2` represent water contamination duplicates.
  - `ch_traffic_signal_1` and `ch_traffic_signal_2` represent traffic congestion duplicates.

---

## 2. Universities Dataset (`data/universities/sample_universities.json`)
Contains **15 synthetic university profiles** with varying domains, expertise tags, and department facilities.

- **Format**:
  ```json
  {
    "id": "uni_agritech",
    "name": "State AgriTech University",
    "domains": ["Agriculture", "Water Management", "Rural Livelihoods"],
    "expertise": ["Agricultural Engineering", "Agronomy", "Water Resources", "Thermal Engineering"],
    "departments": ["Department of Agriculture", "Department of Thermal Science"],
    "infrastructure": ["Cold storage prototype lab", "Evaporative cooling testing chambers"],
    "previousProjects": ["Post-harvest grain dryer systems"],
    "locationContext": "Northern Plains"
  }
  ```
- **Profiles**:
  1. `uni_agritech` (State AgriTech University)
  2. `uni_metrotech` (Metro Tech Institute)
  3. `uni_ecoscience` (Green Valley Eco-Science College)
  4. `uni_ruraldev` (National Rural Development Institute)
  5. `uni_mechanical_sciences` (Indian Institute of Mechanical Sciences)
  6. `uni_healthtech` (Apex Health Sciences University)
  7. `uni_delhi_academic` (Delhi Central Academic Institute)
  8. `uni_water_eng` (Institute of Groundwater & Water Engineering)
  9. `uni_energy_tech` (Advanced Energy Research Academy)
  10. `uni_craft_design` (National Craft and Design Institute)
  11. `uni_coop_mgmt` (Rural Cooperative Management Institute)
  12. `uni_oceanic` (Coastal Ecology and Marine Studies Institute)
  13. `uni_traffic_sci` (Academy of Transport & Traffic Sciences)
  14. `uni_spec_needs` (National Special Needs Education Center)
  15. `uni_bio_innovations` (Apex Biological Innovations Laboratory)
