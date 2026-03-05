const amqp = require('amqplib');

let connection = null;
let channel = null;
let connecting = false;

const connectRabbitMQ = async () => {
  if (connecting) {
    console.log('Connection already in progress...');
    return { connection, channel };
  }

  connecting = true;

  try {
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    const queue = process.env.RABBITMQ_QUEUE || 'user_activities';
    
    console.log(`📡 Connecting to RabbitMQ at ${url}...`);
    
    await closeConnection();
    
    connection = await amqp.connect(url, {
      timeout: 10000,
      heartbeat: 60
    });
    
    channel = await connection.createChannel();
    
    // Simple queue assertion without dead letter
    await channel.assertQueue(queue, { 
      durable: true
    });
    
    await channel.prefetch(1);
    
    console.log('✅ Consumer connected to RabbitMQ');
    console.log(`📦 Queue: ${queue}`);
    
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err.message);
    });
    
    connection.on('close', () => {
      console.log('RabbitMQ connection closed');
    });
    
    return { connection, channel };
    
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ:', error.message);
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

const consumeFromQueue = async (queue, callback) => {
  try {
    const ch = getChannel();
    
    await ch.consume(queue, async (msg) => {
      if (!msg) return;
      
      try {
        const content = JSON.parse(msg.content.toString());
        await callback(content, msg);
        ch.ack(msg);
      } catch (error) {
        console.error('Error processing message:', error.message);
        
        // Simple retry logic
        const retryCount = (msg.properties.headers?.retryCount || 0) + 1;
        const maxRetries = 3;
        
        if (retryCount <= maxRetries) {
          console.log(`Requeuing for retry ${retryCount}/${maxRetries}`);
          ch.nack(msg, false, true);
        } else {
          console.log('Max retries exceeded, acknowledging message');
          ch.ack(msg);
        }
      }
    }, { noAck: false });
    
    console.log(`Started consuming from queue: ${queue}`);
    
  } catch (error) {
    console.error('Failed to start consuming:', error.message);
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
    console.log('RabbitMQ connection closed');
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error.message);
  }
};

module.exports = {
  connectRabbitMQ,
  getChannel,
  consumeFromQueue,
  closeConnection
};