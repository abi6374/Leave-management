import User from '../models/User.js';
import LeaveBalance from '../models/LeaveBalance.js';
import jwt from 'jsonwebtoken';

const getDefaultBalances = () => ({
  sick: { total: 12, used: 0, remaining: 12 },
  casual: { total: 12, used: 0, remaining: 12 },
  earned: { total: 15, used: 0, remaining: 15 },
  duty: { total: 10, used: 0, remaining: 10 },
});

// Register User
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      employeeId,
      studentId,
      phone,
      profilePhoto,
      joiningDate,
    } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (['hod', 'staff', 'student'].includes(role) && !department) {
      return res.status(400).json({ message: 'Department is required for this role' });
    }

    if (role === 'student' && !studentId) {
      return res.status(400).json({ message: 'Student ID is required for students' });
    }

    if (['principal', 'hod', 'staff'].includes(role) && !employeeId) {
      return res.status(400).json({ message: 'Employee ID is required for this role' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      department,
      employeeId: employeeId || undefined,
      studentId: studentId || undefined,
      phone: phone || null,
      profilePhoto: profilePhoto || null,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
    });

    await user.save();

    await LeaveBalance.findOneAndUpdate(
      { userId: user._id, year: new Date().getFullYear() },
      {
        $setOnInsert: {
          userId: user._id,
          year: new Date().getFullYear(),
          ...getDefaultBalances(),
        },
      },
      { upsert: true, new: true }
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        studentId: user.studentId,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and get password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Contact principal.' });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        studentId: user.studentId,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
