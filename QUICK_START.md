# PROJECT SETUP & RUN GUIDE

## Quick Start (Development)

### Backend Setup
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

---

## Directory Structure Overview

```
Leave Management/
├── backend/                          # Node.js + Express API
│   ├── config/db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js                  # User schema (4 roles)
│   │   └── Leave.js                 # Leave schema (multi-level approvals)
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, GetMe
│   │   └── leaveController.js       # Apply, Approve, Reject, Get
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/*
│   │   └── leaveRoutes.js           # /api/leaves/*
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT & Role verification
│   ├── server.js                    # Express server
│   ├── .env                         # Environment variables
│   └── package.json
│
├── frontend/                         # React + Vite UI
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Registration with roles
│   │   │   ├── Dashboard.jsx        # Role-based dashboard
│   │   │   ├── ApplyLeave.jsx       # Leave application form
│   │   │   ├── MyLeaves.jsx         # View own leaves
│   │   │   ├── Approvals.jsx        # Pending approvals
│   │   │   └── AllLeaves.jsx        # Principal: all leaves view
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Navigation
│   │   │   └── ProtectedRoute.jsx   # Auth guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # State management
│   │   ├── services/
│   │   │   └── api.js               # API wrapper
│   │   └── App.jsx                  # Routing
│   ├── .env                         # API URL config
│   └── package.json
│
├── README.md                         # Full documentation
├── DEPLOYMENT.md                     # Step-by-step deployment
└── SAMPLE_DATA.md                    # Test users & workflows
```

---

## Key Features Implemented

### ✅ Authentication
- JWT-based login/register
- Role-based access control (Principal, HOD, Staff, Student)
- Password hashing with bcryptjs
- Token expiration (7 days)
- Protected routes

### ✅ Leave Management
- **Student Leaves:** Student → Staff → HOD → Principal approval
- **Staff Leaves:** Staff → Principal approval
- Apply, view, approve, reject leaves
- Track approval status at each level
- Add remarks during approval/rejection

### ✅ Role-Based Features
- **Student:** Apply & view leaves only
- **Staff:** Approve student leaves + apply own
- **HOD:** Approve leave requests from staff
- **Principal:** Final approval + view all leaves

### ✅ UI/UX
- Responsive Tailwind CSS design
- Sidebar navigation
- Toast notifications
- Status badges (pending/approved/rejected)
- Expandable leave cards
- Form validation
- Loading states

### ✅ API
- RESTful endpoints
- Error handling
- CORS enabled
- Populated references
- Sorted results

---

## Database Schema

### Users
```
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "principal" | "hod" | "staff" | "student",
  department: String (optional, required for hod/principal),
  createdAt: Date
}
```

### Leaves
```
{
  userId: ObjectId,
  role: "student" | "staff",
  leaveType: String,
  reason: String,
  fromDate: Date,
  toDate: Date,
  status: "pending_staff" | "pending_hod" | "pending_principal" | "approved" | "rejected",
  approvals: {
    staffApproval: { status, approvedBy, remarks, approvedAt },
    hodApproval: { status, approvedBy, remarks, approvedAt },
    principalApproval: { status, approvedBy, remarks, approvedAt }
  },
  createdAt: Date
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Leaves
- `POST /api/leaves/apply` - Apply for leave (Student/Staff)
- `GET /api/leaves/my` - Get own leaves
- `GET /api/leaves/pending` - Get pending approvals (Staff/HOD/Principal)
- `PUT /api/leaves/approve/:id` - Approve leave
- `PUT /api/leaves/reject/:id` - Reject leave
- `GET /api/leaves/all` - Get all leaves (Principal only)

---

## Workflow Diagrams

### Student Leave Approval
```
Student Creates Request
         ↓
    PENDING_STAFF
         ↓
Staff Approves/Rejects
         ↓
If Rejected: Status = REJECTED (End)
If Approved: Status = PENDING_HOD
         ↓
HOD Approves/Rejects
         ↓
If Rejected: Status = REJECTED (End)
If Approved: Status = PENDING_PRINCIPAL
         ↓
Principal Approves/Rejects
         ↓
If Rejected: Status = REJECTED
If Approved: Status = APPROVED (End)
```

### Staff Leave Approval
```
Staff Creates Request
         ↓
   PENDING_PRINCIPAL
         ↓
Principal Approves/Rejects
         ↓
If Rejected: Status = REJECTED
If Approved: Status = APPROVED (End)
```

---

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/leave_management
JWT_SECRET=your_secret_key_min_32_chars
NODE_ENV=development
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```

### Frontend `.env.production`
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Production Deployment

### Prerequisites
1. GitHub repository
2. MongoDB Atlas (free tier available)
3. Render account (free tier for backend)
4. Vercel account (free tier for frontend)

### Step-by-Step
1. **Database:** Set up MongoDB Atlas cluster
2. **Backend:** Deploy to Render with env variables
3. **Frontend:** Deploy to Vercel with backend URL
4. **Test:** Register test users and verify workflows

See `DEPLOYMENT.md` for detailed instructions.

---

## Security Features

- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ JWT tokens for stateless auth
- ✅ CORS enabled for frontend origin
- ✅ Role-based access control middleware
- ✅ Protected API endpoints
- ✅ No sensitive data in frontend
- ✅ Environment variables for secrets
- ⚠️  Change JWT_SECRET in production
- ⚠️  Use HTTPS in production
- ⚠️  Whitelist IPs in MongoDB

---

## Testing

### Manual Testing
1. Register test users (Principal, HOD, Staff, Student)
2. Create leave requests as Student
3. Approve/reject at each approval level
4. View complete approval trail

### Test User Accounts
```
Principal: principal@school.edu / password123
HOD: hod@school.edu / password123
Staff: staff@school.edu / password123
Student: student@school.edu / password123
```

See `SAMPLE_DATA.md` for testing workflows.

---

## Common Issues & Solutions

### Database Connection
```
Error: connect ECONNREFUSED
Solution: Check MongoDB URI and ensure cluster is active
```

### CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS
Solution: Verify backend CORS settings and API URL in frontend
```

### JWT Error
```
Error: Invalid token
Solution: Check JWT_SECRET matches, token not expired
```

### Port Already in Use
```
Error: listen EADDRINUSE
Solution: Change PORT in .env or kill process using port
```

---

## Performance Optimizations

- ✅ Vite for fast frontend builds
- ✅ MongoDB indexes on frequently queried fields
- ✅ JWT for stateless authentication
- ✅ Connected payload filtering
- ✅ Error handling & logging
- ✅ Tailwind CSS for efficient styling

---

## Future Enhancement Ideas

1. **Email Notifications** - Send status updates via email
2. **Leave Balance** - Track remaining leave days
3. **Holiday Calendar** - Skip holidays in leave calculations
4. **Reports** - Generate leave analytics
5. **Attendance Integration** - Link with attendance system
6. **Mobile App** - React Native mobile client
7. **Document Upload** - Attach files to requests
8. **Bulk Approvals** - Approve multiple leaves at once
9. **Leave Templates** - Pre-defined leave types
10. **Audit Trail** - Complete action history

---

## Monitoring & Maintenance

- Check API logs daily
- Monitor database performance
- Clean up old logs/data
- Update dependencies monthly
- Review security patches
- Backup database weekly

---

## Support Resources

- **React:** https://react.dev
- **Express:** https://expressjs.com
- **MongoDB:** https://docs.mongodb.com
- **Render:** https://render.com/docs
- **Vercel:** https://vercel.com/docs
- **Tailwind:** https://tailwindcss.com

---

## Final Checklist

- [ ] Both .env files configured
- [ ] Node modules installed in both folders
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] MongoDB connection successful
- [ ] Login/Register pages working
- [ ] Dashboard displays correctly
- [ ] Leave workflow functioning
- [ ] Toast notifications showing
- [ ] No console errors
- [ ] Ready for production deployment

---

**Version:** 1.0.0  
**Last Updated:** April 2026  
**Status:** Production Ready ✅
