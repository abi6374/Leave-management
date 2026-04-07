# DEPLOYMENT GUIDE - Leave Management System

## 🚀 Complete Deployment Instructions

### Prerequisites Checklist
- [ ] GitHub account with repository
- [ ] MongoDB Atlas account (free tier: https://www.mongodb.com/cloud/atlas)
- [ ] Render account (https://render.com)
- [ ] Vercel account (https://vercel.com)
- [ ] Node.js v16+ installed locally

---

## PART 1: MongoDB Atlas Setup (Database)

### 1.1 Create MongoDB Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Start free"
3. Sign up or log in
4. Create organization or skip
5. Click "Create a Project"
6. Name it "Leave Management"
7. Click "Create Project"

### 1.2 Create Cluster
1. Click "Create Deployment"
2. Select "Free" tier
3. Choose cloud provider (AWS, Google Cloud, or Azure)
4. Select closest region
5. Click "Create Deployment"
6. Wait 5-10 minutes for cluster creation

### 1.3 Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `lms_user` (or your choice)
5. Password: Generate secure password (save this!)
6. Click "Add User"

### 1.4 Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Drivers" option
4. Copy connection string (looks like):
   ```
   mongodb+srv://lms_user:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `PASSWORD` with your actual password
6. Connection string format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/leave_management?retryWrites=true&w=majority
   ```

### 1.5 Whitelist IPs
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. For testing: Add your IP or use 0.0.0.0/0 (allow all)
4. For Render deployment: Add Render's IP (we'll get this later)
5. Click "Confirm"

---

## PART 2: GitHub Setup (Version Control)

### 2.1 Initialize Repository
```bash
# From root "Leave Management" directory
git init
git add .
git commit -m "Initial commit - MERN Leave Management System"
```

### 2.2 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `leave-management-system`
3. Description: "MERN Stack Leave Management System"
4. Choose Public or Private
5. Click "Create repository"

### 2.3 Push Code
```bash
git remote add origin https://github.com/YOUR_USERNAME/leave-management-system.git
git branch -M main
git push -u origin main
```

---

## PART 3: Backend Deployment (Render)

### 3.1 Create Render Account
1. Go to https://render.com
2. Click "Sign up"
3. Sign up with GitHub (easiest option)
4. Authorize Render to access your GitHub account

### 3.2 Create Backend Service
1. Dashboard → Click "+" → "New Web Service"
2. Connect your GitHub repository
3. Select your repository
4. Choose `main` branch

### 3.3 Configure Service
1. **Name:** `leave-management-backend`
2. **Environment:** Node
3. **Region:** Choose closest to your users
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. **Plan:** Free (for development)

### 3.4 Add Environment Variables
Click "Advanced" and add:
```
PORT = 5000
MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/leave_management?retryWrites=true&w=majority
JWT_SECRET = your_long_random_secret_key_at_least_32_chars_try_generating_one_here=openssl_rand_-base64_32
NODE_ENV = production
```

### 3.5 Deploy
1. Scroll to bottom and click "Create Web Service"
2. Wait for deployment (3-5 minutes)
3. You'll see green checkmark when done
4. **Note the URL:** https://leave-management-backend-xxx.onrender.com
5. Test health: Visit https://leave-management-backend-xxx.onrender.com/health
   - Should show: `{"message":"Leave Management API is running"}`

---

## PART 4: Frontend Deployment (Vercel)

### 4.1 Update Frontend Environment

**In `frontend/.env.production`:**
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```
Replace `your-backend-url` with your actual Render URL

Push this change:
```bash
git add frontend/.env.production
git commit -m "Update API URL for production"
git push origin main
```

### 4.2 Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub
4. Authorize Vercel

### 4.3 Deploy Frontend
1. Dashboard → "Add New..." → "Project"
2. Import your GitHub repository
3. Click "Continue"

### 4.4 Configure Project
1. **Framework Preset:** Vite
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. Leave Install Command as default

### 4.5 Environment Variables
1. Add environment variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.onrender.com/api`
2. Click "Add"

### 4.6 Deploy
1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. You'll get a URL: https://your-project.vercel.app
4. Click link to test

---

## 4.7 Finalize: Update Render with Frontend URL

Go back to Render and add CORS configuration if needed:

**In `backend/server.js`**, the CORS is already set to allow all origins. For production, update:

```javascript
const cors = require('cors');
const corsOptions = {
  origin: 'https://your-vercel-url.vercel.app',
  credentials: true
};
app.use(cors(corsOptions));
```

Commit and push:
```bash
git add backend/server.js
git commit -m "Update CORS for production"
git push origin main
```

Render will auto-redeploy.

---

## 5. TESTING

### 5.1 Create Test Users

Visit your frontend: https://your-project.vercel.app/register

Register these test users:

**Principal**
- Name: Dr. Principal
- Email: principal@school.edu
- Password: Test@123456
- Role: Principal
- Department: Administration

**HOD**
- Name: Prof. HOD
- Email: hod@school.edu
- Password: Test@123456
- Role: HOD
- Department: Computer Science

**Staff**
- Name: Ms. Staff
- Email: staff@school.edu
- Password: Test@123456
- Role: Staff

**Student**
- Name: John Student
- Email: student@school.edu
- Password: Test@123456
- Role: Student

### 5.2 Test Workflow

1. **Login as Student**
   - Go to Dashboard
   - Click "Apply for Leave"
   - Submit a leave request
   - Go to "My Leaves" to view status

2. **Login as Staff**
   - Go to "Pending Approvals"
   - Approve the student's leave
   - Status should change to "pending_hod"

3. **Login as HOD**
   - Go to "Pending Approvals"
   - Approve the student's leave
   - Status should change to "pending_principal"

4. **Login as Principal**
   - Go to "Pending Approvals"
   - Approve the student's leave
   - Status should change to "approved"
   - Go to "All Leaves" to see complete record

---

## 6. MONITORING & MAINTENANCE

### 6.1 Monitor Backend
1. Go to Render Dashboard
2. Click on your service
3. Check "Logs" for errors
4. Check "Metrics" for performance

### 6.2 Monitor Frontend
1. Go to Vercel Dashboard
2. Click on your project
3. Check "Deployments" for build status
4. Check "Analytics" for performance

### 6.3 Monitor Database
1. Go to MongoDB Atlas
2. Click "Collections" to view data
3. Check "Monitoring" for performance
4. Review "Activity" for user actions

---

## 7. TROUBLESHOOTING

### Build Failures

**Render Build Error**
```
npm ERR! code ERESOLVE
```
Solution: Update `backend/package.json`
```json
"engines": {
  "node": ">=16.0.0"
}
```

**Vercel Build Error**
```
Cannot find module
```
Solution: Clear cache in Vercel
- Project Settings → General → "Redeploy"

### Runtime Errors

**Database Connection Error**
- Check MongoDB connection string
- Verify whitelist includes Render IP
- Ensure user credentials are correct

**API Not Reaching Backend**
- Check CORS settings
- Verify backend URL in frontend `.env`
- Test: curl https://backend-url.onrender.com/health

**Authentication Fails**
- Check JWT_SECRET matches on backend
- Verify token expiry
- Check localStorage for token

---

## 8. OPTIMIZATION FOR PRODUCTION

### 8.1 Backend Optimization
```javascript
// Add caching headers in server.js
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});
```

### 8.2 Frontend Optimization
- Images are already optimized by Vite
- CSS is minified automatically
- JavaScript is bundled and minified

### 8.3 Database Optimization
- Create indexes for frequently queried fields
- Archive old leave records
- Use pagination for large datasets

---

## 9. POST-DEPLOYMENT CHECKLIST

- [ ] Backend is running on Render
- [ ] Frontend is deployed on Vercel
- [ ] MongoDB Atlas cluster is active
- [ ] Environment variables are set correctly
- [ ] Test users can register and login
- [ ] Leave workflow works end-to-end
- [ ] API endpoints respond with correct status codes
- [ ] No CORS errors in browser console
- [ ] Logs show no critical errors
- [ ] Performance metrics are acceptable

---

## 10. NEXT STEPS

### Potential Enhancements
1. **Email Notifications**
   - Send email when status changes
   - Use SendGrid or Gmail API

2. **Attendance Integration**
   - Sync leave data with attendance
   - Auto-mark leaves in attendance

3. **Holiday Management**
   - Add holiday calendar
   - Auto-reject leaves on holidays

4. **Leave Balance**
   - Track remaining leave days
   - Set annual leave quotas

5. **Reports & Analytics**
   - Generate leave reports
   - Department-wise statistics
   - Export to Excel

6. **Mobile App**
   - React Native mobile app
   - Push notifications

---

## 11. SUPPORT & RESOURCES

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Docs:** https://docs.mongodb.com
- **React Docs:** https://react.dev
- **Express Docs:** https://expressjs.com

---

**Deployment Complete!** 🎉

Your Leave Management System is now live and ready to use.

Questions? Check the main README.md for troubleshooting.
