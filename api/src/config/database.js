// Database configuration for Consumer Service
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');

let connection = null;

const connectDB = async () => {
  const dbType = process.env.DB_TYPE || 'mongodb';
  
  if (dbType === 'mongodb') {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      throw error;
    }
  } else if (dbType === 'mysql') {
    try {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'database',
        port: process.env.MYSQL_PORT || 3306,
        user: process.env.MYSQL_USER || 'user',
        password: process.env.MYSQL_PASSWORD || 'password',
        database: process.env.MYSQL_DATABASE || 'activity_db',
      });
      
      // Create activities table if it doesn't exist
      await createMySQLTable();
      
      console.log('MySQL Connected');
      return connection;
    } catch (error) {
      console.error('MySQL connection failed:', error.message);
      throw error;
    }
  }
};

const createMySQLTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS activities (
      id VARCHAR(36) PRIMARY KEY,
      userId VARCHAR(255) NOT NULL,
      eventType VARCHAR(100) NOT NULL,
      timestamp DATETIME NOT NULL,
      processedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      payload JSON NOT NULL,
      ipAddress VARCHAR(45),
      userAgent TEXT,
      status ENUM('processed', 'failed', 'retrying') DEFAULT 'processed',
      retryCount INT DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_userId (userId),
      INDEX idx_eventType (eventType),
      INDEX idx_timestamp (timestamp),
      INDEX idx_user_timestamp (userId, timestamp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  await connection.execute(createTableQuery);
};

const getConnection = () => {
  if (process.env.DB_TYPE === 'mysql' && !connection) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return connection;
};

module.exports = { connectDB, getConnection };