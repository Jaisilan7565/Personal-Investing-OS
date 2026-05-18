require('dotenv').config();
const dns = require('dns');
// Override DNS resolvers for the Node process to prevent Atlas querySrv ECONNREFUSED errors
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('DNS server override failed, using default system resolver.');
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middlewares
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim().replace(/^['"]|['"]$/g, ''))
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Auto-allow local development loopbacks (localhost and 127.0.0.1)
    const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    
    if (isLocal || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: Origin ${origin} not in allowed list:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.json());

const { sendSuccess, sendError } = require('./utils/apiResponse');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger.json');

// Serve Interactive Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Simple Health Check Endpoint
app.get('/', (req, res) => {
  sendSuccess(res, {
    data: { version: '1.0.0' },
    message: 'Personal Investing OS API is running live!',
  });
});

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/journals', require('./routes/journalRoutes'));
app.use('/api/v1/decisions', require('./routes/decisionRoutes'));
app.use('/api/v1/watchlist', require('./routes/watchlistRoutes'));
app.use('/api/v1/learning', require('./routes/learningRoutes'));
app.use('/api/v1/analytics', require('./routes/analyticsRoutes'));
app.use('/api/v1/ai', require('./routes/aiRoutes'));
app.use('/api/v1/strategies', require('./routes/strategyRoutes'));

// 404 Route handler
app.use((req, res, next) => {
  sendError(res, {
    message: `Route not found: ${req.originalUrl}`,
    statusCode: 404,
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  sendError(res, {
    message: err.message || 'Internal Server Error',
    statusCode: err.status || 500,
    errors: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
