// MySQL queries for activities
const activityQueries = {
  insertActivity: `
    INSERT INTO activities (
      id, userId, eventType, timestamp, processedAt, payload, 
      ipAddress, userAgent, status, retryCount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  
  findById: 'SELECT * FROM activities WHERE id = ?',
  
  findByUserId: 'SELECT * FROM activities WHERE userId = ? ORDER BY timestamp DESC',
  
  findByDateRange: `
    SELECT * FROM activities 
    WHERE userId = ? AND timestamp BETWEEN ? AND ? 
    ORDER BY timestamp DESC
  `,
  
  getEventStats: `
    SELECT 
      DATE(timestamp) as date,
      COUNT(*) as count
    FROM activities
    WHERE eventType = ? AND timestamp BETWEEN ? AND ?
    GROUP BY DATE(timestamp)
    ORDER BY date ASC
  `,
  
  updateStatus: 'UPDATE activities SET status = ?, retryCount = ? WHERE id = ?',
};

module.exports = activityQueries;