const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/analytics/trends — daily water totals for past 30 days
router.get('/trends', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DATE(recorded_at) as date,
             region,
             SUM(freshwater_liters) as total_liters,
             COUNT(*) as workload_count
      FROM water_usage_metrics
      WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(recorded_at), region
      ORDER BY date ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/correlate — water usage grouped by workload type
router.get('/correlate', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT w.type as workload_type,
             m.region,
             AVG(m.freshwater_liters) as avg_liters,
             SUM(m.freshwater_liters) as total_liters,
             COUNT(*) as count
      FROM water_usage_metrics m
      JOIN ai_workloads w ON m.workloadID = w.workloadID
      GROUP BY w.type, m.region
      ORDER BY w.type, m.region
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/summary — dashboard summary cards
router.get('/summary', auth, async (req, res) => {
  try {
    const [[totalMetrics]] = await db.query('SELECT COUNT(*) as count, SUM(freshwater_liters) as total FROM water_usage_metrics');
    const [[totalWorkloads]] = await db.query('SELECT COUNT(*) as count FROM ai_workloads');
    const [[activeWorkloads]] = await db.query("SELECT COUNT(*) as count FROM ai_workloads WHERE status IN ('Executing','Queued')");
    const [[alertCount]] = await db.query('SELECT COUNT(*) as count FROM alerts');
    const [recentAlerts] = await db.query('SELECT * FROM alerts ORDER BY triggered_at DESC LIMIT 5');

    res.json({
      total_water_liters: totalMetrics.total || 0,
      total_workloads: totalWorkloads.count,
      active_workloads: activeWorkloads.count,
      total_alerts: alertCount.count,
      recent_alerts: recentAlerts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
