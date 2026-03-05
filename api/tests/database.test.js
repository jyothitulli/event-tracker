// Test database connection
const mongoose = require('mongoose');

describe('Database Connection Test', () => {
  afterEach(async () => {
    await mongoose.connection.close();
  });

  test('Should connect to MongoDB successfully', async () => {
    try {
      // Use a test database URL
      const testUrl = 'mongodb://localhost:27017/test_db';
      
      await mongoose.connect(testUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
      console.log('✅ MongoDB connection successful!');
      
      // Clean up test database
      await mongoose.connection.db.dropDatabase();
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }, 10000);
});