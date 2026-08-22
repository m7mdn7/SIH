import { db } from './client.js';
import { roles, users, challenges } from './schema/index.js';
import bcrypt from 'bcryptjs';

async function seedPostGISData() {
  console.log('🌱 Seeding real PostGIS database records for Jharkhand map...');

  // 1. Seed Roles
  const [citizenRole] = await db
    .insert(roles)
    .values({ name: 'CITIZEN', description: 'Citizen role' })
    .onConflictDoNothing()
    .returning();

  const [govRole] = await db
    .insert(roles)
    .values({ name: 'GOVERNMENT_ADMIN', description: 'Government admin role' })
    .onConflictDoNothing()
    .returning();

  // 2. Seed Admin & Citizen Users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  let userId = 'dev-user-id';

  if (citizenRole) {
    const [demoUser] = await db
      .insert(users)
      .values({
        fullName: 'Ramesh Jharkhand',
        email: 'ramesh@example.com',
        passwordHash,
        roleId: citizenRole.id,
        district: 'Ranchi',
      })
      .onConflictDoNothing()
      .returning();

    if (demoUser) userId = demoUser.id;
  }

  // 3. Seed Real PostGIS Challenge Locations across Jharkhand
  const realChallenges = [
    {
      title: 'Heavy rainfall flooded village and damaged bridge',
      description: 'Continuous downpour for the last 48 hours has caused the local river to overflow. The main bridge connecting Ramgarh to the highway is structurally damaged.',
      domain: 'INFRASTRUCTURE' as const,
      priority: 'CRITICAL' as const,
      district: 'Ramgarh',
      locationName: 'Ramgarh Highway Bridge',
      latitude: 23.6331,
      longitude: 85.5149,
      creatorId: userId,
    },
    {
      title: 'Contaminated drinking water supply in Ward 12',
      description: 'The primary well in the eastern block is showing signs of contamination. Several residents reported stomach issues.',
      domain: 'WATER_SANITATION' as const,
      priority: 'HIGH' as const,
      district: 'Ranchi',
      locationName: 'Harmu Colony Ward 12',
      latitude: 23.3441,
      longitude: 85.3096,
      creatorId: userId,
    },
    {
      title: 'Crop failure due to unknown pest outbreak',
      description: 'Over 200 acres of paddy crops affected by unclassified insect swarm across Dhanbad agricultural block.',
      domain: 'AGRICULTURE' as const,
      priority: 'HIGH' as const,
      district: 'Dhanbad',
      locationName: 'Dhanbad Agriculture Belt',
      latitude: 23.7957,
      longitude: 86.4304,
      creatorId: userId,
    },
    {
      title: 'Primary healthcare clinic doctor & medicine shortage',
      description: 'Local primary health center lacks essential emergency medicines and attending medical officers for 3 weeks.',
      domain: 'HEALTHCARE' as const,
      priority: 'MEDIUM' as const,
      district: 'East Singhbhum',
      locationName: 'Jamshedpur Rural Health Center',
      latitude: 22.8046,
      longitude: 86.2029,
      creatorId: userId,
    },
    {
      title: 'Primary school building roof structural leak',
      description: 'Heavy rain leaking through main classroom ceiling creating hazard during school hours.',
      domain: 'EDUCATION' as const,
      priority: 'LOW' as const,
      district: 'Hazaribagh',
      locationName: 'Hazaribagh Government Primary School',
      latitude: 23.9925,
      longitude: 85.3644,
      creatorId: userId,
    },
  ];

  for (const item of realChallenges) {
    await db.insert(challenges).values(item).onConflictDoNothing();
  }

  console.log('✅ Real PostGIS map records seeded successfully!');
  process.exit(0);
}

seedPostGISData().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
