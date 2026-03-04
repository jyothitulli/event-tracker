// Database configuration for API service (though API doesn't directly use DB, we'll keep it for future use)
const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.DB_TYPE === 'mongodb') {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error('Database connection failed:', error.message);
      process.exit(1);
    }
  }
  // For MySQL, we'll handle connection in the consumer service
};

module.exports = { connectDB };