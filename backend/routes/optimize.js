const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET /api/optimize — WUE comparison across regions
router.get('/', auth, async (req, res) => {
  const wueData = [
    { region: 'us-central',  wue: 1.1, label: 'US Central' },
    { region: 'asia-east',   wue: 1.3, label: 'Asia East' },
    { region: 'europe-west', wue: 0.9, label: 'Europe West' }
  ];

  try {
    const [avgUsage] = await db.query(`
      SELECT region, AVG(freshwater_liters) as avg_liters, COUNT(*) as workload_count
      FROM water_usage_metrics
      GROUP BY region
    `);

    const enriched = wueData.map(r => {
      const usage = avgUsage.find(u => u.region === r.region) || {};
      return { ...r, avg_liters: usage.avg_liters || 0, workload_count: usage.workload_count || 0 };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/optimize/schedule — reassign workload to lowest-WUE region
router.post('/schedule', auth, role('Admin','DevOps Engineer'), async (req, res) => {
  const { workloadID } = req.body;
  if (!workloadID) return res.status(400).json({ error: 'workloadID required.' });

  // Lowest WUE region = europe-west (0.9)
  const optimalRegion = 'europe-west';

  try {
    const [rows] = await db.query('SELECT * FROM ai_workloads WHERE workloadID = ?', [workloadID]);
    if (rows.length === 0) return res.status(404).json({ error: 'Workload not found.' });

    await db.query(
      'UPDATE ai_workloads SET region = ?, status = ? WHERE workloadID = ?',
      [optimalRegion, 'Queued', workloadID]
    );

    res.json({ message: `Workload reassigned to ${optimalRegion} (WUE: 0.9 L/kWh)`, region: optimalRegion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
