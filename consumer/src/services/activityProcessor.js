/**
 * Activity Processor Service
 * Processes and stores activity events
 */

const { v4: uuidv4 } = require('uuid');
const Activity = require('../models/Activity.model');

/**
 * Process an activity message
 * @param {Object} message - The activity message from queue
 */
const processActivity = async (message) => {
  const startTime = Date.now();
  
  try {
    // Validate required fields
    if (!message.id || !message.userId || !message.eventType || !message.timestamp) {
      throw new Error('Missing required fields in message');
    }

    // Prepare activity data
    const activityData = {
      id: message.id,
      userId: message.userId,
      eventType: message.eventType,
      timestamp: new Date(message.timestamp),
      processedAt: new Date(),
      payload: message.payload || {},
      ipAddress: message.payload?.ipAddress || 'unknown',
      userAgent: message.payload?.userAgent || 'unknown',
      status: 'processed',
      retryCount: message.retryCount || 0
    };

    // Store in database
    const activity = new Activity(activityData);
    await activity.save();

    const processingTime = Date.now() - startTime;
    
    console.log(`💾 Activity stored:`, {
      id: activity.id,
      userId: activity.userId,
      eventType: activity.eventType,
      processingTime: `${processingTime}ms`
    });

    return activity;

  } catch (error) {
    console.error('Error in processActivity:', error.message);
    
    // Log failed activity for debugging
    const failedActivity = {
      ...message,
      error: error.message,
      failedAt: new Date().toISOString()
    };
    
    console.error('Failed activity:', JSON.stringify(failedActivity, null, 2));
    
    throw error;
  }
};

/**
 * Retry failed activity
 * @param {Object} message - The failed message
 * @param {number} retryCount - Current retry count
 */
const retryActivity = async (message, retryCount) => {
  console.log(`🔄 Retrying activity ${message.id} (attempt ${retryCount})`);
  
  // Add retry metadata
  const retryMessage = {
    ...message,
    retryCount,
    lastRetry: new Date().toISOString()
  };
  
  return processActivity(retryMessage);
};

module.exports = {
  processActivity,
  retryActivity
};