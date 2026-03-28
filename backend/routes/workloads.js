const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET /api/workloads
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM ai_workloads ORDER BY submitted_at DESC LIMIT 200'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workloads
router.post('/', auth, role('Admin','DevOps Engineer'), async (req, res) => {
  const { type, region } = req.body;
  if (!type || !region) return res.status(400).json({ error: 'type and region required.' });

  const validTypes = ['training','inference','scaling'];
  if (!validTypes.includes(type)) return res.status(400).json({ error: 'Invalid workload type.' });

  try {
    const id = uuidv4();
    await db.query(
      'INSERT INTO ai_workloads (workloadID, type, status, region) VALUES (?,?,?,?)',
      [id, type, 'Submitted', region]
    );
    res.status(201).json({ message: 'Workload submitted.', workloadID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/workloads/:id/status
router.patch('/:id/status', auth, role('Admin','DevOps Engineer'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Submitted','Queued','Executing','Completed','Failed','Aborted','PausedForOptimization','Deferred'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status.' });

  try {
    const [rows] = await db.query('SELECT * FROM ai_workloads WHERE workloadID = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Workload not found.' });
    const workload = rows[0];

    let newStatus = status;
    let newRetry = workload.retry_count;

    // State machine logic
    if (status === 'Executing') {
      // Check water policy
      const [policies] = await db.query(
        'SELECT threshold_liters FROM water_policies WHERE region = ?', [workload.region]
      );
      if (policies.length > 0) {
        const kwhByType = { training: 400, inference: 100, scaling: 200 };
        const wueByRegion = { 'us-central': 1.1, 'asia-east': 1.3, 'europe-west': 0.9 };
        const estimatedLiters = (kwhByType[workload.type] || 200) * (wueByRegion[workload.region] || 1.1);
        if (estimatedLiters > policies[0].threshold_liters) {
          newStatus = 'PausedForOptimization';
          await db.query(
            'INSERT INTO alerts (alertID, workloadID, message) VALUES (?,?,?)',
            [uuidv4(), id, `Workload ${id} paused: estimated water usage ${estimatedLiters.toFixed(0)}L exceeds threshold of ${policies[0].threshold_liters}L in ${workload.region}.`]
          );
        }
      }
    }

    if (status === 'Failed') {
      if (workload.retry_count < 3) {
        newStatus = 'Queued';
        newRetry = workload.retry_count + 1;
      } else {
        newStatus = 'Aborted';
      }
    }

    await db.query(
      'UPDATE ai_workloads SET status = ?, retry_count = ? WHERE workloadID = ?',
      [newStatus, newRetry, id]
    );
    res.json({ message: `Status updated to ${newStatus}`, workloadID: id, status: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
