// MongoDB Activity Model for Consumer Service
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  eventType: { 
    type: String, 
    required: true,
    enum: ['user_login', 'user_logout', 'page_view', 'button_click', 'purchase', 'settings_change'],
    index: true
  },
  timestamp: { 
    type: Date, 
    required: true,
    index: true 
  },
  processedAt: { 
    type: Date, 
    default: Date.now 
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(v) {
        return v && typeof v === 'object';
      },
      message: 'Payload must be a valid JSON object'
    }
  },
  // Additional metadata
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['processed', 'failed', 'retrying'],
    default: 'processed'
  },
  retryCount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create indexes for common queries
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ eventType: 1, timestamp: -1 });
activitySchema.index({ 'payload.ipAddress': 1 });

// Static method to find activities by user within date range
activitySchema.statics.findByUserAndDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ timestamp: -1 });
};

// Static method to get event statistics
activitySchema.statics.getEventStats = function(eventType, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        eventType,
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;