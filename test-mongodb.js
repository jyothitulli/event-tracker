const mongoose = require('mongoose');

async function testMongoDB() {
    console.log('🔌 Testing MongoDB connection...');
    
    try {
        // Try to connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/test_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Connected to MongoDB successfully!');
        
        // Test creating a collection
        const testSchema = new mongoose.Schema({
            test: String,
            timestamp: Date
        });
        
        const Test = mongoose.model('Test', testSchema);
        
        // Test insert
        const testDoc = new Test({
            test: 'Hello MongoDB!',
            timestamp: new Date()
        });
        
        await testDoc.save();
        console.log('✅ Document inserted successfully!');
        
        // Test query
        const found = await Test.findOne({ test: 'Hello MongoDB!' });
        console.log('✅ Document queried successfully!');
        console.log('📄 Found:', found);
        
        // Clean up
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
        console.log('✅ Test completed successfully!');
        
    } catch (error) {
        console.error('❌ MongoDB test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Is Docker running?');
        console.log('2. Run: docker-compose up -d database');
        console.log('3. Wait 10 seconds and try again');
    }
}

testMongoDB();