import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Leave from './models/Leave.js';

dotenv.config();

const predefinedUsers = [
  {
    name: 'Dr. Principal',
    email: 'principal@school.edu',
    password: 'Principal@123',
    role: 'principal',
    department: 'Administration',
  },
  {
    name: 'Prof. HOD',
    email: 'hod.cs@school.edu',
    password: 'HOD@123',
    role: 'hod',
    department: 'Computer Science',
  },
  {
    name: 'Ms. Staff',
    email: 'staff@school.edu',
    password: 'Staff@123',
    role: 'staff',
    department: 'Computer Science',
  },
  {
    name: 'John Student',
    email: 'student@school.edu',
    password: 'Student@123',
    role: 'student',
    department: null,
  },
];

const connect = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas');
};

const ensureCollections = async () => {
  const existingCollections = await mongoose.connection.db
    .listCollections()
    .toArray();

  const collectionNames = new Set(existingCollections.map((c) => c.name));

  if (!collectionNames.has('users')) {
    await mongoose.connection.db.createCollection('users');
    console.log('Created collection: users');
  } else {
    console.log('Collection already exists: users');
  }

  if (!collectionNames.has('leaves')) {
    await mongoose.connection.db.createCollection('leaves');
    console.log('Created collection: leaves');
  } else {
    console.log('Collection already exists: leaves');
  }
};

const seedUsers = async () => {
  for (const data of predefinedUsers) {
    const existing = await User.findOne({ email: data.email }).select('+password');

    if (!existing) {
      const user = new User(data);
      await user.save();
      console.log(`Created user: ${data.email}`);
      continue;
    }

    existing.name = data.name;
    existing.role = data.role;
    existing.department = data.department;
    existing.password = data.password;
    await existing.save();
    console.log(`Updated user: ${data.email}`);
  }
};

const run = async () => {
  try {
    await connect();
    await ensureCollections();
    await seedUsers();

    const userCount = await User.countDocuments();
    const leaveCount = await Leave.countDocuments();

    console.log('---------------------------------------');
    console.log('Seed completed successfully');
    console.log(`Users count: ${userCount}`);
    console.log(`Leaves count: ${leaveCount}`);
    console.log('---------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

run();
