-- Enable the pgvector extension to support vector similarity search
-- Note: This requires the pgvector/pgvector image or pgvector installed in the database.
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop tables if they exist (for easy scaffolding)
DROP TABLE IF EXISTS "project_milestones" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "challenge_assignments" CASCADE;
DROP TABLE IF EXISTS "university_expertise" CASCADE;
DROP TABLE IF EXISTS "expertise_tags" CASCADE;
DROP TABLE IF EXISTS "departments" CASCADE;
DROP TABLE IF EXISTS "universities" CASCADE;
DROP TABLE IF EXISTS "innovation_gaps" CASCADE;
DROP TABLE IF EXISTS "challenge_embeddings" CASCADE;
DROP TABLE IF EXISTS "challenge_ai_analysis" CASCADE;
DROP TABLE IF EXISTS "challenges" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Users Table
CREATE TABLE "users" (
  "id" VARCHAR(255) PRIMARY KEY,
  "username" VARCHAR(255) UNIQUE NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "role" VARCHAR(50) NOT NULL, -- 'citizen', 'university_admin', 'government_admin'
  "universityId" VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Challenges Table
CREATE TABLE "challenges" (
  "id" VARCHAR(255) PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "locationName" VARCHAR(255) NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'open', -- 'open', 'assigned', 'completed'
  "createdBy" VARCHAR(255) REFERENCES "users"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Challenge AI Analysis Table
CREATE TABLE "challenge_ai_analysis" (
  "id" VARCHAR(255) PRIMARY KEY,
  "challengeId" VARCHAR(255) UNIQUE REFERENCES "challenges"("id") ON DELETE CASCADE,
  "domain" VARCHAR(255) NOT NULL,
  "subdomain" VARCHAR(255) NOT NULL,
  "problemType" VARCHAR(255) NOT NULL,
  "severity" VARCHAR(50) NOT NULL,
  "affectedPopulation" TEXT NOT NULL,
  "scale" VARCHAR(100) NOT NULL,
  "keyFactors" TEXT[] NOT NULL, -- array of strings
  "missingInformation" TEXT[] NOT NULL, -- array of strings
  "confidence" DOUBLE PRECISION NOT NULL
);

-- Challenge Embeddings Table
-- Note: Using a 384-dimensional vector placeholder (corresponds to sentence-transformers models like all-MiniLM-L6-v2)
-- If moving to an OpenAI model (text-embedding-3-small or text-embedding-ada-002), change vector(384) to vector(1536)
CREATE TABLE "challenge_embeddings" (
  "id" VARCHAR(255) PRIMARY KEY,
  "challengeId" VARCHAR(255) UNIQUE REFERENCES "challenges"("id") ON DELETE CASCADE,
  "embedding" vector(384) NOT NULL
);

-- Innovation Gaps Table
CREATE TABLE "innovation_gaps" (
  "id" VARCHAR(255) PRIMARY KEY,
  "challengeId" VARCHAR(255) REFERENCES "challenges"("id") ON DELETE CASCADE,
  "gapType" VARCHAR(50) NOT NULL, -- 'research', 'technology', 'adaptation', 'data', 'expertise'
  "description" TEXT NOT NULL,
  "rationale" TEXT NOT NULL,
  "recommendedAction" TEXT NOT NULL,
  "requiredExpertise" TEXT[] NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL
);

-- Universities Table
CREATE TABLE "universities" (
  "id" VARCHAR(255) PRIMARY KEY,
  "name" VARCHAR(255) UNIQUE NOT NULL,
  "district" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL
);

-- Departments Table (Optional helper)
CREATE TABLE "departments" (
  "id" VARCHAR(255) PRIMARY KEY,
  "universityId" VARCHAR(255) REFERENCES "universities"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL
);

-- Expertise Tags Table
CREATE TABLE "expertise_tags" (
  "id" VARCHAR(255) PRIMARY KEY,
  "tag" VARCHAR(255) UNIQUE NOT NULL
);

-- University Expertise (Many-to-Many Join)
CREATE TABLE "university_expertise" (
  "id" VARCHAR(255) PRIMARY KEY,
  "universityId" VARCHAR(255) REFERENCES "universities"("id") ON DELETE CASCADE,
  "tagId" VARCHAR(255) REFERENCES "expertise_tags"("id") ON DELETE CASCADE,
  UNIQUE("universityId", "tagId")
);

-- Challenge Assignments
CREATE TABLE "challenge_assignments" (
  "id" VARCHAR(255) PRIMARY KEY,
  "challengeId" VARCHAR(255) REFERENCES "challenges"("id") ON DELETE CASCADE,
  "universityId" VARCHAR(255) REFERENCES "universities"("id") ON DELETE CASCADE,
  "matchScore" DOUBLE PRECISION NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'pending' -- 'pending', 'accepted', 'declined', 'in_progress'
);

-- Projects Table
CREATE TABLE "projects" (
  "id" VARCHAR(255) PRIMARY KEY,
  "challengeId" VARCHAR(255) REFERENCES "challenges"("id") ON DELETE CASCADE,
  "universityId" VARCHAR(255) REFERENCES "universities"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed'
  "facultyLead" VARCHAR(255) NOT NULL
);

-- Project Milestones Table
CREATE TABLE "project_milestones" (
  "id" VARCHAR(255) PRIMARY KEY,
  "projectId" VARCHAR(255) REFERENCES "projects"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "dueDate" TIMESTAMP NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'complete'
  "evidence" TEXT
);
