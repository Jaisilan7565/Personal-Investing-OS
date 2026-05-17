const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn(`Warning: Mongoose could not connect. Ensure local MongoDB is running at mongodb://localhost:27017 or provide an Atlas URI inside backend/.env`);
  }
};

module.exports = connectDB;
