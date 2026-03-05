const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const { connectRabbitMQ } = require('./config/rabbitmq');
const { rateLimiter } = require('./middlewares/rateLimiter');
const activityRoutes = require('./routes/activityRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3000;
const RABBITMQ_QUEUE = process.env.RABBITMQ_QUEUE || 'user_activities';

// Connection state
let rabbitMQConnected = false;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

// Middleware
app.use(helmet());
app.use(cors());

// Apply rate limiting to all API routes (but not health check)
app.use('/api', rateLimiter);

app.use(express.json());

// Health check endpoint (excluded from rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'api',
    rabbitmq: rabbitMQConnected ? 'connected' : 'disconnected',
    connectionAttempts,
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/v1', activityRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

/**
 * Connect to RabbitMQ with retry logic
 */
const connectWithRetry = async () => {
  try {
    console.log(`📡 Connecting to RabbitMQ (attempt ${connectionAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
    
    const { channel } = await connectRabbitMQ();
    rabbitMQConnected = true;
    connectionAttempts = 0;
    console.log('✅ RabbitMQ connected successfully');
    console.log(`📦 Queue: ${RABBITMQ_QUEUE}`);
    
    return channel;
  } catch (err) {
    rabbitMQConnected = false;
    connectionAttempts++;
    
    console.error('❌ Failed to connect to RabbitMQ:', err.message);
    
    if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(5000 * Math.pow(1.5, connectionAttempts - 1), 30000);
      console.log(`🔄 Retrying in ${delay/1000} seconds... (${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
      
      setTimeout(connectWithRetry, delay);
    } else {
      console.error('❌ Max reconnection attempts reached. RabbitMQ will be unavailable.');
    }
  }
};

// Start server first, then connect to RabbitMQ
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API server running on port ${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🚦 Rate limiting: 50 requests per minute per IP`);
  
  // Start RabbitMQ connection after server is running
  setTimeout(connectWithRetry, 1000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server };
