const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET /api/policies
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM water_policies ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/policies
router.post('/', auth, role('Admin','Sustainability Officer'), async (req, res) => {
  const { region, threshold_liters } = req.body;
  if (!region || !threshold_liters)
    return res.status(400).json({ error: 'region and threshold_liters required.' });

  try {
    // Upsert: update if region exists
    const [existing] = await db.query('SELECT policyID FROM water_policies WHERE region = ?', [region]);
    if (existing.length > 0) {
      await db.query('UPDATE water_policies SET threshold_liters = ? WHERE region = ?', [threshold_liters, region]);
      return res.json({ message: `Policy updated for ${region}.` });
    }
    await db.query(
      'INSERT INTO water_policies (policyID, region, threshold_liters) VALUES (?,?,?)',
      [uuidv4(), region, threshold_liters]
    );
    res.status(201).json({ message: `Policy created for ${region}.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
