import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    type: {
      type: String,
      enum: ['approval', 'rejection', 'reminder', 'info'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedLeaveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Leave',
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('Notification', notificationSchema);
