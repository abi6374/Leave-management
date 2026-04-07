import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Hint: Verify Atlas Network Access (IP whitelist), DB user/password, and MONGO_URI.');
    process.exit(1);
  }
};

export default connectDB;
