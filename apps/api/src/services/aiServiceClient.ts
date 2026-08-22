import * as dotenv from 'dotenv';
import * as path from 'path';
import { ChallengeAIAnalysis, InnovationGap } from '@siip/types';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export class AIServiceClient {
  static async analyze(id: string, title: string, description: string): Promise<ChallengeAIAnalysis> {
    console.log(`[AI-Client] Requesting /analyze for challenge ${id}`);
    const res = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title, description })
    });
    if (!res.ok) {
      throw new Error(`AI service /analyze failed: ${res.statusText}`);
    }
    return await res.json() as ChallengeAIAnalysis;
  }

  static async getSimilar(challengeId: string, description: string): Promise<Array<{ challengeId: string; score: number }>> {
    console.log(`[AI-Client] Requesting /similarity for challenge ${challengeId}`);
    const res = await fetch(`${AI_SERVICE_URL}/similarity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, description })
    });
    if (!res.ok) {
      throw new Error(`AI service /similarity failed: ${res.statusText}`);
    }
    return await res.json() as Array<{ challengeId: string; score: number }>;
  }

  static async gapAnalysis(challengeId: string, description: string, aiAnalysis?: ChallengeAIAnalysis): Promise<InnovationGap> {
    console.log(`[AI-Client] Requesting /gap-analysis for challenge ${challengeId}`);
    const res = await fetch(`${AI_SERVICE_URL}/gap-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, description, aiAnalysis })
    });
    if (!res.ok) {
      throw new Error(`AI service /gap-analysis failed: ${res.statusText}`);
    }
    return await res.json() as InnovationGap;
  }

  static async getMatches(challengeId: string, description: string, gapAnalysis?: InnovationGap): Promise<Array<{ universityId: string; name: string; matchScore: number }>> {
    console.log(`[AI-Client] Requesting /matches for challenge ${challengeId}`);
    const res = await fetch(`${AI_SERVICE_URL}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, description, gapAnalysis })
    });
    if (!res.ok) {
      throw new Error(`AI service /matches failed: ${res.statusText}`);
    }
    return await res.json() as Array<{ universityId: string; name: string; matchScore: number }>;
  }
}
export default AIServiceClient;
