# MusicOnTheGo - Project Overview

## 🎯 Project Purpose
A full-stack mobile application connecting music students with teachers for lessons, practice tracking, resources, and community engagement.

---

## 🏗️ Architecture Overview

### **Frontend → Backend Connection**
- **API Layer**: `frontend/lib/api.ts` - Centralized HTTP client using `fetch`
  - Base URL: `http://localhost:5050` (dev) or `EXPO_PUBLIC_API_URL` env variable
  - Auto-attaches JWT token from storage to all requests (`Authorization: Bearer <token>`)
  - Handles JSON/FormData automatically

- **Authentication**: `frontend/lib/auth.ts`
  - Stores JWT token and user data in AsyncStorage
  - `saveAuth()` - saves token after login/register
  - `clearAuth()` - removes token on logout

- **Real-time**: `frontend/lib/socket.ts`
  - Socket.io client for live messaging, booking notifications
  - Authenticates with JWT token on connection
  - Auto-reconnects on token change

### **Backend → Frontend**
- **Server**: `backend/server.js` - Express server on port 5050
  - REST API routes: `/api/auth`, `/api/users`, `/api/bookings`, etc.
  - Socket.io server for real-time features
  - MongoDB connection via Mongoose
  - JWT authentication middleware

---

## 📁 Folder Structure

### **Backend** (`/backend`)
```
├── server.js              # Entry point: Express + Socket.io setup
├── models/                # Mongoose schemas (User, Booking, Message, etc.)
├── routes/                # API endpoints (authRoutes, bookingRoutes, etc.)
├── middleware/            # authMiddleware (JWT verification), roleMiddleware
└── utils/                 # emailService (password reset emails)
```

**Key Models:**
- `User.js` - Students & Teachers (role-based)
- `Booking.js` - Lesson bookings
- `Message.js` - Chat messages
- `CommunityPost.js` - Community feed posts
- `Resource.js` - Teaching materials
- `PracticeSession.js` - Student practice logs

### **Frontend** (`/frontend`)
```
├── app/                   # Expo Router file-based routing
│   ├── (auth)/            # Login, Register screens
│   ├── (student)/         # Student-only screens
│   │   ├── dashboard/     # Home, Lessons, Settings tabs
│   │   ├── book-lesson.tsx
│   │   ├── practice-log.tsx
│   │   ├── resources.tsx
│   │   └── community.tsx
│   ├── (teacher)/         # Teacher-only screens
│   │   ├── dashboard/     # Schedule, Bookings, Analytics tabs
│   │   ├── students.tsx
│   │   ├── resources.tsx
│   │   └── community.tsx
│   ├── chat/[id].tsx      # Individual chat screen
│   └── messages.tsx       # Messages list
├── lib/
│   ├── api.ts             # HTTP client (all API calls)
│   ├── auth.ts            # Token storage/retrieval
│   ├── socket.ts          # Socket.io client
│   └── storage.ts         # AsyncStorage wrapper
└── components/            # Reusable UI components
```

---

## 🔑 Key Features & API Endpoints

### **1. Authentication** (`/api/auth`)
- `POST /api/auth/register` - Register student/teacher
- `POST /api/auth/login` - Login (returns JWT token)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset with token

**Frontend**: `app/(auth)/login.tsx`, `register-student.tsx`, `register-teacher.tsx`

### **2. User Management** (`/api/users`)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/teachers` - List all teachers (paginated)

**Frontend**: `api("/api/users/me")` in dashboards

### **3. Bookings** (`/api/bookings`)
- `POST /api/bookings` - Create booking request
- `GET /api/bookings` - Get user's bookings
- `PUT /api/bookings/:id/accept` - Teacher accepts
- `PUT /api/bookings/:id/reject` - Teacher rejects

**Real-time**: Socket.io emits `booking-created`, `booking-accepted` events

**Frontend**: 
- `app/(student)/book-lesson.tsx` - Create booking
- `app/(student)/my-bookings.tsx` - View bookings
- `app/(teacher)/dashboard/_tabs/BookingsTab.tsx` - Manage bookings

### **4. Availability** (`/api/availability`)
- `POST /api/availability` - Teacher sets available times
- `GET /api/availability/:teacherId` - Get teacher's availability

**Real-time**: Socket.io room `teacher-availability:{teacherId}`

**Frontend**: `app/(teacher)/dashboard/_tabs/TimesTab.tsx`

### **5. Messaging** (`/api/messages`)
- `GET /api/messages` - Get conversation list
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages` - Send message (also via Socket.io)

**Real-time**: Socket.io events:
- `send-message` - Send message
- `new-message` - Receive message
- `typing` - Typing indicator
- `mark-read` - Mark messages as read

**Frontend**: `app/messages.tsx`, `app/chat/[id].tsx`

### **6. Community** (`/api/community`)
- `GET /api/community` - Get posts (paginated)
- `POST /api/community` - Create post (video/audio/image/PDF)
- `POST /api/community/:id/like` - Like post
- `POST /api/community/:id/comment` - Add comment

**Frontend**: `app/(student)/community.tsx`, `app/(teacher)/community.tsx`

**Key Function**: `pickMedia()` - Uses `DocumentPicker` for images/PDFs, `ImagePicker` for videos, `Audio` recorder for audio

### **7. Resources** (`/api/resources`)
- `GET /api/resources` - Get resources
- `POST /api/resources` - Teacher creates resource
- `POST /api/resources/:id/assign` - Assign to student

**Frontend**: `app/(student)/resources.tsx`, `app/(teacher)/resources.tsx`

### **8. Practice Tracking** (`/api/practice`)
- `POST /api/practice/sessions` - Log practice session
- `GET /api/practice/sessions` - Get practice history
- `GET /api/practice/stats` - Get practice statistics

**Frontend**: `app/(student)/practice-log.tsx`, `app/(student)/practice-timer.tsx`

### **9. File Uploads** (`/api/uploads`)
- `POST /api/uploads/resource-file` - Upload to Cloudinary
- Returns Cloudinary URL for media storage

**Frontend**: Used in community posts, profile images, resources

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React Native (Expo ~54.0)
- **Routing**: Expo Router (file-based)
- **State Management**: React Query (`@tanstack/react-query`) for server state
- **UI**: React Native components + custom themed components
- **Real-time**: Socket.io-client
- **Storage**: AsyncStorage (via `lib/storage.ts`)
- **Media**: `expo-image-picker`, `expo-document-picker`, `expo-av`

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js 5.1
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.io 4.8
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer

---

## 🔄 Data Flow Examples

### **Example 1: Student Books a Lesson**
1. Student fills form in `book-lesson.tsx`
2. Frontend calls `api("/api/bookings", { method: "POST", body: {...} })`
3. Backend `bookingRoutes.js` validates, creates Booking document
4. Socket.io emits `booking-created` to teacher's room
5. Teacher dashboard receives real-time notification
6. Teacher accepts → Socket.io emits `booking-accepted` to student

### **Example 2: Real-time Chat**
1. User opens chat → `initSocket()` connects with JWT
2. User types → `socket.emit("typing", {...})`
3. User sends → `socket.emit("send-message", {...})`
4. Backend saves to DB, emits `new-message` to chat room
5. Both users receive message instantly

### **Example 3: Community Post with Media**
1. User selects image/PDF via `DocumentPicker.getDocumentAsync()`
2. Frontend uploads to Cloudinary via `api("/api/uploads/resource-file")`
3. Gets Cloudinary URL back
4. Creates post: `api("/api/community", { body: { mediaUrl, mediaType } })`
5. Backend saves post, returns to feed

---

## 🎯 Key Functions to Mention

### **Frontend**
- `api(path, init)` - All HTTP requests (auto JWT, error handling)
- `initSocket()` - Socket.io connection with auth
- `saveAuth(token, user)` - Persist login state
- `pickMedia(type)` - Media selection (video/audio/image/PDF)
- React Query hooks: `useQuery()`, `useMutation()`, `useInfiniteQuery()`

### **Backend**
- `authMiddleware.js` - JWT verification for protected routes
- `roleMiddleware.js` - Teacher/Student role checks
- Socket.io rooms: `user:{id}`, `chat:{roomId}`, `teacher-availability:{id}`
- Cloudinary upload in `uploadRoutes.js`

---

## 📊 Database Schema Highlights

- **User**: email, password (hashed), role, instruments[], profileImage
- **Booking**: student, teacher, date, time, status (pending/accepted/rejected)
- **Message**: sender, recipient, text, read, readAt
- **CommunityPost**: author, title, mediaUrl, mediaType, likes[], comments[]
- **Resource**: teacher, title, fileUrl, assignedTo[]
- **PracticeSession**: student, duration, date, notes

---

## 🔐 Security Features

- JWT tokens stored in AsyncStorage
- Password hashing with bcryptjs (10 rounds)
- Protected routes via `authMiddleware`
- Role-based access control (`roleMiddleware`)
- Socket.io authentication on connection
- CORS enabled for frontend origin

---

## 🚀 Deployment Notes

- Backend: Node.js server (port 5050)
- Frontend: Expo app (can build for iOS/Android)
- Database: MongoDB Atlas (cloud)
- Media: Cloudinary (cloud storage)
- Environment variables: `.env` files for API URLs, JWT_SECRET, MONGO_URI

