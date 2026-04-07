# Leave Management System - Sample Seed Data

This file contains sample data to help you test the application.

## Sample Test Accounts

### 1. Principal Account
```
Email: principal@school.edu
Password: Principal@123
Role: Principal
Department: Administration
```

### 2. HOD Account (Computer Science)
```
Email: hod.cs@school.edu
Password: HOD@123
Role: HOD
Department: Computer Science
```

### 3. Staff Account
```
Email: staff@school.edu
Password: Staff@123
Role: Staff
Department: Computer Science
```

### 4. Student Account
```
Email: student@school.edu
Password: Student@123
Role: Student
```

## How to Use Sample Data

1. Navigate to the application login page
2. Click "Register" if you don't have an account
3. Create accounts using the above credentials
4. Once registered, log in with those credentials

## Testing the Leave Workflow

### Test Scenario 1: Student Leave Request

1. **Login as Student**
   - Email: student@school.edu
   - Password: Student@123

2. **Apply for Leave**
   - Go to Dashboard
   - Click "Apply for Leave"
   - Select Leave Type: "Casual"
   - From Date: Any date (e.g., 2024-04-15)
   - To Date: 2-3 days later (e.g., 2024-04-17)
   - Reason: "Personal work"
   - Click "Submit"

3. **View Status**
   - Click "My Leaves"
   - See status: "PENDING_STAFF"

4. **Logout and Login as Staff**
   - Email: staff@school.edu
   - Password: Staff@123

5. **Approve Student Leave**
   - Click "Pending Approvals"
   - Find student's leave request
   - Click to expand
   - Click "Approve"
   - Status changes to "PENDING_HOD"

6. **Login as HOD**
   - Email: hod.cs@school.edu
   - Password: HOD@123

7. **Approve as HOD**
   - Click "Pending Approvals"
   - Find the leave request
   - Click "Approve"
   - Status changes to "PENDING_PRINCIPAL"

8. **Login as Principal**
   - Email: principal@school.edu
   - Password: Principal@123

9. **Final Approval**
   - Click "Pending Approvals"
   - Find the leave request
   - Click "Approve"
   - Status changes to "APPROVED"

10. **View All Leaves**
    - Click "All Leaves"
    - See the completed leave request

### Test Scenario 2: Rejection at Any Level

Same as Scenario 1, but at any level:
- Click "Reject" instead of "Approve"
- Add remarks (optional)
- Status changes to "REJECTED"
- Leave cannot be approved further

### Test Scenario 3: Staff Leave Request

1. Login as Staff
2. Click "Apply for Leave"
3. Apply for leave
4. As Staff, your leave goes directly to Principal
   - Status: "PENDING_PRINCIPAL"
   - No Staff/HOD approval needed
5. Principal approves directly
   - Status: "APPROVED"

---

## Database Structure

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "student" | "staff" | "hod" | "principal",
  department: String (optional),
  createdAt: Date
}
```

### Leaves Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  role: "student" | "staff",
  leaveType: "Casual" | "Sick" | "Earned" | "Medical" | "Special",
  reason: String,
  fromDate: Date,
  toDate: Date,
  status: "pending_staff" | "pending_hod" | "pending_principal" | "approved" | "rejected",
  approvals: {
    staffApproval: {
      status: "pending" | "approved" | "rejected",
      approvedBy: ObjectId (ref: User),
      remarks: String,
      approvedAt: Date
    },
    hodApproval: {
      status: "pending" | "approved" | "rejected",
      approvedBy: ObjectId (ref: User),
      remarks: String,
      approvedAt: Date
    },
    principalApproval: {
      status: "pending" | "approved" | "rejected",
      approvedBy: ObjectId (ref: User),
      remarks: String,
      approvedAt: Date
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## Common Testing Flows

### Flow 1: Complete Student Leave Approval
Student → Staff Approve → HOD Approve → Principal Approve → APPROVED

### Flow 2: Rejection at Staff Level
Student → Staff Reject → REJECTED (End)

### Flow 3: Rejection at HOD Level
Student → Staff Approve → HOD Reject → REJECTED (End)

### Flow 4: Staff Direct Approval
Staff Apply → Principal Approve → APPROVED

### Flow 5: View All Leaves
Principal → "All Leaves" → Filter by status → See all requests

---

## Tips for Testing

1. **Use different browsers/tabs** to simulate multiple users
2. **Check browser console** for any errors
3. **Verify timestamps** in database for approval times
4. **Test invalid dates** (to date before from date) - should be rejected
5. **Test with long text** in reason - should handle properly
6. **Test role restrictions** - students shouldn't see approvals page
7. **Test token expiration** - use for longer than 7 days
8. **Test concurrent requests** - apply multiple leaves at once

---

## Resetting Data

To reset all data and start fresh:

1. Go to MongoDB Atlas
2. Collection → Leave → Delete
3. Collection → User → Delete
4. Recreate accounts as needed

Or drop the entire database and create a new one:

1. MongoDB Atlas Dashboard
2. Cluster → Collections
3. Drop Database
4. Create new database on first write

---

## Expected Behavior

✅ **Student cannot apply for more than one leave per day**
❌ **Note:** This validation is not implemented. Add to ApplyLeave.jsx if needed.

✅ **Staff/HOD cannot apply for/approve own leaves**
❌ **Note:** This validation is not implemented. Add business logic if needed.

✅ **Dates cannot be in the past**
❌ **Note:** This validation is not implemented. Add form validation if needed.

---

## Next Steps

1. Create all test accounts
2. Test the workflow above
3. Check logs for any errors
4. Add validation as needed
5. Deploy to production

Enjoy testing! 🎉
