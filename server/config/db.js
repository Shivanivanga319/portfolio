const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.log(`ℹ️ Note: MongoDB is not connected (${error.message}).`);
    console.log('⚡ Active Fallback: Running with resilient in-memory storage. All Admin features & APIs will work seamlessly.');
    console.log('💡 To connect to the cloud database: add your free MongoDB Atlas URI to server/.env (MONGO_URI=...)');
  }
};

const isDBConnected = () => isConnected && mongoose.connection.readyState === 1;

module.exports = { connectDB, isDBConnected };
