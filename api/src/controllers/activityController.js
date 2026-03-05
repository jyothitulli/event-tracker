const { v4: uuidv4 } = require('uuid');
const { publishToQueue } = require('../config/rabbitmq');

const RABBITMQ_QUEUE = process.env.RABBITMQ_QUEUE || 'user_activities';

// Create a new activity
const createActivity = async (req, res) => {
  try {
    const { userId, eventType, timestamp, payload } = req.body;
    
    // Basic validation
    if (!userId || !eventType || !timestamp || !payload) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userId', 'eventType', 'timestamp', 'payload']
      });
    }
    
    // Create activity object with unique ID
    const activity = {
      id: uuidv4(),
      userId,
      eventType,
      timestamp,
      payload,
      receivedAt: new Date().toISOString()
    };
    
    // Publish to RabbitMQ
    await publishToQueue(RABBITMQ_QUEUE, activity);
    
    // Return 202 Accepted
    res.status(202).json({ 
      message: 'Activity accepted for processing',
      activityId: activity.id
    });
    
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to process activity' });
  }
};

module.exports = {
  createActivity
};