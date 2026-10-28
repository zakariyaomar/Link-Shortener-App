// server/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');
const redirectRoute = require('./routes/redirect');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);

// Redirect route (must be after API routes)
app.use('/', redirectRoute);

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});