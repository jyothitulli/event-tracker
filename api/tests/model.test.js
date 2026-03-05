// Test Activity model
const mongoose = require('mongoose');
const Activity = require('../src/models/Activity.model');

describe('Activity Model Test', () => {
  beforeAll(async () => {
    // Connect to test database
    const testUrl = 'mongodb://localhost:27017/test_db';
    await mongoose.connect(testUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  test('Should create and save activity successfully', async () => {
    const validActivity = {
      id: 'test-123',
      userId: 'user-456',
      eventType: 'user_login',
      timestamp: new Date(),
      payload: {
        ipAddress: '192.168.1.1',
        device: 'desktop',
        browser: 'Chrome'
      }
    };

    const activity = new Activity(validActivity);
    const savedActivity = await activity.save();

    expect(savedActivity._id).toBeDefined();
    expect(savedActivity.id).toBe(validActivity.id);
    expect(savedActivity.userId).toBe(validActivity.userId);
    expect(savedActivity.eventType).toBe(validActivity.eventType);
    expect(savedActivity.processedAt).toBeDefined();
    
    console.log('✅ Activity model created successfully!');
  });

  test('Should fail when creating activity without required fields', async () => {
    const invalidActivity = {
      userId: 'user-456'
      // Missing required fields
    };

    let error;
    try {
      const activity = new Activity(invalidActivity);
      await activity.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    console.log('✅ Validation working correctly!');
  });
});