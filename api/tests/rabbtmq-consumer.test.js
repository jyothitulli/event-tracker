// Test RabbitMQ consumer functionality
const amqp = require('amqplib');

describe('RabbitMQ Consumer Test', () => {
  let connection;
  let channel;
  const queue = 'test_consumer_queue';

  beforeEach(async () => {
    connection = await amqp.connect('amqp://guest:guest@localhost:5672');
    channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
  });

  afterEach(async () => {
    await channel.deleteQueue(queue);
    await channel.close();
    await connection.close();
  });

  test('Should consume messages from queue', (done) => {
    const testMessage = { test: 'Consumer test message' };
    
    // Set up consumer
    channel.consume(queue, (msg) => {
      const content = JSON.parse(msg.content.toString());
      expect(content).toEqual(testMessage);
      channel.ack(msg);
      console.log('✅ Message consumed successfully!');
      done();
    }, { noAck: false });

    // Publish test message
    setTimeout(() => {
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(testMessage)), {
        persistent: true
      });
      console.log('📤 Test message published');
    }, 500);
  }, 5000);

  test('Should handle message acknowledgment correctly', async () => {
    const messages = [];
    
    // Create a promise that resolves when message is processed
    const messageProcessed = new Promise((resolve) => {
      channel.consume(queue, (msg) => {
        messages.push(msg);
        channel.ack(msg);
        resolve();
      }, { noAck: false });
    });

    // Publish a message
    channel.sendToQueue(queue, Buffer.from(JSON.stringify({ test: 'ack test' })), {
      persistent: true
    });

    await messageProcessed;
    
    // Check queue is empty (message was acknowledged and removed)
    const queueStatus = await channel.checkQueue(queue);
    expect(queueStatus.messageCount).toBe(0);
    
    console.log('✅ Message acknowledgment working correctly!');
  }, 5000);
});