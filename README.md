# Leave Management System (MERN Stack)

A production-ready role-based leave management system with multi-level approval workflows. Built with React, Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Sample Test Users](#sample-test-users)

---

## ✨ Features

### Core Features
- ✅ **Role-Based Access Control** - 4 roles: Principal, HOD, Staff, Student
- ✅ **Multi-Level Approval Workflow** - Student leaves require Staff → HOD → Principal approval
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Responsive Dashboard** - Clean, modern UI with Tailwind CSS
- ✅ **Real-time Status Tracking** - Track leave status at each approval stage

### Role-Specific Features

**Student:**
- Apply for leave
- View own leave history
- Track approval status

**Staff:**
- Apply for leave
- Approve/Reject student leave requests
- View own leave history

**HOD (Head of Department):**
- Approve/Reject leave requests from staff
- View own leave history

**Principal:**
- Approve/Reject all leave requests
- View all leaves in the system
- Generate insights from leave data

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Toastify** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Cloud database

---

## 📁 Project Structure

```
Leave Management/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Leave.js             # Leave schema
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   └── leaveController.js   # Leave logic
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   └── leaveRoutes.js       # Leave endpoints
│   ├── middleware/
│   │   └── authMiddleware.js    # Auth & role middleware
│   ├── server.js                 # Server entry point
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ApplyLeave.jsx
│   │   │   ├── MyLeaves.jsx
│   │   │   ├── Approvals.jsx
│   │   │   └── AllLeaves.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state management
│   │   ├── hooks/
│   │   │   └── useAuth.js        # Custom hook
│   │   ├── services/
│   │   │   └── api.js            # API calls
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with your values**
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/leave_management
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` if needed**
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

---

## 📡 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" | "staff" | "hod" | "principal",
  "department": "Computer Science" (required for hod & principal)
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Leave Endpoints

#### Apply for Leave
```http
POST /api/leaves/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "leaveType": "Casual" | "Sick" | "Earned" | "Medical" | "Special",
  "reason": "Personal work",
  "fromDate": "2024-04-10",
  "toDate": "2024-04-12"
}
```

#### Get My Leaves
```http
GET /api/leaves/my
Authorization: Bearer <token>
```

#### Get Pending Leaves (Staff/HOD/Principal only)
```http
GET /api/leaves/pending
Authorization: Bearer <token>
```

#### Approve Leave
```http
PUT /api/leaves/approve/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "remarks": "Approved" (optional)
}
```

#### Reject Leave
```http
PUT /api/leaves/reject/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "remarks": "Need more information" (optional)
}
```

#### Get All Leaves (Principal only)
```http
GET /api/leaves/all
Authorization: Bearer <token>
```

---

## 🌍 Deployment

### Prerequisites for Deployment
- GitHub account (for version control)
- MongoDB Atlas account (free tier available)
- Render account (for backend)
- Vercel account (for frontend)

### Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with username and password
4. Get your connection string
5. Whitelist all IPs (0.0.0.0/0) or add Render's IP

### Step 2: Deploy Backend to Render

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the backend folder

4. **Configure Environment**
   - **Name:** leave-management-api
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

5. **Add Environment Variables**
   - `PORT` = 5000
   - `MONGO_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = Generate a strong secret

6. **Deploy**
   - Region: Choose closest to you
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Note the URL (e.g., `https://leave-management-api-xxx.onrender.com`)

### Step 3: Deploy Frontend to Vercel

1. **Update Frontend API URL**
   - In `.env.production`, set:
   ```
   VITE_API_URL=https://leave-management-api-xxx.onrender.com/api
   ```

2. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

3. **Deploy Frontend**
   - Click "Add New..." → "Project"
   - Import your repository
   - Select the frontend folder
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables in Vercel**
   - `VITE_API_URL` = Your Render API URL

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (1-2 minutes)

---

## 👥 Sample Test Users

After deployment, you can create these test accounts or modify the seed data:

### Principal
- **Email:** principal@school.edu
- **Password:** password123
- **Department:** Administration

### HOD (Computer Science)
- **Email:** hod.cs@school.edu
- **Password:** password123
- **Department:** Computer Science

### Staff
- **Email:** staff@school.edu
- **Password:** password123

### Student
- **Email:** student@school.edu
- **Password:** password123

---

## 🔒 Security Considerations

- ✅ Passwords are hashed using bcryptjs
- ✅ JWT tokens expire in 7 days
- ✅ CORS is enabled for frontend origin only
- ✅ Environment variables for sensitive data
- ✅ Role-based access control middleware
- ⚠️ Change JWT_SECRET in production
- ⚠️ Use HTTPS in production
- ⚠️ Whitelist Render IP in MongoDB

---

## 📝 Environment Variables Reference

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/leave_management
JWT_SECRET=your_super_secret_key_min_32_chars
NODE_ENV=production
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Verify MongoDB connection string
- Ensure all dependencies are installed: `npm install`

### Frontend can't connect to API
- Check if `VITE_API_URL` is correct
- Verify backend is running
- Check browser console for CORS errors
- Ensure JWT token is being sent in requests

### MongoDB connection fails
- Verify connection string in `.env`
- Check if user credentials are correct
- Whitelist your Render IP in MongoDB Atlas
- Check database name exists

### Deployment issues
- Check build logs on Render/Vercel
- Verify environment variables are set
- No hardcoded URLs (use env variables)
- Check file permissions

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Render Deployment](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Support

For issues or questions, please:
1. Check the troubleshooting section
2. Review API documentation
3. Check MongoDB and API logs

---

**Last Updated:** April 2026
**Version:** 1.0.0
