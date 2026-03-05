const amqp = require('amqplib');

let connection = null;
let channel = null;
let connecting = false;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_INTERVAL = 5000;

const connectRabbitMQ = async () => {
  if (connecting) {
    console.log('🔄 Connection already in progress...');
    return { connection, channel };
  }

  connecting = true;
  connectionAttempts++;

  try {
    // Make sure URL is correct - no trailing slash
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
    const queue = process.env.RABBITMQ_QUEUE || 'user_activities';
    
    console.log(`📡 Connecting to RabbitMQ at ${url} (attempt ${connectionAttempts})...`);
    
    // Close existing connection if any
    await closeConnection();
    
    // Create new connection with longer timeout
    connection = await amqp.connect(url, {
      timeout: 30000, // 30 second timeout
      heartbeat: 60
    });
    
    console.log('✅ AMQP connection established');
    
    // Create channel
    channel = await connection.createChannel();
    console.log('✅ Channel created');
    
    // Assert queue
    await channel.assertQueue(queue, { 
      durable: true
    });
    
    console.log(`✅ Queue '${queue}' asserted successfully`);
    
    // Reset connection attempts on success
    connectionAttempts = 0;
    
    // Set up connection event handlers
    connection.on('error', (err) => {
      console.error('🔴 RabbitMQ connection error:', err.message);
    });
    
    connection.on('close', () => {
      console.log('🔴 RabbitMQ connection closed');
      channel = null;
      connection = null;
    });
    
    return { connection, channel };
    
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ:', error.message);
    console.error('Error details:', error);
    
    // Schedule reconnection if under max attempts
    if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
      console.log(`🔄 Will retry in ${RECONNECT_INTERVAL/1000} seconds... (${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
      setTimeout(() => {
        connecting = false;
        connectRabbitMQ();
      }, RECONNECT_INTERVAL);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
    
    throw error;
  } finally {
    connecting = false;
  }
};

const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
};

const publishToQueue = async (queue, message) => {
  try {
    if (!channel || !connection) {
      console.log('Channel missing, attempting to reconnect...');
      await connectRabbitMQ();
      
      if (!channel) {
        throw new Error('Still cannot connect to RabbitMQ');
      }
    }
    
    const result = channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
      contentType: 'application/json',
      timestamp: Math.floor(Date.now() / 1000)
    });
    
    if (result) {
      console.log(`📤 Published message to queue ${queue}`);
    } else {
      console.warn('⚠️ Message was not accepted by RabbitMQ');
    }
    
    return result;
    
  } catch (error) {
    console.error('Failed to publish message:', error.message);
    throw error;
  }
};

const closeConnection = async () => {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log('🔌 RabbitMQ connection closed');
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error.message);
  }
};

const getConnectionStatus = () => {
  return {
    connected: !!(connection && channel),
    connectionAttempts,
    maxAttempts: MAX_RECONNECT_ATTEMPTS
  };
};

module.exports = {
  connectRabbitMQ,
  getChannel,
  publishToQueue,
  closeConnection,
  getConnectionStatus
};