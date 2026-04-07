import User from '../models/User.js';

export const listUsers = async (req, res) => {
  try {
    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.department) query.department = req.query.department;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleUserActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'principal') {
      return res.status(400).json({ message: 'Principal account cannot be deactivated' });
    }

    user.isActive = typeof isActive === 'boolean' ? isActive : !user.isActive;
    await user.save();

    res.status(200).json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsersByDepartment = async (req, res) => {
  try {
    const dept = req.params.dept;
    const users = await User.find({ department: dept, isActive: true })
      .select('name email role department employeeId studentId')
      .sort({ role: 1, name: 1 });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
