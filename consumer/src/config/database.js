/**
 * Database Configuration
 */

const mongoose = require('mongoose');

let connection = null;

const connectDB = async () => {
  try {
    const url = process.env.MONGODB_URL || 'mongodb://admin:admin123@localhost:27017/activity_db?authSource=admin';
    
    console.log('Connecting to MongoDB...');
    
    connection = await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    return connection;
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error.message);
  }
};

const getConnection = () => mongoose.connection;

module.exports = {
  connectDB,
  disconnectDB,
  getConnection
};