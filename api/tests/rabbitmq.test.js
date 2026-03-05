// Test RabbitMQ connection for API service
const amqp = require('amqplib');

describe('RabbitMQ Connection Test', () => {
  let connection;
  let channel;

  afterEach(async () => {
    if (channel) await channel.close();
    if (connection) await connection.close();
  });

  test('Should connect to RabbitMQ successfully', async () => {
    try {
      connection = await amqp.connect('amqp://guest:guest@localhost:5672');
      channel = await connection.createChannel();
      
      expect(connection).toBeDefined();
      expect(channel).toBeDefined();
      
      console.log('✅ RabbitMQ connection successful!');
    } catch (error) {
      console.error('❌ RabbitMQ connection failed:', error.message);
      throw error;
    }
  });

  test('Should assert queue and publish message', async () => {
    try {
      connection = await amqp.connect('amqp://guest:guest@localhost:5672');
      channel = await connection.createChannel();
      
      const queue = 'test_queue';
      await channel.assertQueue(queue, { durable: true });
      
      const testMessage = { test: 'Hello RabbitMQ!' };
      const result = channel.sendToQueue(queue, Buffer.from(JSON.stringify(testMessage)), {
        persistent: true
      });
      
      expect(result).toBe(true);
      console.log('✅ Message published successfully!');
      
      // Clean up
      await channel.deleteQueue(queue);
    } catch (error) {
      console.error('❌ Message publishing failed:', error.message);
      throw error;
    }
  }, 10000);
});