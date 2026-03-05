const amqp = require('amqplib');

async function testRabbitMQ() {
    console.log('🔌 Testing RabbitMQ connection...');
    
    try {
        // Try to connect to RabbitMQ
        const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
        console.log('✅ Connected to RabbitMQ successfully!');
        
        const channel = await connection.createChannel();
        console.log('✅ Created channel successfully!');
        
        // Test queue
        const queue = 'test_queue';
        await channel.assertQueue(queue, { durable: true });
        console.log('✅ Queue asserted successfully!');
        
        // Test publish
        const testMessage = { 
            test: 'Hello RabbitMQ!', 
            timestamp: new Date().toISOString() 
        };
        
        const published = channel.sendToQueue(
            queue, 
            Buffer.from(JSON.stringify(testMessage)),
            { persistent: true }
        );
        
        if (published) {
            console.log('✅ Message published successfully!');
            console.log('📤 Message:', testMessage);
        }
        
        // Clean up
        await channel.deleteQueue(queue);
        await channel.close();
        await connection.close();
        console.log('✅ Test completed successfully!');
        
    } catch (error) {
        console.error('❌ RabbitMQ test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Is Docker running?');
        console.log('2. Run: docker-compose up -d rabbitmq');
        console.log('3. Wait 10 seconds and try again');
    }
}

testRabbitMQ();