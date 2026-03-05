/**
 * Consumer Worker Service
 * Listens to RabbitMQ queue and processes activities
 */

const dotenv = require('dotenv');
const { connectRabbitMQ, consumeFromQueue } = require('./config/rabbitmq');
const { connectDB } = require('./config/database');
const { processActivity } = require('./services/activityProcessor');

// Load environment variables
dotenv.config();

const QUEUE = process.env.RABBITMQ_QUEUE || 'user_activities';
const MAX_RETRIES = parseInt(process.env.MAX_RETRY_COUNT || '3');

/**
 * Start the consumer worker
 */
async function startWorker() {
  console.log('🚀 Starting Consumer Worker...');
  console.log('=================================');
  console.log(`📦 Queue: ${QUEUE}`);
  console.log(`🔄 Max retries: ${MAX_RETRIES}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log('=================================');

  try {
    // Step 1: Connect to Database
    console.log('\n📡 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');

    // Step 2: Connect to RabbitMQ
    console.log('\n📡 Connecting to RabbitMQ...');
    const { channel } = await connectRabbitMQ();
    console.log('✅ RabbitMQ connected successfully');

    // Step 3: Start consuming messages
    console.log(`\n👂 Listening for messages on queue: ${QUEUE}`);
    
    await consumeFromQueue(QUEUE, async (message, rawMsg) => {
      console.log('\n📨 Received message:', {
        id: message.id,
        userId: message.userId,
        eventType: message.eventType,
        timestamp: message.timestamp
      });

      try {
        // Process the activity
        await processActivity(message);
        
        console.log('✅ Activity processed successfully:', message.id);
        
      } catch (error) {
        console.error('❌ Failed to process activity:', error.message);
        
        // Re-throw for retry handling
        throw error;
      }
    });

    // Handle graceful shutdown
    setupGracefulShutdown();

  } catch (error) {
    console.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    console.log(`\n📥 Received ${signal}, shutting down gracefully...`);
    
    try {
      // Close RabbitMQ connection
      const { closeConnection } = require('./config/rabbitmq');
      await closeConnection();
      
      // Close database connection
      const { disconnectDB } = require('./config/database');
      await disconnectDB();
      
      console.log('✅ Shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Start the worker
startWorker();