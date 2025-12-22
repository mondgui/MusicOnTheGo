# Admin Panel Setup Guide

## Quick Start

### 1. Environment Configuration

Create a `.env` file in the `admin-panel` directory:

```bash
REACT_APP_API_URL=http://localhost:5050
```

(Or your backend server URL if different)

### 2. Create an Admin User

You need to create a user with `role: "admin"` in your database. You can do this in a few ways:

#### Option A: Using MongoDB directly
```javascript
// In MongoDB shell or Compass
db.users.insertOne({
  name: "Admin User",
  email: "admin@musiconthego.com",
  password: "$2a$10$...", // bcrypt hashed password
  role: "admin",
  instruments: [],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

#### Option B: Temporarily modify registration
Temporarily modify `backend/routes/authRoutes.js` to allow admin registration, or create a script:

```javascript
// create-admin.js (run once)
import bcrypt from 'bcryptjs';
import User from './models/User.js';

const adminEmail = 'admin@musiconthego.com';
const adminPassword = 'your-secure-password';

const hashedPassword = await bcrypt.hash(adminPassword, 10);
const admin = new User({
  name: 'Admin',
  email: adminEmail,
  password: hashedPassword,
  role: 'admin',
  instruments: [],
});

await admin.save();
console.log('Admin user created!');
```

### 3. Start the Admin Panel

```bash
cd admin-panel
npm start
```

The admin panel will open at `http://localhost:3000`

### 4. Login

- Navigate to `http://localhost:3000/login`
- Use the admin email and password you created
- You'll be redirected to the dashboard

## Features

### Dashboard
- Overview statistics (users, bookings, messages, practice sessions)
- Real-time data from your backend

### Users Management
- View all users (students and teachers)
- See user details, roles, instruments, join dates

### Bookings Management
- View all lesson bookings
- Filter by status (pending, approved, rejected)
- See student-teacher relationships

### Messages
- View all messages between users
- Monitor conversations
- See read/unread status

### Practice Sessions
- Analytics on all practice sessions
- Track student practice time
- View practice notes

### Resources
- Manage all teaching resources
- See which resources are assigned to students

### Community Posts
- Moderate community posts
- View engagement (likes, comments)
- Manage content visibility

## Backend Endpoints Used

The admin panel uses these endpoints (all require admin authentication):

- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/messages` - All messages
- `GET /api/admin/practice-sessions` - All practice sessions
- `GET /api/admin/community-posts` - All community posts
- `GET /api/users` - All users (existing endpoint)
- `GET /api/resources` - All resources (existing endpoint)

## Security Notes

- Admin routes are protected by authentication middleware
- Only users with `role: "admin"` can access the admin panel
- JWT tokens are stored in localStorage (consider using httpOnly cookies in production)
- In production, enable the `roleMiddleware("admin")` checks in `adminRoutes.js`

## Troubleshooting

### "Access denied" on login
- Make sure the user has `role: "admin"` in the database
- Check that the role field is exactly "admin" (case-sensitive)

### API errors
- Ensure your backend server is running on the port specified in `.env`
- Check that CORS is enabled for `http://localhost:3000`
- Verify the JWT token is being sent in requests

### No data showing
- Check browser console for API errors
- Verify admin endpoints are working: `curl http://localhost:5050/api/admin/stats` (with auth token)
- Make sure you have data in your database

