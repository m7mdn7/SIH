import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

let pgPool: Pool | null = null;
let sqliteDb: any = null;
const useSqlite = process.env.USE_SQLITE === 'true';

// Helper to map array columns from SQLite JSON strings to JS arrays
function mapRow(row: any): any {
  if (!row) return row;
  const mapped = { ...row };
  // Check typical array fields
  const arrayFields = ['keyFactors', 'missingInformation', 'requiredExpertise', 'expertiseTags'];
  for (const field of arrayFields) {
    if (typeof mapped[field] === 'string') {
      try {
        mapped[field] = JSON.parse(mapped[field]);
      } catch {
        // keep as is
      }
    }
  }
  return mapped;
}

function mapParams(params: any[]): any[] {
  return params.map(p => Array.isArray(p) ? JSON.stringify(p) : p);
}

function translateQuery(sql: string): string {
  // Convert Postgres $1, $2 placeholders to SQLite ?
  return sql.replace(/\$\d+/g, '?');
}

// Initialize Database
export async function initDb() {
  if (useSqlite) {
    try {
      const { DatabaseSync } = require('node:sqlite');
      const dbPath = path.resolve(__dirname, process.env.SQLITE_DB_PATH || '../../siip.db');
      
      // Ensure the directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      console.log(`[Database] Initializing SQLite database at: ${dbPath}`);
      sqliteDb = new DatabaseSync(dbPath);
      sqliteDb.exec('PRAGMA foreign_keys = ON;');
      
      setupSqliteSchema();
      seedSqliteData();
    } catch (err) {
      console.error('[Database] Failed to initialize SQLite:', err);
      throw err;
    }
  } else {
    try {
      console.log('[Database] Connecting to PostgreSQL...');
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL
      });
      // Test connection
      await pgPool.query('SELECT 1');
      console.log('[Database] Connected to PostgreSQL successfully.');
    } catch (err) {
      console.error('[Database] PostgreSQL connection failed. Falling back to SQLite.');
      process.env.USE_SQLITE = 'true';
      await initDb();
    }
  }
}

// Unified query function
export async function query(sql: string, params: any[] = []): Promise<any[]> {
  if (sqliteDb) {
    const translatedSql = translateQuery(sql);
    const mappedParams = mapParams(params);
    try {
      const stmt = sqliteDb.prepare(translatedSql);
      const rows = stmt.all(...mappedParams);
      return rows.map(mapRow);
    } catch (err) {
      console.error(`[SQLite Error] Query: ${translatedSql} | Error:`, err);
      throw err;
    }
  } else if (pgPool) {
    const res = await pgPool.query(sql, params);
    return res.rows;
  } else {
    throw new Error('Database not initialized');
  }
}

function setupSqliteSchema() {
  console.log('[Database] Setting up SQLite schemas...');
  
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      universityId TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      locationName TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      createdBy TEXT REFERENCES users(id),
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS challenge_ai_analysis (
      id TEXT PRIMARY KEY,
      challengeId TEXT UNIQUE REFERENCES challenges(id) ON DELETE CASCADE,
      domain TEXT NOT NULL,
      subdomain TEXT NOT NULL,
      problemType TEXT NOT NULL,
      severity TEXT NOT NULL,
      affectedPopulation TEXT NOT NULL,
      scale TEXT NOT NULL,
      keyFactors TEXT NOT NULL,
      missingInformation TEXT NOT NULL,
      confidence REAL NOT NULL
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS challenge_embeddings (
      id TEXT PRIMARY KEY,
      challengeId TEXT UNIQUE REFERENCES challenges(id) ON DELETE CASCADE,
      embedding TEXT NOT NULL
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS innovation_gaps (
      id TEXT PRIMARY KEY,
      challengeId TEXT REFERENCES challenges(id) ON DELETE CASCADE,
      gapType TEXT NOT NULL,
      description TEXT NOT NULL,
      rationale TEXT NOT NULL,
      recommendedAction TEXT NOT NULL,
      requiredExpertise TEXT NOT NULL,
      confidence REAL NOT NULL
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS universities (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      district TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      universityId TEXT REFERENCES universities(id) ON DELETE CASCADE,
      name TEXT NOT NULL
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS expertise_tags (
      id TEXT PRIMARY KEY,
      tag TEXT UNIQUE NOT NULL
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS university_expertise (
      id TEXT PRIMARY KEY,
      universityId TEXT REFERENCES universities(id) ON DELETE CASCADE,
      tagId TEXT REFERENCES expertise_tags(id) ON DELETE CASCADE,
      UNIQUE(universityId, tagId)
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS challenge_assignments (
      id TEXT PRIMARY KEY,
      challengeId TEXT REFERENCES challenges(id) ON DELETE CASCADE,
      universityId TEXT REFERENCES universities(id) ON DELETE CASCADE,
      matchScore REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      challengeId TEXT REFERENCES challenges(id) ON DELETE CASCADE,
      universityId TEXT REFERENCES universities(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress',
      facultyLead TEXT NOT NULL
    );
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS project_milestones (
      id TEXT PRIMARY KEY,
      projectId TEXT REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      evidence TEXT
    );
  `);
}

function seedSqliteData() {
  // Check if data already exists
  const stmt = sqliteDb.prepare('SELECT COUNT(*) as count FROM users');
  const userCount = stmt.get().count;
  if (userCount > 0) {
    console.log('[Database] SQLite already seeded.');
    return;
  }

  console.log('[Database] Seeding SQLite database...');
  
  // Seed Users
  // passwords are bcrypt hashes of their usernames (bcryptjs.hashSync('username', 10))
  sqliteDb.prepare(`
    INSERT INTO users (id, username, email, password, role, universityId, createdAt) VALUES
    ('usr_citizen', 'citizen', 'citizen@siip.org', '$2a$10$T8Z.XlskgN09nO6e0R.dY.6ZlB7P6T4cO1wzU01m8D0p4w8K6u09q', 'citizen', NULL, datetime('now', '-5 days')),
    ('usr_uni_admin', 'uni_admin', 'admin@agritech.edu', '$2a$10$T8Z.XlskgN09nO6e0R.dY.6ZlB7P6T4cO1wzU01m8D0p4w8K6u09q', 'university_admin', 'uni_agritech', datetime('now', '-5 days')),
    ('usr_gov_admin', 'gov_admin', 'admin@gov.siip.gov', '$2a$10$T8Z.XlskgN09nO6e0R.dY.6ZlB7P6T4cO1wzU01m8D0p4w8K6u09q', 'government_admin', NULL, datetime('now', '-5 days'))
  `).run();

  // Seed Universities
  sqliteDb.prepare(`
    INSERT INTO universities (id, name, district, description) VALUES
    ('uni_agritech', 'State AgriTech University', 'Agricultural District North', 'A leading institution focused on agricultural engineering, post-harvest systems, and rural technology solutions.'),
    ('uni_metrotech', 'Metro Tech Institute', 'Urban Center East', 'Specializing in urban planning, transport systems, data science, IoT sensors, and smart city infrastructure.'),
    ('uni_ecoscience', 'Green Valley Eco-Science College', 'Eco Corridor South', 'Focused on environmental sustainability, organic waste solutions, water resource management, and renewable energy.')
  `).run();

  // Seed Expertise Tags
  sqliteDb.prepare(`
    INSERT INTO expertise_tags (id, tag) VALUES
    ('tag_agri', 'agriculture'),
    ('tag_cold', 'cold-storage'),
    ('tag_post', 'post-harvest'),
    ('tag_data', 'data-science'),
    ('tag_traffic', 'traffic-control'),
    ('tag_iot', 'iot'),
    ('tag_waste', 'waste-management'),
    ('tag_water', 'water-treatment')
  `).run();

  // Seed University Expertise Join
  sqliteDb.prepare(`
    INSERT INTO university_expertise (id, universityId, tagId) VALUES
    ('ue_1', 'uni_agritech', 'tag_agri'),
    ('ue_2', 'uni_agritech', 'tag_cold'),
    ('ue_3', 'uni_agritech', 'tag_post'),
    ('ue_4', 'uni_metrotech', 'tag_data'),
    ('ue_5', 'uni_metrotech', 'tag_traffic'),
    ('ue_6', 'uni_metrotech', 'tag_iot'),
    ('ue_7', 'uni_ecoscience', 'tag_waste'),
    ('ue_8', 'uni_ecoscience', 'tag_water')
  `).run();

  // Seed Challenges
  sqliteDb.prepare(`
    INSERT INTO challenges (id, title, description, latitude, longitude, locationName, status, createdBy, createdAt) VALUES
    ('ch_tomato_spoilage', 'Tomato spoilage at North Mandi Market', 'Local vendors are losing up to 40% of their tomatoes due to extreme afternoon heat and lack of cold storage facilities in the market yard. The rot starts within 24 hours of arrival.', 28.7041, 77.1025, 'North Mandi Market, New Delhi', 'open', 'usr_citizen', datetime('now', '-5 days')),
    ('ch_vegetable_rot', 'Vegetable rot at farmer coop yard due to heat', 'Our agricultural cooperative yard has no refrigeration. Vegetables, particularly spinach and tomatoes, spoil rapidly under afternoon sun. We need a low-cost, off-grid cooling solution.', 28.7200, 77.1500, 'Cooperative Yard, Outer Delhi', 'open', 'usr_citizen', datetime('now', '-4 days')),
    ('ch_traffic_jam', 'Traffic gridlock at Metro Station Circle', 'Major traffic jams occur daily at the Metro Station junction due to uncoordinated signal timing and passenger boarding congestion.', 28.6139, 77.2090, 'Metro Station Circle, Delhi', 'open', 'usr_citizen', datetime('now', '-3 days')),
    ('ch_well_water', 'High nitrate contamination in community wells', 'Recent drinking water tests show high levels of nitrates and chemical runoff in several community tubewells, likely from nearby farms.', 28.8000, 77.3000, 'Green Valley Village Wells', 'open', 'usr_citizen', datetime('now', '-2 days')),
    ('ch_food_waste', 'Organic food waste dump near college campus', 'Large quantities of canteen food waste are dumped in open plots behind the campus, attracting pests and causing foul odors. We need a local composting system.', 28.6500, 77.0500, 'Campus Back Alley, West Delhi', 'open', 'usr_citizen', datetime('now', '-1 day'))
  `).run();

  // Seed Challenge AI Analysis (For ch_tomato_spoilage demo record)
  // Store arrays as JSON strings
  sqliteDb.prepare(`
    INSERT INTO challenge_ai_analysis (id, challengeId, domain, subdomain, problemType, severity, affectedPopulation, scale, keyFactors, missingInformation, confidence) VALUES
    ('an_tomato_spoilage', 'ch_tomato_spoilage', 'Agriculture', 'Post-Harvest Management', 'Food Spoilage and Storage', 'High', 'Approximately 150 local mandi vendors and 2,000 daily consumers', 'District Level', 
     '["Lack of passive cooling", "No grid electricity for active cooling", "High ambient summer temperatures"]', 
     '["Exact daily supply volume", "Current market waste-disposal rates"]', 0.92)
  `).run();

  // Seed Challenge Embeddings (Simulated 384-dimension vector)
  sqliteDb.prepare(`
    INSERT INTO challenge_embeddings (id, challengeId, embedding) VALUES
    ('emb_tomato_spoilage', 'ch_tomato_spoilage', '[]')
  `).run();

  // Seed Innovation Gaps (For ch_tomato_spoilage demo record)
  sqliteDb.prepare(`
    INSERT INTO innovation_gaps (id, challengeId, gapType, description, rationale, recommendedAction, requiredExpertise, confidence) VALUES
    ('gap_tomato_spoilage', 'ch_tomato_spoilage', 'adaptation', 'Need for off-grid, low-cost evaporative cooling storage system', 'Standard electrical refrigeration is not feasible due to power grid unreliability at the market. An adaptation of zero-energy cool chambers (ZECC) is needed.', 'Design and construct a passive zero-energy evaporative cooling chamber using local materials like clay, bricks, and sand.', 
     '["Evaporative Cooling Systems", "Post-Harvest Engineering", "Low-Cost Materials Design"]', 0.88)
  `).run();

  // Seed Challenge Assignments
  sqliteDb.prepare(`
    INSERT INTO challenge_assignments (id, challengeId, universityId, matchScore, status) VALUES
    ('as_tomato_spoilage_1', 'ch_tomato_spoilage', 'uni_agritech', 92.4, 'pending'),
    ('as_tomato_spoilage_2', 'ch_tomato_spoilage', 'uni_ecoscience', 71.2, 'pending')
  `).run();

  console.log('[Database] SQLite database seeded successfully.');
}
