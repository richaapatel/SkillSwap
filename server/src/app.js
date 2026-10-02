const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const skillRoutes = require('./routes/skillRoutes');
const userRoutes = require('./routes/userRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const matchRoutes = require('./routes/matchRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/matches', matchRoutes);

module.exports = app;
