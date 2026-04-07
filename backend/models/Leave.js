import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'staff'],
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['Sick', 'Casual', 'Earned', 'Medical', 'Special'],
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason'],
      maxlength: 500,
    },
    fromDate: {
      type: Date,
      required: [true, 'Please provide a from date'],
    },
    toDate: {
      type: Date,
      required: [true, 'Please provide a to date'],
      validate: {
        validator: function (value) {
          return value > this.fromDate;
        },
        message: 'To date must be after from date',
      },
    },
    status: {
      type: String,
      enum: ['pending_staff', 'pending_hod', 'pending_principal', 'approved', 'rejected'],
      default: 'pending_staff',
    },
    approvals: {
      staffApproval: {
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
        remarks: String,
        approvedAt: Date,
      },
      hodApproval: {
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
        remarks: String,
        approvedAt: Date,
      },
      principalApproval: {
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
        remarks: String,
        approvedAt: Date,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Leave', leaveSchema);
