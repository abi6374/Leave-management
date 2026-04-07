import mongoose from 'mongoose';

const balanceUnitSchema = new mongoose.Schema(
  {
    total: { type: Number, required: true, default: 0 },
    used: { type: Number, required: true, default: 0 },
    remaining: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const leaveBalanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    sick: { type: balanceUnitSchema, default: () => ({ total: 12, used: 0, remaining: 12 }) },
    casual: { type: balanceUnitSchema, default: () => ({ total: 12, used: 0, remaining: 12 }) },
    earned: { type: balanceUnitSchema, default: () => ({ total: 15, used: 0, remaining: 15 }) },
    duty: { type: balanceUnitSchema, default: () => ({ total: 10, used: 0, remaining: 10 }) },
  },
  { timestamps: true }
);

leaveBalanceSchema.index({ userId: 1, year: 1 }, { unique: true });

export default mongoose.model('LeaveBalance', leaveBalanceSchema);
