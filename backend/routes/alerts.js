const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/alerts
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT a.*, w.type as workload_type, w.region FROM alerts a LEFT JOIN ai_workloads w ON a.workloadID = w.workloadID ORDER BY a.triggered_at DESC LIMIT 100'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
