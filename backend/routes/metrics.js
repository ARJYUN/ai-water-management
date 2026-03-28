const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/metrics?region=&startDate=&endDate=
router.get('/', auth, async (req, res) => {
  const { region, startDate, endDate } = req.query;
  let query = 'SELECT m.*, w.type as workload_type, w.status FROM water_usage_metrics m LEFT JOIN ai_workloads w ON m.workloadID = w.workloadID WHERE 1=1';
  const params = [];

  if (region) { query += ' AND m.region = ?'; params.push(region); }
  if (startDate) { query += ' AND DATE(m.recorded_at) >= ?'; params.push(startDate); }
  if (endDate) { query += ' AND DATE(m.recorded_at) <= ?'; params.push(endDate); }

  query += ' ORDER BY m.recorded_at DESC LIMIT 500';

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/metrics
router.post('/', auth, async (req, res) => {
  const { workloadID, freshwater_liters, region, source } = req.body;
  if (!workloadID || !freshwater_liters || !region || !source)
    return res.status(400).json({ error: 'All fields required.' });

  try {
    const id = uuidv4();
    await db.query(
      'INSERT INTO water_usage_metrics (metricID, workloadID, freshwater_liters, region, source) VALUES (?,?,?,?,?)',
      [id, workloadID, freshwater_liters, region, source]
    );
    res.status(201).json({ message: 'Metric recorded.', metricID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
