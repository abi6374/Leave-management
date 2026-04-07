import LeaveBalance from '../models/LeaveBalance.js';
import User from '../models/User.js';

const defaults = {
  sick: { total: 12, used: 0, remaining: 12 },
  casual: { total: 12, used: 0, remaining: 12 },
  earned: { total: 15, used: 0, remaining: 15 },
  duty: { total: 10, used: 0, remaining: 10 },
};

const ensureBalance = async (userId, year) => {
  return LeaveBalance.findOneAndUpdate(
    { userId, year },
    { $setOnInsert: { userId, year, ...defaults } },
    { upsert: true, new: true }
  );
};

export const getMyBalance = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const balance = await ensureBalance(req.user.id, year);
    res.status(200).json({ balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const year = Number(req.query.year) || new Date().getFullYear();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const balance = await ensureBalance(userId, year);
    res.status(200).json({ balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetBalances = async (req, res) => {
  try {
    const year = Number(req.body.year) || new Date().getFullYear();
    const users = await User.find({ role: { $in: ['student', 'staff', 'hod'] }, isActive: true }).select('_id');

    const bulk = users.map((user) => ({
      updateOne: {
        filter: { userId: user._id, year },
        update: {
          $set: {
            ...defaults,
          },
        },
        upsert: true,
      },
    }));

    if (bulk.length) {
      await LeaveBalance.bulkWrite(bulk);
    }

    res.status(200).json({ message: `Balances reset for ${year}`, updatedUsers: users.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
