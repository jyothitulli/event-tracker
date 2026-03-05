/**
 * MongoDB Activity Model
 */

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
    enum: ['user_login', 'user_logout', 'page_view', 'button_click', 'purchase', 'settings_change', 'test'],
    default: 'test',
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
    default: {}
  },
  ipAddress: {
    type: String,
    default: 'unknown'
  },
  userAgent: {
    type: String,
    default: 'unknown'
  },
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
  timestamps: true 
});

// Compound indexes for common queries
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ eventType: 1, timestamp: -1 });
activitySchema.index({ status: 1, createdAt: -1 });

// Static method to find activities by user
activitySchema.statics.findByUser = function(userId, limit = 100) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get event statistics
activitySchema.statics.getStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: { 
          eventType: '$eventType',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);
};

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;