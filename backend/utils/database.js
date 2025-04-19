
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecocart-db';
    
    // Check if the MongoDB URI includes a placeholder for the password
    if (MONGODB_URI.includes('YOUR_ACTUAL_PASSWORD')) {
      console.error('⚠️ MongoDB connection error: Please replace YOUR_ACTUAL_PASSWORD in the .env file with your actual MongoDB password');
      console.warn('⚠️ Proceeding with local fallback or demo mode');
      return false;
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('⚠️ Proceeding with demo mode. Check your database connection string and network.');
    return false;
  }
};

module.exports = connectDB;
