const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET /api/reports
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, s.name as generated_by_name, s.role as generated_by_role
      FROM reports r
      LEFT JOIN stakeholders s ON r.generated_by = s.userID
      ORDER BY r.generated_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reports/generate
router.post('/generate', auth, role('Admin','DevOps Engineer','Sustainability Officer'), async (req, res) => {
  try {
    const [[totalMetrics]] = await db.query('SELECT COUNT(*) as count, SUM(freshwater_liters) as total FROM water_usage_metrics');
    const [[totalWorkloads]] = await db.query('SELECT COUNT(*) as count FROM ai_workloads');
    const [[alertCount]] = await db.query('SELECT COUNT(*) as count FROM alerts');
    const [byRegion] = await db.query('SELECT region, SUM(freshwater_liters) as total FROM water_usage_metrics GROUP BY region');
    const [byType] = await db.query('SELECT w.type, SUM(m.freshwater_liters) as total FROM water_usage_metrics m JOIN ai_workloads w ON m.workloadID = w.workloadID GROUP BY w.type');

    const content = JSON.stringify({
      generated_at: new Date().toISOString(),
      total_water_liters: totalMetrics.total || 0,
      total_workloads: totalWorkloads.count,
      total_alerts: alertCount.count,
      by_region: byRegion,
      by_workload_type: byType
    }, null, 2);

    const id = uuidv4();
    await db.query(
      'INSERT INTO reports (reportID, generated_by, content) VALUES (?,?,?)',
      [id, req.user.userID, content]
    );

    res.status(201).json({ message: 'Report generated.', reportID: id, content: JSON.parse(content) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
