-- Seed file for PostgreSQL

-- Clean existing data (redundant due to schema.sql CASCADE but safe)
TRUNCATE "project_milestones", "projects", "challenge_assignments", "university_expertise", "expertise_tags", "departments", "universities", "innovation_gaps", "challenge_embeddings", "challenge_ai_analysis", "challenges", "users" RESTART IDENTITY CASCADE;

-- Insert Users
-- passwords are bcrypt hashes of their usernames (e.g., citizen, uni_admin, gov_admin)
INSERT INTO "users" ("id", "username", "email", "password", "role", "universityId", "createdAt") VALUES
('usr_citizen', 'citizen', 'citizen@siip.org', '$2a$10$T8Z.XlskgN09nO6e0R.dY.6ZlB7P6T4cO1wzU01m8D0p4w8K6u09q', 'citizen', NULL, NOW()),
('usr_uni_admin', 'uni_admin', 'admin@agritech.edu', '$2a$10$T8Z.XlskgN09nO6e0R.dY.6ZlB7P6T4cO1wzU01m8D0p4w8K6u09q', 'university_admin', 'uni_agritech', NOW()),
('usr_gov_admin', 'gov_admin', 'admin@gov.siip.gov', '$2a$10$T8Z.XlskgN09nO6e0R.dY.6ZlB7P6T4cO1wzU01m8D0p4w8K6u09q', 'government_admin', NULL, NOW());

-- Insert Universities
INSERT INTO "universities" ("id", "name", "district", "description") VALUES
('uni_agritech', 'State AgriTech University', 'Agricultural District North', 'A leading institution focused on agricultural engineering, post-harvest systems, and rural technology solutions.'),
('uni_metrotech', 'Metro Tech Institute', 'Urban Center East', 'Specializing in urban planning, transport systems, data science, IoT sensors, and smart city infrastructure.'),
('uni_ecoscience', 'Green Valley Eco-Science College', 'Eco Corridor South', 'Focused on environmental sustainability, organic waste solutions, water resource management, and renewable energy.');

-- Insert Expertise Tags
INSERT INTO "expertise_tags" ("id", "tag") VALUES
('tag_agri', 'agriculture'),
('tag_cold', 'cold-storage'),
('tag_post', 'post-harvest'),
('tag_data', 'data-science'),
('tag_traffic', 'traffic-control'),
('tag_iot', 'iot'),
('tag_waste', 'waste-management'),
('tag_water', 'water-treatment');

-- Insert University Expertise Join
INSERT INTO "university_expertise" ("id", "universityId", "tagId") VALUES
('ue_1', 'uni_agritech', 'tag_agri'),
('ue_2', 'uni_agritech', 'tag_cold'),
('ue_3', 'uni_agritech', 'tag_post'),
('ue_4', 'uni_metrotech', 'tag_data'),
('ue_5', 'uni_metrotech', 'tag_traffic'),
('ue_6', 'uni_metrotech', 'tag_iot'),
('ue_7', 'uni_ecoscience', 'tag_waste'),
('ue_8', 'uni_ecoscience', 'tag_water');

-- Insert Challenges
INSERT INTO "challenges" ("id", "title", "description", "latitude", "longitude", "locationName", "status", "createdBy", "createdAt") VALUES
('ch_tomato_spoilage', 'Tomato spoilage at North Mandi Market', 'Local vendors are losing up to 40% of their tomatoes due to extreme afternoon heat and lack of cold storage facilities in the market yard. The rot starts within 24 hours of arrival.', 28.7041, 77.1025, 'North Mandi Market, New Delhi', 'open', 'usr_citizen', NOW() - INTERVAL '5 days'),
('ch_vegetable_rot', 'Vegetable rot at farmer coop yard due to heat', 'Our agricultural cooperative yard has no refrigeration. Vegetables, particularly spinach and tomatoes, spoil rapidly under afternoon sun. We need a low-cost, off-grid cooling solution.', 28.7200, 77.1500, 'Cooperative Yard, Outer Delhi', 'open', 'usr_citizen', NOW() - INTERVAL '4 days'),
('ch_traffic_jam', 'Traffic gridlock at Metro Station Circle', 'Major traffic jams occur daily at the Metro Station junction due to uncoordinated signal timing and passenger boarding congestion.', 28.6139, 77.2090, 'Metro Station Circle, Delhi', 'open', 'usr_citizen', NOW() - INTERVAL '3 days'),
('ch_well_water', 'High nitrate contamination in community wells', 'Recent drinking water tests show high levels of nitrates and chemical runoff in several community tubewells, likely from nearby farms.', 28.8000, 77.3000, 'Green Valley Village Wells', 'open', 'usr_citizen', NOW() - INTERVAL '2 days'),
('ch_food_waste', 'Organic food waste dump near college campus', 'Large quantities of canteen food waste are dumped in open plots behind the campus, attracting pests and causing foul odors. We need a local composting system.', 28.6500, 77.0500, 'Campus Back Alley, West Delhi', 'open', 'usr_citizen', NOW() - INTERVAL '1 day');

-- Insert Challenge AI Analysis (For ch_tomato_spoilage demo record)
INSERT INTO "challenge_ai_analysis" ("id", "challengeId", "domain", "subdomain", "problemType", "severity", "affectedPopulation", "scale", "keyFactors", "missingInformation", "confidence") VALUES
('an_tomato_spoilage', 'ch_tomato_spoilage', 'Agriculture', 'Post-Harvest Management', 'Food Spoilage and Storage', 'High', 'Approximately 150 local mandi vendors and 2,000 daily consumers', 'District Level', ARRAY['Lack of passive cooling', 'No grid electricity for active cooling', 'High ambient summer temperatures'], ARRAY['Exact daily supply volume', 'Current market waste-disposal rates'], 0.92);

-- Insert Challenge Embeddings (Simulated 384-dimension vector for ch_tomato_spoilage, vector literal format)
-- In a real system, these would be generated by a model. We use a 384-dimensional vector containing some values.
-- Just a simple vector starting with [0.1, 0.2, ...] and filled with zeros.
INSERT INTO "challenge_embeddings" ("id", "challengeId", "embedding") VALUES
('emb_tomato_spoilage', 'ch_tomato_spoilage', array_fill(0.05::double precision, ARRAY[384])::vector);

-- Insert Innovation Gaps (For ch_tomato_spoilage demo record)
INSERT INTO "innovation_gaps" ("id", "challengeId", "gapType", "description", "rationale", "recommendedAction", "requiredExpertise", "confidence") VALUES
('gap_tomato_spoilage', 'ch_tomato_spoilage', 'adaptation', 'Need for off-grid, low-cost evaporative cooling storage system', 'Standard electrical refrigeration is not feasible due to power grid unreliability at the market. An adaptation of zero-energy cool chambers (ZECC) is needed.', 'Design and construct a passive zero-energy evaporative cooling chamber using local materials like clay, bricks, and sand.', ARRAY['Evaporative Cooling Systems', 'Post-Harvest Engineering', 'Low-Cost Materials Design'], 0.88);

-- Insert Challenge Assignments (Initial matches)
INSERT INTO "challenge_assignments" ("id", "challengeId", "universityId", "matchScore", "status") VALUES
('as_tomato_spoilage_1', 'ch_tomato_spoilage', 'uni_agritech', 92.4, 'pending'),
('as_tomato_spoilage_2', 'ch_tomato_spoilage', 'uni_ecoscience', 71.2, 'pending');
