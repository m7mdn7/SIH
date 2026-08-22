import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { initDb, query } from './db';
import { AIServiceClient } from './services/aiServiceClient';
import { UserRole, Challenge, ChallengeAIAnalysis, InnovationGap, University, ChallengeAssignment, Project, ProjectMilestone } from '@siip/types';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const app = express();
const PORT = process.env.API_PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_for_hackathon';

// Extend Express Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: UserRole;
    universityId?: string;
  };
}

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Authentication Middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Check Role Middleware Helper
function requireRole(roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied for this role' });
    }
    next();
  };
}

// URL Rewrite Middleware for /api/v1 prefix compatibility
app.use((req, res, next) => {
  if (req.url.startsWith('/api/v1')) {
    req.url = req.url.replace(/^\/api\/v1/, '') || '/';
  }
  next();
});

// ═══════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════

app.post('/auth/register', async (req: Request, res: Response) => {
  const { fullName, email, password, role, universityId } = req.body;
  const username = req.body.username || email || fullName;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required registration fields' });
  }

  try {
    const existing = await query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existing.length > 0) {
      const user = existing[0];
      const hashedPassword = await bcrypt.hash(password, 10);
      await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role, universityId: user.universityId }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, universityId: user.universityId }, data: { token, user } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr_${crypto.randomUUID().substring(0, 8)}`;
    
    await query(
      'INSERT INTO users (id, username, email, password, role, "universityId") VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, username, email, hashedPassword, role, universityId || null]
    );

    const token = jwt.sign({ id: userId, username, role, universityId }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, user: { id: userId, username, email, role, universityId }, data: { token, user: { id: userId, username, email, role, universityId } }, message: 'Registered successfully' });
  } catch (err: any) {
    console.error('Registration failed:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

app.post('/auth/login', async (req: Request, res: Response) => {
  const { username: rawUsername, email, password } = req.body;
  const searchField = rawUsername || email;

  if (!searchField || !password) {
    return res.status(400).json({ error: 'Username/email and password required' });
  }

  try {
    const users = await query('SELECT * FROM users WHERE username = $1 OR email = $2', [searchField, searchField]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, universityId: user.universityId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, universityId: user.universityId },
      data: { token, user: { id: user.id, username: user.username, email: user.email, role: user.role, universityId: user.universityId } }
    });
  } catch (err: any) {
    console.error('Login failed:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// ═══════════════════════════════════════════════════════════════
// CHALLENGES ROUTES
// ═══════════════════════════════════════════════════════════════

app.get('/challenges', async (req: Request, res: Response) => {
  try {
    const challenges = await query('SELECT * FROM challenges ORDER BY "createdAt" DESC');
    return res.json(challenges);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

app.post('/challenges', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, latitude, longitude, locationName } = req.body;
  if (!title || !description || latitude === undefined || longitude === undefined || !locationName) {
    return res.status(400).json({ error: 'Missing challenge submission fields' });
  }

  try {
    const challengeId = `ch_${crypto.randomUUID().substring(0, 8)}`;
    const createdBy = req.user?.id || 'usr_citizen';
    
    await query(
      'INSERT INTO challenges (id, title, description, latitude, longitude, "locationName", status, "createdBy") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [challengeId, title, description, latitude, longitude, locationName, 'open', createdBy]
    );

    const result = await query('SELECT * FROM challenges WHERE id = $1', [challengeId]);
    const created = result[0];
    return res.status(201).json({ ...created, data: created, message: 'Challenge created successfully' });
  } catch (err) {
    console.error('Failed to create challenge:', err);
    return res.status(500).json({ error: 'Failed to submit challenge' });
  }
});

app.get('/challenges/:id', async (req: Request, res: Response) => {
  try {
    const challenges = await query('SELECT * FROM challenges WHERE id = $1', [req.params.id]);
    if (challenges.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    return res.json(challenges[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch challenge details' });
  }
});

// AI Pipeline Endpoint: Analyze Challenge
app.post('/challenges/:id/analyze', authenticateToken, async (req: Request, res: Response) => {
  try {
    const challengeId = req.params.id;
    const challenges = await query('SELECT * FROM challenges WHERE id = $1', [challengeId]);
    if (challenges.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    const challenge = challenges[0];
    
    // Check if already analyzed
    const existingAnalysis = await query('SELECT * FROM challenge_ai_analysis WHERE "challengeId" = $1', [challengeId]);
    if (existingAnalysis.length > 0) {
      return res.json(existingAnalysis[0]);
    }

    // Call FastAPI AI service
    const analysis = await AIServiceClient.analyze(challenge.id, challenge.title, challenge.description);
    
    // Save to Database
    await query(
      'INSERT INTO challenge_ai_analysis (id, "challengeId", domain, subdomain, "problemType", severity, "affectedPopulation", scale, "keyFactors", "missingInformation", confidence) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [
        analysis.id,
        analysis.challengeId,
        analysis.domain,
        analysis.subdomain,
        analysis.problemType,
        analysis.severity,
        analysis.affectedPopulation,
        analysis.scale,
        analysis.keyFactors,
        analysis.missingInformation,
        analysis.confidence
      ]
    );

    // Seed dummy embedding
    await query(
      'INSERT INTO challenge_embeddings (id, "challengeId", embedding) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [`emb_${analysis.id.substring(3)}`, challengeId, []]
    );

    return res.json(analysis);
  } catch (err: any) {
    console.error('AI Analysis failed:', err.message);
    return res.status(500).json({ error: `AI analysis failed: ${err.message}` });
  }
});

// AI Pipeline Endpoint: Find Similar Challenges
app.get('/challenges/:id/similar', async (req: Request, res: Response) => {
  try {
    const challengeId = req.params.id;
    const challenges = await query('SELECT * FROM challenges WHERE id = $1', [challengeId]);
    if (challenges.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Proxy call to FastAPI for similarity check
    const matches = await AIServiceClient.getSimilar(challengeId, challenges[0].description);
    if (matches.length === 0) {
      return res.json([]);
    }

    const matchIds = matches.map(m => m.challengeId);
    
    // Fetch matching challenge details
    // Build SQL query for dynamic match IDs
    const placeholders = matchIds.map((_, i) => `$${i + 1}`).join(',');
    const matchingChallenges = await query(`SELECT * FROM challenges WHERE id IN (${placeholders})`, matchIds);

    const scoredChallenges = matchingChallenges.map(c => {
      const match = matches.find(m => m.challengeId === c.id);
      return {
        ...c,
        similarityScore: match ? match.score : 0
      };
    }).sort((a, b) => b.similarityScore - a.similarityScore);

    return res.json(scoredChallenges);
  } catch (err: any) {
    console.error('Similarity search failed:', err);
    return res.status(500).json({ error: `Similarity search failed: ${err.message}` });
  }
});

// AI Pipeline Endpoint: Innovation Gap Analysis
app.post('/challenges/:id/gap-analysis', authenticateToken, async (req: Request, res: Response) => {
  try {
    const challengeId = req.params.id;
    const challenges = await query('SELECT * FROM challenges WHERE id = $1', [challengeId]);
    if (challenges.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const challenge = challenges[0];
    
    // Check if gap analysis already exists
    const existingGap = await query('SELECT * FROM innovation_gaps WHERE "challengeId" = $1', [challengeId]);
    if (existingGap.length > 0) {
      return res.json(existingGap[0]);
    }

    // Fetch AI Analysis if available
    const analyses = await query('SELECT * FROM challenge_ai_analysis WHERE "challengeId" = $1', [challengeId]);
    const aiAnalysis = analyses.length > 0 ? analyses[0] : undefined;

    // Call FastAPI AI service
    const gap = await AIServiceClient.gapAnalysis(challengeId, challenge.description, aiAnalysis);

    // Save to Database
    await query(
      'INSERT INTO innovation_gaps (id, "challengeId", "gapType", description, rationale, "recommendedAction", "requiredExpertise", confidence) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        gap.id,
        gap.challengeId,
        gap.gapType,
        gap.description,
        gap.rationale,
        gap.recommendedAction,
        gap.requiredExpertise,
        gap.confidence
      ]
    );

    return res.json(gap);
  } catch (err: any) {
    console.error('Gap analysis failed:', err);
    return res.status(500).json({ error: `Gap analysis failed: ${err.message}` });
  }
});

// AI Pipeline Endpoint: Fetch Matches
app.get('/challenges/:id/matches', async (req: Request, res: Response) => {
  try {
    const challengeId = req.params.id;
    const challenges = await query('SELECT * FROM challenges WHERE id = $1', [challengeId]);
    if (challenges.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Fetch existing assignments first
    const existingMatches = await query(
      'SELECT a.*, u.name as "universityName" FROM challenge_assignments a JOIN universities u ON a."universityId" = u.id WHERE a."challengeId" = $1',
      [challengeId]
    );
    
    if (existingMatches.length > 0) {
      return res.json(existingMatches);
    }

    // Fetch gap analysis to provide matching context
    const gaps = await query('SELECT * FROM innovation_gaps WHERE "challengeId" = $1', [challengeId]);
    const gapAnalysis = gaps.length > 0 ? gaps[0] : undefined;

    // Call FastAPI matches endpoint
    const matches = await AIServiceClient.getMatches(challengeId, challenges[0].description, gapAnalysis);

    const generatedAssignments: any[] = [];
    for (const match of matches) {
      const assignmentId = `as_${crypto.randomUUID().substring(0, 8)}`;
      await query(
        'INSERT INTO challenge_assignments (id, "challengeId", "universityId", "matchScore", status) VALUES ($1, $2, $3, $4, $5)',
        [assignmentId, challengeId, match.universityId, match.matchScore, 'pending']
      );
      generatedAssignments.push({
        id: assignmentId,
        challengeId,
        universityId: match.universityId,
        universityName: match.name,
        matchScore: match.matchScore,
        status: 'pending'
      });
    }

    return res.json(generatedAssignments);
  } catch (err: any) {
    console.error('Matching failed:', err);
    return res.status(500).json({ error: `Matching failed: ${err.message}` });
  }
});

// ═══════════════════════════════════════════════════════════════
// ASSIGNMENT AND PROJECT ROUTES
// ═══════════════════════════════════════════════════════════════

app.post('/assignments', authenticateToken, requireRole(['government_admin']), async (req: Request, res: Response) => {
  const { challengeId, universityId, matchScore } = req.body;
  if (!challengeId || !universityId || !matchScore) {
    return res.status(400).json({ error: 'Missing required assignment fields' });
  }

  try {
    const assignmentId = `as_${crypto.randomUUID().substring(0, 8)}`;
    await query(
      'INSERT INTO challenge_assignments (id, "challengeId", "universityId", "matchScore", status) VALUES ($1, $2, $3, $4, $5)',
      [assignmentId, challengeId, universityId, matchScore, 'pending']
    );
    const result = await query('SELECT * FROM challenge_assignments WHERE id = $1', [assignmentId]);
    return res.status(201).json(result[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create assignment' });
  }
});

app.post('/assignments/:id/accept', authenticateToken, requireRole(['university_admin']), async (req: AuthenticatedRequest, res: Response) => {
  const assignmentId = req.params.id;
  const userUniversityId = req.user?.universityId;

  try {
    const assignments = await query('SELECT * FROM challenge_assignments WHERE id = $1', [assignmentId]);
    if (assignments.length === 0) {
      return res.status(404).json({ error: 'Assignment match not found' });
    }

    const assignment = assignments[0];
    if (userUniversityId && assignment.universityId !== userUniversityId) {
      return res.status(403).json({ error: 'Unauthorized: This match belongs to another university' });
    }

    // Begin updates
    // Update assignment status to 'accepted'
    await query('UPDATE challenge_assignments SET status = $1 WHERE id = $2', ['accepted', assignmentId]);
    // Decline other assignments for this challenge
    await query('UPDATE challenge_assignments SET status = $1 WHERE "challengeId" = $2 AND id <> $3', ['declined', assignment.challengeId, assignmentId]);
    // Update challenge status to 'assigned'
    await query('UPDATE challenges SET status = $1 WHERE id = $2', ['assigned', assignment.challengeId]);

    // Fetch challenge details for project setup
    const challenges = await query('SELECT * FROM challenges WHERE id = $1', [assignment.challengeId]);
    const challenge = challenges[0];

    // Create a new Project
    const projectId = `proj_${crypto.randomUUID().substring(0, 8)}`;
    const projectTitle = `SIIP Solutions: ${challenge.title}`;
    await query(
      'INSERT INTO projects (id, "challengeId", "universityId", title, description, status, "facultyLead") VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        projectId,
        assignment.challengeId,
        assignment.universityId,
        projectTitle,
        `Project established by State University to address citizen report: "${challenge.description}"`,
        'in_progress',
        'Dr. Jane Smith (Dept of Innovation)'
      ]
    );

    // Create default initial milestone
    const milestoneId = `ms_${crypto.randomUUID().substring(0, 8)}`;
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    await query(
      'INSERT INTO project_milestones (id, "projectId", title, description, "dueDate", status) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        milestoneId,
        projectId,
        'Phase 1: Project Plan & Team Formulation',
        'Define deliverables, assign students/faculty, and establish work schedule.',
        oneMonthLater.toISOString(),
        'pending'
      ]
    );

    const project = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
    const milestones = await query('SELECT * FROM project_milestones WHERE "projectId" = $1', [projectId]);

    return res.json({
      message: 'Assignment accepted, project and milestone created.',
      assignmentStatus: 'accepted',
      project: project[0],
      milestones
    });
  } catch (err) {
    console.error('Accept assignment failed:', err);
    return res.status(500).json({ error: 'Failed to accept assignment' });
  }
});

// Projects
app.get('/projects', async (req: Request, res: Response) => {
  try {
    const projects = await query(`
      SELECT p.*, c.title as "challengeTitle", u.name as "universityName"
      FROM projects p
      JOIN challenges c ON p."challengeId" = c.id
      JOIN universities u ON p."universityId" = u.id
    `);
    return res.json(projects);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/projects', authenticateToken, async (req: Request, res: Response) => {
  const { challengeId, universityId, title, description, facultyLead } = req.body;
  try {
    const id = `proj_${crypto.randomUUID().substring(0, 8)}`;
    await query(
      'INSERT INTO projects (id, "challengeId", "universityId", title, description, status, "facultyLead") VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, challengeId, universityId, title, description, 'in_progress', facultyLead]
    );
    const proj = await query('SELECT * FROM projects WHERE id = $1', [id]);
    return res.status(201).json(proj[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create project' });
  }
});

app.get('/projects/:id/milestones', async (req: Request, res: Response) => {
  try {
    const milestones = await query('SELECT * FROM project_milestones WHERE "projectId" = $1 ORDER BY "dueDate" ASC', [req.params.id]);
    return res.json(milestones);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

app.post('/projects/:id/milestones', authenticateToken, async (req: Request, res: Response) => {
  const { title, description, dueDate } = req.body;
  const projectId = req.params.id;
  try {
    const milestoneId = `ms_${crypto.randomUUID().substring(0, 8)}`;
    await query(
      'INSERT INTO project_milestones (id, "projectId", title, description, "dueDate", status) VALUES ($1, $2, $3, $4, $5, $6)',
      [milestoneId, projectId, title, description, dueDate, 'pending']
    );
    const ms = await query('SELECT * FROM project_milestones WHERE id = $1', [milestoneId]);
    return res.status(201).json(ms[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create milestone' });
  }
});

// Update Milestone Status / Submit evidence
app.post('/project-milestones/:id/complete', authenticateToken, async (req: Request, res: Response) => {
  const { evidence } = req.body;
  try {
    await query(
      'UPDATE project_milestones SET status = $1, evidence = $2 WHERE id = $3',
      ['complete', evidence || 'Evidence submitted.', req.params.id]
    );
    const ms = await query('SELECT * FROM project_milestones WHERE id = $1', [req.params.id]);
    return res.json(ms[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to complete milestone' });
  }
});

// ═══════════════════════════════════════════════════════════════
// ANALYTICS OVERVIEW ROUTE
// ═══════════════════════════════════════════════════════════════

app.get('/analytics/overview', async (req: Request, res: Response) => {
  try {
    const chCounts = await query('SELECT COUNT(*) as count FROM challenges');
    const totalChallenges = Number(chCounts[0]?.count || 0);

    const userCounts = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = Number(userCounts[0]?.count || 0);

    const projCounts = await query('SELECT COUNT(*) as count FROM projects');
    const totalProjects = Number(projCounts[0]?.count || 0);

    const statusCounts = await query('SELECT status, COUNT(*) as count FROM challenges GROUP BY status');
    const statusBreakdown: Record<string, number> = {};
    for (const row of statusCounts) {
      statusBreakdown[row.status] = Number(row.count);
    }

    const domains = await query(`
      SELECT domain, COUNT(*) as count 
      FROM challenge_ai_analysis 
      GROUP BY domain
    `);

    const gaps = await query(`
      SELECT "gapType", COUNT(*) as count 
      FROM innovation_gaps 
      GROUP BY "gapType"
    `);

    const assignments = await query(`
      SELECT status, COUNT(*) as count 
      FROM challenge_assignments 
      GROUP BY status
    `);

    const payload = {
      totalChallenges,
      totalUsers,
      totalProjects,
      statusBreakdown,
      domainDistribution: domains.map(d => ({ name: d.domain, value: Number(d.count) })),
      gapDistribution: gaps.map(g => ({ name: g.gapType, value: Number(g.count) })),
      assignmentStatus: assignments.map(a => ({ name: a.status, value: Number(a.count) }))
    };

    return res.json({ ...payload, data: payload });
  } catch (err) {
    console.error('Analytics aggregation failed:', err);
    return res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

app.get('/analytics/districts', async (req: Request, res: Response) => {
  try {
    const districtCounts = await query(`
      SELECT "locationName", COUNT(*) as count 
      FROM challenges 
      GROUP BY "locationName"
    `);

    const districts = districtCounts.map(d => ({
      district: d.locationName,
      challengesCount: Number(d.count),
    }));

    return res.json({ data: districts, districts });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch district analytics' });
  }
});

// ═══════════════════════════════════════════════════════════════
// STARTUP AND INITIALIZATION
// ═══════════════════════════════════════════════════════════════

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`[API] Server is listening at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('API Server failed to start:', err);
    process.exit(1);
  }
}

start();
