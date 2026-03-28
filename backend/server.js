require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Health Check for verification
app.get('/api/health', (req, res) => res.json({ status: 'UP', message: 'WaterAI API is online' }));
app.get('/api/auth/profile', (req, res) => res.status(401).json({ error: 'No token provided' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workloads', require('./routes/workloads'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/optimize', require('./routes/optimize'));
app.use('/api/policies', require('./routes/policies'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Auto-Initialize Database (Schema + Seed)
  try {
    const db = require('./config/db');
    const fs = require('fs');
    const path = require('path');

    // Check if tables exist
    const [tables] = await db.query("SHOW TABLES LIKE 'stakeholders'");
    
    if (tables.length === 0) {
      console.log('📭 Database is empty. Initializing schema step-by-step...');
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolon, but be careful with newlines
      const statements = schemaSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && 
                     !s.toUpperCase().startsWith('CREATE DATABASE') && 
                     !s.toUpperCase().startsWith('USE'));

      for (const statement of statements) {
        try {
          await db.query(statement);
        } catch (sErr) {
          // Ignore "Table already exists" if it happens during partial init
          if (!sErr.message.includes('already exists')) {
            throw sErr;
          }
        }
      }
      console.log('✅ Schema initialized successfully.');
    }

    // Auto-seed if needed
    const [rows] = await db.query('SELECT COUNT(*) as count FROM stakeholders');
    if (rows[0].count === 0) {
      console.log('🌱 No data found. Starting auto-seed...');
      const seed = require('./seed');
      await seed(true); 
    }
  } catch (err) {
    console.error('⚠️ Database Initialization Error:', err.message);
  }
});
