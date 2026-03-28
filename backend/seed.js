require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const regions = [
  { name: 'us-central',   wue: 1.1 },
  { name: 'asia-east',    wue: 1.3 },
  { name: 'europe-west',  wue: 0.9 }
];

const workloadTypes = ['training', 'inference', 'scaling'];
const statuses = ['Completed', 'Failed', 'Executing', 'Queued'];
const sources = ['AI Data Center', 'Cooling Subsystem', 'Cloud Infrastructure'];

const kwhByType = { training: 400, inference: 100, scaling: 200 };

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await db.query('SET FOREIGN_KEY_CHECKS = 0');
  await db.query('TRUNCATE TABLE reports');
  await db.query('TRUNCATE TABLE alerts');
  await db.query('TRUNCATE TABLE water_usage_metrics');
  await db.query('TRUNCATE TABLE water_policies');
  await db.query('TRUNCATE TABLE ai_workloads');
  await db.query('TRUNCATE TABLE stakeholders');
  await db.query('SET FOREIGN_KEY_CHECKS = 1');

  // Seed stakeholders
  const users = [
    { name: 'Alice Admin',    email: 'admin@water.ai',         role: 'Admin' },
    { name: 'Dave DevOps',    email: 'devops@water.ai',        role: 'DevOps Engineer' },
    { name: 'Susan Sustain',  email: 'sustain@water.ai',       role: 'Sustainability Officer' },
    { name: 'Victor Viewer',  email: 'viewer@water.ai',        role: 'Viewer' }
  ];

  const password = await bcrypt.hash('password123', 10);
  const userMap = {};

  for (const u of users) {
    const id = uuidv4();
    userMap[u.role] = id;
    await db.query(
      'INSERT INTO stakeholders (userID, name, email, password_hash, role) VALUES (?,?,?,?,?)',
      [id, u.name, u.email, password, u.role]
    );
  }
  console.log('✅ Stakeholders seeded (password: password123)');

  // Seed water policies
  for (const r of regions) {
    await db.query(
      'INSERT INTO water_policies (policyID, region, threshold_liters) VALUES (?,?,?)',
      [uuidv4(), r.name, 5000]
    );
  }
  console.log('✅ Water policies seeded');

  // Seed workloads + metrics for past 30 days
  const workloadIDs = [];
  const now = new Date();

  for (let day = 29; day >= 0; day--) {
    const date = new Date(now);
    date.setDate(now.getDate() - day);

    for (let i = 0; i < 5; i++) {
      const wType = workloadTypes[Math.floor(Math.random() * workloadTypes.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const wID = uuidv4();
      const retries = status === 'Aborted' ? 3 : Math.floor(Math.random() * 3);

      await db.query(
        `INSERT INTO ai_workloads (workloadID, type, status, region, retry_count, submitted_at, updated_at)
         VALUES (?,?,?,?,?,?,?)`,
        [wID, wType, status, region.name, retries, date, date]
      );

      // Simulate water usage
      const baseKwh = kwhByType[wType];
      const kwh = randomBetween(baseKwh * 0.8, baseKwh * 1.2);
      const liters = +(kwh * region.wue).toFixed(2);
      const source = sources[Math.floor(Math.random() * sources.length)];
      const mID = uuidv4();

      await db.query(
        `INSERT INTO water_usage_metrics (metricID, workloadID, freshwater_liters, region, source, recorded_at)
         VALUES (?,?,?,?,?,?)`,
        [mID, wID, liters, region.name, source, date]
      );

      workloadIDs.push({ wID, region: region.name, liters });
    }
  }
  console.log('✅ Workloads & metrics seeded (150 records each)');

  // Seed some alerts for exceeded workloads
  const highUsage = workloadIDs.filter(w => w.liters > 450).slice(0, 10);
  for (const w of highUsage) {
    await db.query(
      'INSERT INTO alerts (alertID, workloadID, message) VALUES (?,?,?)',
      [uuidv4(), w.wID, `Water usage of ${w.liters}L in ${w.region} exceeded policy threshold.`]
    );
  }
  console.log('✅ Alerts seeded');

  // Seed a sample report
  const adminID = userMap['Admin'];
  await db.query(
    'INSERT INTO reports (reportID, generated_by, content) VALUES (?,?,?)',
    [uuidv4(), adminID, JSON.stringify({ summary: 'Initial seeded report — 30-day water usage baseline established.', totalMetrics: 150, regions: ['us-central','asia-east','europe-west'] })]
  );
  console.log('✅ Reports seeded');

  console.log('\n🎉 Seed complete! Login credentials:');
  console.log('  admin@water.ai       / password123 (Admin)');
  console.log('  devops@water.ai      / password123 (DevOps Engineer)');
  console.log('  sustain@water.ai     / password123 (Sustainability Officer)');
  console.log('  viewer@water.ai      / password123 (Viewer)');

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
