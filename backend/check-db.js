import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI missing in backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    const ping = await mongoose.connection.db.admin().ping();

    console.log('MongoDB connectivity check: SUCCESS');
    console.log('Ping response:', JSON.stringify(ping));
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('MongoDB connectivity check: FAILED');
    console.error(error.message);
    console.error('Fix steps:');
    console.error('1) Atlas -> Network Access -> Add Current IP (or 0.0.0.0/0 for testing)');
    console.error('2) Atlas -> Database Access -> ensure user admin / admin123 exists');
    console.error('3) Confirm MONGO_URI in backend/.env has cluster0.w0smr10.mongodb.net');
    process.exit(1);
  }
};

run();
