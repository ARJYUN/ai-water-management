const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET /api/admin/users — Admin only
router.get('/users', auth, role('Admin'), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT userID, name, email, role, created_at FROM stakeholders ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/role — Admin only
router.patch('/users/:id/role', auth, role('Admin'), async (req, res) => {
  const { role: newRole } = req.body;
  const validRoles = ['Admin','DevOps Engineer','Sustainability Officer','Viewer'];
  if (!validRoles.includes(newRole)) return res.status(400).json({ error: 'Invalid role.' });

  try {
    await db.query('UPDATE stakeholders SET role = ? WHERE userID = ?', [newRole, req.params.id]);
    res.json({ message: 'Role updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id — Admin only
router.delete('/users/:id', auth, role('Admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM stakeholders WHERE userID = ?', [req.params.id]);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
