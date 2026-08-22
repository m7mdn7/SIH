import os
import json
from typing import List, Dict, Any

def generate_challenges() -> List[Dict[str, Any]]:
    domains = [
        "Agriculture", "Water Management", "Healthcare", "Education", "Environment",
        "Energy", "Urban Infrastructure", "Accessibility", "Public Administration", "Rural Livelihoods"
    ]
    
    challenges = []
    
    # 1. First, let's add the intentional duplicate/related groups
    # Group A: Tomato cold storage (Agriculture)
    challenges.extend([
        {
            "id": "ch_tomato_spoilage",
            "title": "Tomato spoilage at North Mandi Market",
            "description": "Farmers lose massive quantities of fresh tomatoes daily due to lack of cold storage facilities and extreme heat during transport.",
            "domain": "Agriculture",
            "subdomain": "Post-Harvest Management",
            "locationContext": "North Mandi Market, New Delhi",
            "expectedSeverity": "high"
        },
        {
            "id": "ch_vegetable_rot",
            "title": "Vegetable rot at farmer coop yard due to heat",
            "description": "Our agricultural cooperative yard has no refrigeration. Vegetables, particularly spinach and tomatoes, spoil rapidly under afternoon sun. We need a low-cost, off-grid cooling solution.",
            "domain": "Agriculture",
            "subdomain": "Post-Harvest Management",
            "locationContext": "Outer Delhi Farmer Coop",
            "expectedSeverity": "high"
        },
        {
            "id": "ch_tomato_trans_damage",
            "title": "Tomato damage during distribution transit",
            "description": "Freshly harvested tomatoes get crushed and rot during shipping to central markets because of non-insulated packaging and unrefrigerated trucks.",
            "domain": "Agriculture",
            "subdomain": "Supply Chain Logistics",
            "locationContext": "Delhi-Haryana highway corridor",
            "expectedSeverity": "medium"
        }
    ])

    # Group B: Nitrate contamination (Water Management)
    challenges.extend([
        {
            "id": "ch_well_nitrate_1",
            "title": "High nitrate contamination in community wells",
            "description": "Recent drinking water tests show high levels of nitrates and chemical runoff in several community tubewells, likely from nearby farms.",
            "domain": "Water Management",
            "subdomain": "Drinking Water Security",
            "locationContext": "Green Valley Village Wells",
            "expectedSeverity": "high"
        },
        {
            "id": "ch_well_nitrate_2",
            "title": "Agricultural fertilizer runoff polluting village drinking wells",
            "description": "Our well water is unsafe for infants. Tests show dangerous levels of nitrate pollutants originating from surrounding crop fields' fertilizer runoff.",
            "domain": "Water Management",
            "subdomain": "Drinking Water Security",
            "locationContext": "Green Valley Village Rural Wells",
            "expectedSeverity": "high"
        }
    ])

    # Group C: Traffic Signal (Urban Infrastructure)
    challenges.extend([
        {
            "id": "ch_traffic_signal_1",
            "title": "Traffic gridlock at Metro Station Circle",
            "description": "Major traffic jams occur daily at the Metro Station junction due to uncoordinated signal timing and passenger boarding congestion.",
            "domain": "Urban Infrastructure",
            "subdomain": "Transportation Systems",
            "locationContext": "Metro Station Circle, Delhi",
            "expectedSeverity": "medium"
        },
        {
            "id": "ch_traffic_signal_2",
            "title": "Congestion and signal delay at metro boarding hub",
            "description": "Fixed timers on traffic lights at the metro junction cause massive rush hour delays. Signals don't adapt to changing vehicle densities.",
            "domain": "Urban Infrastructure",
            "subdomain": "Transportation Systems",
            "locationContext": "Metro Station Intersection",
            "expectedSeverity": "medium"
        }
    ])

    # Now generate synthetic challenges to fill to 100+
    # 10 challenges per domain
    count_per_domain = {d: 0 for d in domains}
    
    # Account for the manually added ones
    count_per_domain["Agriculture"] += 3
    count_per_domain["Water Management"] += 2
    count_per_domain["Urban Infrastructure"] += 2
    
    templates = {
        "Agriculture": [
            ("Crop loss due to pest infestation", "Unusual insect swarms are destroying legume crops in the block, and local pesticide treatments are failing."),
            ("Lack of soil nutrient analysis labs", "Smallholder farmers are applying incorrect ratios of nitrogen fertilizers because soil testing services are 50km away."),
            ("Inefficient solar crop drying", "Grain farmers suffer mold damage post-harvest. Traditional sun-drying takes too long and exposes crops to rain."),
            ("Fodder shortage in dry seasons", "Dairy farmers lack high-nutrition silage storage solutions to keep milk yields consistent during summer droughts."),
            ("Soil salinity in coastal farms", "Rising sea levels have caused salt intrusion in arable lands, preventing traditional paddy germination."),
            ("Delayed crop harvesting bottlenecks", "Lack of shared mechanical harvesters forces small farm owners to delay harvesting, causing grain shattering."),
            ("Low milk yield due to cattle heat stress", "Milch cows suffer from thermal stress in poorly ventilated sheds, reducing summer milk yields by 30%."),
            ("Invasive weed choking pasture land", "A toxic invasive weed species is spreading across community grazing pastures, poisoning local livestock.")
        ],
        "Water Management": [
            ("Fluoride poisoning in school supply", "Primary school borewell tests indicate toxic levels of natural fluoride, leading to dental fluorosis in children."),
            ("Rainwater harvesting system failures", "Rooftop storage tanks installed in public buildings are leaking and have silted up due to poor filter design."),
            ("Groundwater depletion in irrigation zone", "Heavy deep-bore tubewell operation has dropped the local water table by 15 meters, drying out shallow hand pumps."),
            ("Urban lake eutrophication", "Discharge of raw sewage and detergent effluents has caused massive algal blooms, choking local fish populations."),
            ("Siltation of community irrigation canal", "Monsoon mudslides have filled the main irrigation channel with clay silt, blocking flow to downstream farmlands."),
            ("Drinking water pipe leakage losses", "Old cast iron water mains are leaking over 40% of treated municipal water into subterranean sand layers."),
            ("Waterborne pathogen outbreak after flood", "Contamination of open drinking water tanks has caused gastroenteritis cases among villagers."),
            ("Industrial heavy metal dumping in canal", "Small scale plating factories dump untreated chromium effluents into the common drainage canal.")
        ],
        "Healthcare": [
            ("Lack of neonatal warming devices", "Rural primary health centers lack functional incubators, leading to hypothermia risks in preterm infants."),
            ("Delayed tuberculosis diagnosis", "Sputum test samples take two weeks to return results from the district hospital, causing transmission risks."),
            ("High incidence of anemia in adolescent girls", "Local schools report high absenteeism due to severe iron-deficiency anemia among teenage students."),
            ("No ambulance access across river", "During monsoon washouts, villages across the local river are cut off from emergency obstetric care."),
            ("Improper medical waste incineration", "Community clinics are burning medical plastics in open pits, releasing toxic dioxin fumes near residential yards."),
            ("Insulin storage failures in power cuts", "Diabetes patients in remote clinics lose cold-chain integrity for stored insulin during extended power failures."),
            ("Mental health counseling shortage", "Stress levels are high among rural youth, but the nearest psychiatric consultation is at the state capital."),
            ("Snakebite antivenom supply shortage", "Monsoon season sees high snakebite incidents, but health sub-centers do not stock cold-chain antivenom vials.")
        ],
        "Education": [
            ("High dropout rates among rural girls", "Lack of functioning separate toilets at secondary schools causes female students to drop out at puberty."),
            ("Lack of science experiment kits", "Government high schools teach chemistry and physics theoretically because of zero laboratory budgets."),
            ("Dysfunctional computer lab hardware", "Donated computers are lying unused due to lack of local technical maintenance support and power surges."),
            ("Illiteracy in local tribal dialects", "Children from tribal communities fall behind early because instruction materials are not in their native tongue."),
            ("Inadequate braille reading textbooks", "Visually impaired students in public schools receive printed braille books months after the term starts."),
            ("Poor teacher attendance in remote hamlets", "Teachers struggle with long commutes to hill schools, leading to frequent classroom closures."),
            ("Lack of vocational career counseling", "High school graduates migrate to cities for manual labor due to zero awareness of technical trade training."),
            ("No internet connectivity for e-learning", "Broadband lines do not reach the rural school block, making government digital learning portals useless.")
        ],
        "Environment": [
            ("Open garbage burning in market yards", "Municipal workers burn mixed plastic waste daily, creating heavy toxic smog over neighboring residential blocks."),
            ("Deforestation of catchment hills", "Illegal firewood logging has cleared the slope forest, causing mudslides during heavy monsoons."),
            ("Plastic bag choking storm drains", "Single-use shopping bags block the underground gutter system, causing flash floods in streets."),
            ("E-waste accumulation in landfill", "Discarded electronics are mixed with regular household waste, leaching lead and mercury into ground soil."),
            ("Air pollution from brick kilns", "Unregulated clay brick manufacturing kilns emit thick black soot, causing respiratory issues in surrounding villages."),
            ("Loss of local honeybee populations", "Excessive neonicotinoid pesticide sprays on mustard crops have decimated native pollinator colonies."),
            ("Riverbank erosion washing houses", "Fast currents during monsoon floods erode the soft sandy banks, destroying riverside settlements."),
            ("Methane emission from organic dump", "Wet food waste from the city market decays anaerobically, creating strong odor and fire hazards.")
        ],
        "Energy": [
            ("Frequent load shedding in school blocks", "Schools lose 6 hours of power daily, disrupting evening classes and digital learning modules."),
            ("High cost of diesel generator pumping", "Farmers rely on expensive diesel fuel to run water pumps because of zero agricultural grid connections."),
            ("Biomass cookstove smoke pollution", "Women suffer chronic respiratory diseases due to soot from traditional wood-burning stoves in unventilated kitchens."),
            ("Solar microgrid battery failures", "Community solar installations stop working within 18 months due to battery overheating and lack of replacements."),
            ("Voltage fluctuations damaging pumps", "Unstable grid voltages burn out agricultural pump motors, requiring expensive rewinding repairs."),
            ("No street lighting in high crime zones", "Absence of public illumination on dark lanes increases safety risks for night shift workers."),
            ("Biogas digester winter failure", "Cow dung digesters stop generating cooking gas during cold winter months due to drop in bacterial activity."),
            ("Lack of wind turbine maintenance", "Coastal community wind pumps are locked up due to rusted gearboxes and no local technicians.")
        ],
        "Urban Infrastructure": [
            ("Open manholes on main walkways", "Pavement storm covers are broken or stolen, creating severe hazards for pedestrians, especially at night."),
            ("Inadequate sewage treatment capacity", "The municipal treatment plant overflows during rains, releasing raw sewage into the public river corridor."),
            ("Unpaved road dust causing allergies", "Heavy truck traffic on unpaved bypass roads kicks up fine silica dust, causing widespread asthma."),
            ("Pothole damage causing motorcycle crashes", "Monsoon rains wash away asphalt, leaving deep craters that cause frequent two-wheeler accidents."),
            ("Lack of public drinking fountains", "Commuters suffer heat exhaustion due to zero access to clean drinking water stations in transit hubs."),
            ("Overcrowded public bus boarding gates", "Bus stops lack queue lanes or platforms, causing dangerous stampedes during peak office hours."),
            ("No fire hydrant network in dense slums", "Narrow lanes prevent fire engines from entering, and there are no pressurized water mains nearby."),
            ("Corrosion of iron pedestrian bridges", "Humid weather and saline air have rusted the support beams of the city walkover bridges, threatening collapse.")
        ],
        "Accessibility": [
            ("No wheelchair ramp at public library", "The municipal archive has only steep stone stairs, blocking access for citizens with mobility impairments."),
            ("Absence of audio signals at crosswalks", "Visually impaired pedestrians cannot safely cross the busy metro station intersection without assistance."),
            ("Lack of sign language translators in clinics", "Deaf patients struggle to explain symptoms to doctors due to absence of translation services."),
            ("Non-accessible government website forms", "Screen readers cannot parse the dropdowns on the state portal, preventing disabled users from applying for pensions."),
            ("High steps on public transit buses", "Bus entry steps are 40cm high, making boarding impossible for wheelchair users and senior citizens."),
            ("Braille markings missing on elevators", "Elevator buttons in the public court complex lack tactile markings, disorienting blind visitors."),
            ("Heavy heavy doors at bank entrances", "Spring-loaded entry doors require too much force, blocking access for frail individuals."),
            ("Non-adjustable school desks for disabled", "Students using wheelchairs are forced to sit far away from whiteboards due to fixed seating.")
        ],
        "Public Administration": [
            ("Delayed pension disbursement cycles", "Elderly citizens wait up to 4 months for monthly pension deposits due to manual bank verification loops."),
            ("Corruption in land record registries", "Farmers are forced to pay bribes to obtain copies of land title deeds required for bank loans."),
            ("No digital portal for trade permits", "Artisans must travel 60km to the district headquarters to renew basic manufacturing license certificates."),
            ("Mishandled community grievances", "Written complaints submitted to the municipality office are routinely misplaced or ignored without tracking IDs."),
            ("Lack of transparency in school budgets", "Funds allocated for mid-day meals are diverted due to zero public audit reporting mechanisms."),
            ("Complex application forms for subsidies", "Marginalized farmers fail to apply for crop subsidies due to highly complicated paperwork written in English."),
            ("No local birth registration desk", "Parents in remote tribal blocks must travel long distances to register newborns, risking lost certificates."),
            ("Slow disaster relief payments", "Compensation for crops lost to hail takes over a year to process through manual government verification.")
        ],
        "Rural Livelihoods": [
            ("Low price realization for silk weavers", "Handloom weavers are forced to sell products to middlemen at thin margins due to zero direct market access."),
            ("Lack of cold storage for fish catch", "Artisanal fishermen must sell their catch immediately at throwaway prices or watch it rot on hot beaches."),
            ("Lack of credit history for women groups", "Women self-help groups fail to secure microloans because banks require collateral assets."),
            ("Decline in bamboo craft tool efficiency", "Artisans use manual knives that limit daily production volumes and cause hand injuries."),
            ("No packaging standards for honey harvest", "Forest gatherers sell honey in recycled plastic bottles, which fails food safety standards for retail."),
            ("Cocoa bean fermentation failures", "Small growers suffer losses due to mold during open-yard cocoa fermentation in unpredictable weather."),
            ("Absence of wool spinning card machines", "Hill weavers spend 70% of their labor carding wool by hand, reducing active weaving hours."),
            ("No marketing support for organic millet", "Dryland farmers grow nutritious millets but lack branding or distribution to reach high-value urban retail.")
        ]
    }

    # Generate standard template entries to reach 10 per domain
    for domain in domains:
        current_count = count_per_domain[domain]
        domain_templates = templates.get(domain, [])
        for i in range(10 - current_count):
            if i < len(domain_templates):
                title, desc = domain_templates[i]
                challenges.append({
                    "id": f"ch_{domain.lower().replace(' ', '_')}_{i+1}",
                    "title": title,
                    "description": desc,
                    "domain": domain,
                    "subdomain": "General " + domain,
                    "locationContext": "Rural Block Area",
                    "expectedSeverity": "medium"
                })
            else:
                # Catch-all generated
                challenges.append({
                    "id": f"ch_{domain.lower().replace(' ', '_')}_{i+1}",
                    "title": f"Societal challenge in {domain} - {i}",
                    "description": f"Detailed description of local issues in the domain of {domain}. Needs multidisciplinary team solving.",
                    "domain": domain,
                    "subdomain": "General Block",
                    "locationContext": "Rural District Block",
                    "expectedSeverity": "medium"
                })

    return challenges

def generate_universities() -> List[Dict[str, Any]]:
    return [
        {
            "id": "uni_agritech",
            "name": "State AgriTech University",
            "domains": ["Agriculture", "Water Management", "Rural Livelihoods"],
            "expertise": ["Agricultural Engineering", "Agronomy", "Water Resources", "Thermal Engineering"],
            "departments": ["Department of Agriculture", "Department of Thermal Science", "Department of Rural Economics"],
            "infrastructure": ["Cold storage prototype lab", "Evaporative cooling testing chambers", "Soil analysis lab"],
            "previousProjects": ["Post-harvest grain dryer systems", "Solar water pump installations"],
            "locationContext": "Northern Plains"
        },
        {
            "id": "uni_metrotech",
            "name": "Metro Tech Institute",
            "domains": ["Urban Infrastructure", "Energy", "Accessibility"],
            "expertise": ["Computer Science", "Artificial Intelligence", "Electrical Engineering", "Urban Planning"],
            "departments": ["Department of Computer Science", "Department of Electrical Engineering", "Department of Urban Planning"],
            "infrastructure": ["Smart city sensor testbed", "High-performance computing cluster", "Traffic signal controller lab"],
            "previousProjects": ["Adaptive signal control in New Delhi", "IoT transit tracking nodes"],
            "locationContext": "Metropolitan Capital"
        },
        {
            "id": "uni_ecoscience",
            "name": "Green Valley Eco-Science College",
            "domains": ["Environment", "Water Management", "Healthcare"],
            "expertise": ["Environmental Science", "Public Health", "Water Resources", "Biotechnology"],
            "departments": ["Department of Environmental Studies", "Department of Microbiology", "Department of Community Health"],
            "infrastructure": ["Water quality testing lab", "Microbial assay cleanroom", "Organic compost pilot yard"],
            "previousProjects": ["Fluoride filtration beds", "Village sewage bio-filtration ponds"],
            "locationContext": "Forest Range Block"
        },
        {
            "id": "uni_ruraldev",
            "name": "National Rural Development Institute",
            "domains": ["Rural Livelihoods", "Education", "Public Administration"],
            "expertise": ["Social Sciences", "Education Technology", "Renewable Energy"],
            "departments": ["Department of Rural Sociology", "Department of Distance Education", "Department of Public Policy"],
            "infrastructure": ["Vocational training workshops", "Translation studio", "Mobile classrooms"],
            "previousProjects": ["Digital trade portals for weavers", "Rural subsidy application forms refactor"],
            "locationContext": "Central Dry Block"
        },
        {
            "id": "uni_mechanical_sciences",
            "name": "Indian Institute of Mechanical Sciences",
            "domains": ["Energy", "Urban Infrastructure", "Agriculture"],
            "expertise": ["Mechanical Engineering", "Thermal Engineering", "Renewable Energy", "Civil Engineering"],
            "departments": ["Department of Mechanical Engineering", "Department of Civil Engineering"],
            "infrastructure": ["Wind tunnel", "Solar thermal materials test yard", "Hydraulic press workshops"],
            "previousProjects": ["Low-cost pedal threshers", "Off-grid wind pump gearboxes"],
            "locationContext": "Southern Industrial Belt"
        },
        {
            "id": "uni_healthtech",
            "name": "Apex Health Sciences University",
            "domains": ["Healthcare", "Accessibility"],
            "expertise": ["Healthcare Technology", "Biotechnology", "Accessibility Engineering", "Computer Science"],
            "departments": ["Department of Biomedical Engineering", "Department of Nursing Studies"],
            "infrastructure": ["Neonatal medical device lab", "Assistive prototype studio", "Medical software sandbox"],
            "previousProjects": ["Low-cost infant warmers", "Screen reader accessibility compliance kits"],
            "locationContext": "Metro Hospital District"
        },
        {
            "id": "uni_delhi_academic",
            "name": "Delhi Central Academic Institute",
            "domains": ["Education", "Public Administration", "Accessibility"],
            "expertise": ["Social Sciences", "Education Technology", "Accessibility Engineering"],
            "departments": ["Department of Education", "Department of Human Rights", "Department of Languages"],
            "infrastructure": ["Braille printing lab", "Digital recording studio", "Curriculum design center"],
            "previousProjects": ["Dialect learning textbooks", "Visual impairment elevator guidance grids"],
            "locationContext": "Metropolitan Hub"
        },
        {
            "id": "uni_water_eng",
            "name": "Institute of Groundwater & Water Engineering",
            "domains": ["Water Management", "Environment"],
            "expertise": ["Water Resources", "Environmental Science", "Civil Engineering"],
            "departments": ["Department of Hydrogeology", "Department of Sanitation Engineering"],
            "infrastructure": ["Drilling core analysis facility", "Heavy metal spectrophotometer lab"],
            "previousProjects": ["Nitrate remediation using biochar", "Urban water leakage maps"],
            "locationContext": "Arid Plains Block"
        },
        {
            "id": "uni_energy_tech",
            "name": "Advanced Energy Research Academy",
            "domains": ["Energy", "Environment"],
            "expertise": ["Renewable Energy", "Electrical Engineering", "Thermal Engineering"],
            "departments": ["Department of Solar Thermal Studies", "Department of Grid Dynamics"],
            "infrastructure": ["Microgrid simulator", "Battery stress test lab"],
            "previousProjects": ["Hybrid solar-biomass minigrids", "High-capacity supercapacitor banks"],
            "locationContext": "Western Desert Fringe"
        },
        {
            "id": "uni_craft_design",
            "name": "National Craft and Design Institute",
            "domains": ["Rural Livelihoods", "Education"],
            "expertise": ["Social Sciences", "Mechanical Engineering"],
            "departments": ["Department of Design Innovation", "Department of Craft Technology"],
            "infrastructure": ["Artisan tooling workshops", "Packaging design test rigs"],
            "previousProjects": ["Ergonomic bamboo knives", "High-efficiency spinning wheel pedal jigs"],
            "locationContext": "Handloom Craft Corridor"
        },
        {
            "id": "uni_coop_mgmt",
            "name": "Rural Cooperative Management Institute",
            "domains": ["Rural Livelihoods", "Public Administration"],
            "expertise": ["Social Sciences", "Data Science"],
            "departments": ["Department of Cooperative Economics", "Department of Welfare Administration"],
            "infrastructure": ["Socio-economic research databank"],
            "previousProjects": ["Microfinance ledger automation", "Cooperative budget visual maps"],
            "locationContext": "Agricultural Trade Hub"
        },
        {
            "id": "uni_oceanic",
            "name": "Coastal Ecology and Marine Studies Institute",
            "domains": ["Environment", "Rural Livelihoods"],
            "expertise": ["Environmental Science", "Thermal Engineering"],
            "departments": ["Department of Coastal Ecology", "Department of Cold Chain Design"],
            "infrastructure": ["Marine biology aquarium", "Solar absorption refrigeration lab"],
            "previousProjects": ["Sea level rise warning sensors", "Beach sand solar chillers for fisherman"],
            "locationContext": "Southern Peninsula Coast"
        },
        {
            "id": "uni_traffic_sci",
            "name": "Academy of Transport & Traffic Sciences",
            "domains": ["Urban Infrastructure"],
            "expertise": ["Civil Engineering", "Urban Planning", "Computer Science"],
            "departments": ["Department of Traffic Engineering", "Department of Transit Management"],
            "infrastructure": ["High-definition camera field network", "Signal telemetry database"],
            "previousProjects": ["Adaptive green waves on arterial roads", "Bus station pedestrian safety lanes"],
            "locationContext": "Metro Ring Road Corridor"
        },
        {
            "id": "uni_spec_needs",
            "name": "National Special Needs Education Center",
            "domains": ["Education", "Accessibility"],
            "expertise": ["Accessibility Engineering", "Education Technology", "Social Sciences"],
            "departments": ["Department of Inclusive Education", "Department of Sign Language Studies"],
            "infrastructure": ["Tactile print facility", "Eye-tracking software suites"],
            "previousProjects": ["Audio-tactile maps for blind", "Clinic sign language avatars"],
            "locationContext": "Capital Suburb"
        },
        {
            "id": "uni_bio_innovations",
            "name": "Apex Biological Innovations Laboratory",
            "domains": ["Healthcare", "Environment", "Agriculture"],
            "expertise": ["Biotechnology", "Agronomy", "Public Health"],
            "departments": ["Department of Bio-Remediation", "Department of Molecular Diagnostics"],
            "infrastructure": ["DNA sequencing cleanroom", "Fungal assay greenhouse"],
            "previousProjects": ["Snake antivenom synthesis kits", "Biodegradable agricultural films"],
            "locationContext": "Science Park Block"
        }
    ]

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    
    # Create subfolders
    os.makedirs(os.path.join(data_dir, "challenges"), exist_ok=True)
    os.makedirs(os.path.join(data_dir, "universities"), exist_ok=True)
    
    # Save Challenges
    challenges = generate_challenges()
    ch_path = os.path.join(data_dir, "challenges", "sample_challenges.json")
    with open(ch_path, 'w', encoding='utf-8') as f:
        json.dump(challenges, f, indent=2, ensure_ascii=False)
    print(f"Generated {len(challenges)} sample challenges at {ch_path}")
    
    # Save Universities
    universities = generate_universities()
    uni_path = os.path.join(data_dir, "universities", "sample_universities.json")
    with open(uni_path, 'w', encoding='utf-8') as f:
        json.dump(universities, f, indent=2, ensure_ascii=False)
    print(f"Generated {len(universities)} sample universities at {uni_path}")

if __name__ == "__main__":
    main()
