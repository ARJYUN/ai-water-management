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
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/workloads', require('./routes/workloads'));
app.use('/api/metrics',   require('./routes/metrics'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/optimize',  require('./routes/optimize'));
app.use('/api/policies',  require('./routes/policies'));
app.use('/api/alerts',    require('./routes/alerts'));
app.use('/api/reports',   require('./routes/reports'));
app.use('/api/admin',     require('./routes/admin'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
