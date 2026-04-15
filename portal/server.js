const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const complaintRoutes = require('./src/routes/complaints');
const spaceRoutes = require('./src/routes/spaces');
const staffRoutes = require('./src/routes/staff');
const adminRoutes = require('./src/routes/admin');
const errorHandler = require('./src/middleware/errorHandler');

const seedAdminUser = require('./src/utils/seedAdmin');
const seedStudentUser = require('./src/utils/seedStudent');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json());

// Log incoming hits exactly
app.use((req, res, next) => {
  console.log("REQUEST HIT:", req.originalUrl);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Only seed in development/test environments — never in production
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    await Promise.all([seedAdminUser(), seedStudentUser()]);
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

