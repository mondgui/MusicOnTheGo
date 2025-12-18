## MusicOnTheGo – Mentor Presentation (CS Final Project)

### Slide 1 – Project Overview

- **Problem**: Private music lessons are hard to coordinate: finding teachers, managing schedules, sharing resources, tracking practice, and keeping communication in one place.
- **Solution**: **MusicOnTheGo** – a mobile app where **students** can discover teachers, book lessons, practice with guidance, and join a community; **teachers** can manage availability, bookings, resources, and student progress.
- **High-level features**:
  - **Authentication & profiles** for students and teachers.
  - **Teacher discovery, availability, and bookings**.
  - **Real-time messaging** between students and teachers.
  - **Practice logging, goals, challenges, and analytics**.
  - **Resource management & assignments**.
  - **Community feed** (posts, likes, comments).
  - **Media uploads** (profile pictures, PDFs, audio, video).

---

### Slide 2 – Tech Stack & Architecture

- **Frontend (Mobile)**:
  - **Expo / React Native** with **expo-router** for routing.
  - **TypeScript**, **React Query** for data fetching/caching.
  - **socket.io-client** for real-time messaging and notifications.
  - Shared API helper in `lib/api.ts` and auth helper in `lib/auth.ts`.
- **Backend (API + Real-time)**:
  - **Node.js + Express** REST API (`server.js`).
  - **MongoDB + Mongoose** models (User, Booking, Availability, PracticeSession, etc.).
  - **Socket.io** for real-time chat, bookings, availability notifications.
  - **JWT** authentication + role-based authorization (`authMiddleware`, `roleMiddleware`).
  - **Cloudinary** for file uploads (profile images, resources, recordings).
- **API shape**:
  - REST endpoints grouped under `/api/...` (e.g. `/api/auth`, `/api/users`, `/api/bookings`, etc.).
  - A single Express app mounts route modules from `backend/routes/*.js`.

---

### Slide 3 – Authentication & User Model (Backend)

- **Core endpoints** (`/api/auth` and `/api/users`):
  - **POST `/api/auth/register`**: register student or teacher.
  - **POST `/api/auth/login`**: login and get JWT.
  - **POST `/api/auth/forgot-password`**, **POST `/api/auth/reset-password`**: password reset flow with email and token.
  - **GET `/api/users/me`**: get current logged-in user.
  - **PUT `/api/users/me`**: update profile (student or teacher specific fields).
  - **GET `/api/users/:id`**: fetch user by ID (used in chat/contact info).
- **User data model** (`User`):
  - **Shared**: `name`, `email`, `password`, `role` (`"teacher"` or `"student"`), `instruments[]`, `location`, `profileImage`.
  - **Teacher-specific**: `experience`, `rate`, `specialties[]`, `about`.
  - **Student-specific**: `skillLevel`, `learningMode`, `ageGroup`, `availability`, `goals`, `weeklyGoal`.
  - **Security**: `resetPasswordToken` and `resetPasswordExpires` for password reset.
- **Auth middleware**:
  - `authMiddleware` reads `Authorization: Bearer <token>`, verifies JWT, attaches `{ id, role }` to `req.user`.
  - `roleMiddleware("teacher" | "student")` ensures only certain roles can access specific routes.

---

### Slide 4 – Auth Flow End-to-End (Frontend ↔ Backend)

- **Registration (Student / Teacher)**:
  - Frontend screens: `register-student.tsx`, `register-teacher.tsx`.
  - They call **`POST /api/auth/register`** via `api("/api/auth/register", { method: "POST", body: {...} })`.
  - Payload includes `name`, `email`, `password`, `role`, `instruments[]`, `location`.
  - Backend validates, hashes password, creates `User`, returns `{ token, user }`.
  - Frontend stores token in storage (`storage.setItem("token")`) and routes to role-specific profile setup.
- **Login**:
  - Screen: `login.tsx`.
  - Calls **`POST /api/auth/login`** with `email` and `password`.
  - Backend verifies credentials, signs JWT (`{ id, role }`), returns `{ token, user }`.
  - Frontend:
    - Clears any previous auth (`clearAuth`, clears React Query cache).
    - Stores token + user via `saveAuth(token, user)`.
    - Navigates to `/(teacher)/dashboard` or `/(student)/dashboard` based on `user.role`.
- **Authenticated API calls**:
  - Shared helper `api(path, init)` in `lib/api.ts`:
    - Builds base URL from `EXPO_PUBLIC_API_URL` or local defaults.
    - Automatically loads token from storage and attaches `Authorization: Bearer <token>` (unless `auth: false`).
    - Parses JSON and throws structured errors.

---

### Slide 5 – Teacher Discovery & Profiles

- **Backend endpoints (`/api/teachers` and `/api/users`)**:
  - **GET `/api/teachers`**:
    - Public list of teachers, with **pagination** (`page`, `limit`) and filters (`instrument`, `city`).
    - Returns `teachers[]` plus `pagination` metadata.
  - **GET `/api/teachers/:id`**:
    - Public, returns detailed teacher profile (name, instruments, experience, rate, about, specialties, profile image).
  - **GET `/api/users/:id`**:
    - Authenticated, used by chat to show accurate contact info.
- **Frontend usage**:
  - Student views teacher lists (e.g. in student routes under `/(student)` and teacher detail under `/(student)/teacher/[id].tsx`).
  - Calls `/api/teachers` for search/browse, `/api/teachers/:id` for details.
  - These screens use the shared `api()` helper and then render teacher cards and profile details.

---

### Slide 6 – Availability & Booking API (Backend)

- **Availability endpoints (`/api/availability`)**:
  - **POST `/api/availability`** (teacher only):
    - Teacher defines available `day`, optional `date`, and `timeSlots[]` (start/end times).
  - **PUT `/api/availability/:id`** (teacher only): update availability entry.
  - **DELETE `/api/availability/:id`** (teacher only): remove availability.
  - **GET `/api/availability/me`** (teacher only): list own future availability.
  - **GET `/api/availability/teacher/:teacherId`** (public/student):
    - Returns upcoming availability for that teacher, filtering out past dates and time slots that are already booked (`status: "approved"`).
- **Booking endpoints (`/api/bookings`)**:
  - **POST `/api/bookings`** (student only):
    - Body: `{ teacher, day, timeSlot: { start, end } }`.
    - Validations:
      - Student must have had a **conversation with the teacher** (checks `Message` collection).
      - Prevent duplicate or conflicting bookings (both for the same student and same slot with others).
  - **PUT `/api/bookings/:id/status`** (teacher only):
    - Update status: `"pending" → "approved" | "rejected"`.
    - On approval, automatically rejects other pending bookings for that same time slot.
  - **GET `/api/bookings/student/me`** (student only): list student’s bookings with pagination.
  - **GET `/api/bookings/teacher/me`** (teacher only): list teacher’s bookings with pagination.
  - **DELETE `/api/bookings/:id`**: delete booking if you are the student, teacher, or admin.

---

### Slide 7 – Availability & Booking Flow End-to-End

- **1. Teacher sets availability**:
  - Teacher dashboard screen calls **`POST /api/availability`** with selected date/day and time slots.
  - Backend stores `Availability` document linked to teacher ID.
  - Backend emits `availability-updated` over Socket.io to `teacher-availability:<teacherId>` so any open teacher calendar UI can refresh live.
- **2. Student views availability & books**:
  - Student opens a teacher profile and availability screen.
  - Frontend calls **`GET /api/availability/teacher/:teacherId`** to get future open time slots (already filtered against approved bookings).
  - Student picks a slot and calls **`POST /api/bookings`**.
  - Backend checks:
    - Existence of prior messages between student and teacher.
    - Conflicts with existing bookings.
    - Then creates a `Booking` document.
- **3. Real-time notifications & status changes**:
  - On new booking, backend emits:
    - `new-booking-request` to `user:<teacherId>`.
    - `booking-updated` to `teacher-bookings:<teacherId>`.
  - Teacher approves/rejects via **`PUT /api/bookings/:id/status`**:
    - On approval, backend rejects other pending requests for that slot.
    - Emits `booking-status-changed` notification to student and `booking-updated` to both teacher and student booking rooms.
  - Frontend teacher/student dashboards subscribe to these Socket.io rooms for real-time UI updates.

---

### Slide 8 – Messaging API & Real-time Layer (Backend)

- **HTTP messaging endpoints (`/api/messages`)**:
  - **GET `/api/messages/conversation/:userId`**:
    - Returns full message history between current user and `userId`, marks incoming messages as `read`.
  - **POST `/api/messages`**:
    - Sends a new message `{ recipientId, text }`; saves it as a `Message` document and echoes back the populated message.
  - **GET `/api/messages/conversations`**:
    - Returns a **list of conversations** (one per contact), with:
      - `userId`, `name`, `profileImage`, `email`.
      - `lastMessage`, `lastMessageTime`, `unreadCount`.
      - Supports pagination (`page`, `limit`).
  - **GET `/api/messages/unread-count`**:
    - Returns total number of unread messages for the current user.
- **Socket.io events (defined in `server.js`)**:
  - **Client → server**:
    - `join-chat(otherUserId)`, `leave-chat(otherUserId)` – join/leave chat rooms.
    - `send-message({ recipientId, text })` – create and broadcast a message.
    - `typing({ recipientId, isTyping })` – typing indicator.
    - `mark-read({ senderId })` – mark messages from a sender as read.
  - **Server → client**:
    - `new-message` – to both users in a chat room when a message is sent.
    - `message-notification` – to recipient’s personal room with updated unread count.
    - `user-typing` – to show “user is typing”.
    - `messages-read` – informs sender that their messages were marked as read.
- **Authentication on sockets**:
  - On connection, client sends `{ auth: { token } }`.
  - Server verifies JWT and attaches `socket.user` `{ id, role }`.
  - Server uses room naming conventions like `chat:<sorted-user-ids>` and `user:<userId>`.

---

### Slide 9 – Messaging Flow End-to-End (Messages Screen & Chat Screen)

- **Messages list (`messages.tsx`)**:
  - Uses React Query to call:
    - **`GET /api/users/me`** to identify the current user.
    - **`GET /api/bookings/teacher/me`** or `/student/me` to merge bookings into contact list.
    - **`GET /api/messages/conversations`** (with pagination) to get contacts + unread counts.
  - Initializes Socket.io with `initSocket()`:
    - Listens for `message-notification` and `new-message` to update the React Query cache in real time.
- **Chat screen (`chat/[id].tsx`)**:
  - On mount:
    - Loads current user via **`GET /api/users/me`**.
    - Loads contact details via **`GET /api/users/:id`**.
    - Fetches messages via **`GET /api/messages/conversation/:id`**.
  - Initializes a Socket.io connection and joins the room with `join-chat(contactId)`.
  - **Sending a message**:
    - Optimistically appends a temp message to local state.
    - Emits `send-message` with `{ recipientId, text }`.
    - Real message arrives back via `new-message` and replaces the temp one.
  - **Typing indicator**:
    - Emits `typing` events as the user types; UI shows “X is typing…” based on `user-typing` events.
  - On unmount / route change it leaves the chat room and cleans up listeners.

---

### Slide 10 – Inquiries (Pre-booking Contact Between Students and Teachers)

- **Backend endpoints (`/api/inquiries`)**:
  - **POST `/api/inquiries`** (student):
    - Sends an inquiry to a teacher with details: instrument, level, age group, lessonType, availability, message, goals, guardian info.
  - **GET `/api/inquiries/teacher/me`** (teacher):
    - List all inquiries received by the teacher (with student info populated).
  - **PUT `/api/inquiries/:id/read`** (teacher):
    - Mark inquiry as `"read"` (from `"sent"`).
  - **PUT `/api/inquiries/:id/responded`** (teacher):
    - Mark `"responded"` after teacher replies.
- **Frontend integration (`messages.tsx`)**:
  - For teachers, the Messages screen shows two tabs:
    - **Conversations** – regular chats.
    - **Inquiries** – incoming inquiries fetched from `/api/inquiries/teacher/me`.
  - When a teacher taps “Contact student”:
    - It marks the inquiry as read (`PUT /api/inquiries/:id/read`).
    - Navigates to `chat/[id]` with pre-filled message if coming from an inquiry.
  - This flow is **enforced at booking time**: bookings require an existing conversation, so inquiries and first messages come before bookings.

---

### Slide 11 – Resources & File Uploads

- **Resource API (`/api/resources`)**:
  - **GET `/api/resources`**:
    - Public-like listing (usually for students) with filters: `instrument`, `level`, `category`.
  - **GET `/api/resources/me`** (teacher): resources uploaded by current teacher.
  - **POST `/api/resources`** (teacher):
    - Creates a new teaching resource (title, description, `fileUrl` or `externalUrl`, `fileType`, `instrument`, `level`, etc.).
  - **PUT `/api/resources/:id`**, **DELETE `/api/resources/:id`**:
    - Update / delete only if `uploadedBy` is the current teacher.
- **Assignments**:
  - **POST `/api/resources/:id/assign`** (teacher):
    - Assigns a resource to multiple students, optionally with personalized notes.
  - **DELETE `/api/resources/:id/assign/:studentId`** (teacher): unassign from a student.
  - **GET `/api/resources/assigned`** (student):
    - Returns resources assigned to the current student, including teacher notes.
  - **GET `/api/resources/assignments`** (teacher):
    - Returns resources with per-student assignment info (notes, timestamps).
  - **PUT/DELETE `/api/resources/:id/assign/:studentId/note`**:
    - Update or clear notes on a particular assignment.
- **Student personal resources**:
  - **POST `/api/resources/personal`**, **GET `/api/resources/personal`**, **DELETE `/api/resources/personal/:id`**:
    - Let students upload and manage their own practice files.
- **Uploads (`/api/uploads`)**:
  - **POST `/api/uploads/profile-image`**:
    - Authenticated image upload to Cloudinary (`profile-images` folder), returns `url` for `profileImage`.
  - **POST `/api/uploads/resource-file`**:
    - Authenticated upload for PDFs, images, audio, video; stores in Cloudinary `resources` folder; returns `url`, `fileSize`, `fileType`.
- **Frontend interaction**:
  - Teacher/Student resource screens use multipart/form-data to upload files, then pass the returned `url` into resource creation endpoints.
  - Students see both **assigned resources** and **personal resources** in their resources UI.

---

### Slide 12 – Practice Tracking, Goals, and Recordings

- **Practice sessions (`/api/practice/sessions`)**:
  - **POST `/api/practice/sessions`** (student):
    - Logs a practice session: `minutes`, `focus`, optional `notes`, `date`, `startTime`, `endTime`.
  - **GET `/api/practice/sessions/me`** (student): list own sessions.
  - **GET `/api/practice/sessions/student/:studentId`** (teacher): view a student’s sessions.
- **Practice stats (`/api/practice/stats`)**:
  - **GET `/api/practice/stats/me`** (student):
    - Computes weekly minutes, progress vs weekly goals, practice streak, and badges (e.g. “7-Day Streak”, “1000 minutes”).
  - **GET `/api/practice/stats/student/:studentId`** (teacher):
    - Same metrics but for a specific student.
- **Goals (`/api/practice/goals`)**:
  - **POST `/api/practice/goals`** (student):
    - Creates a goal with `title`, `category`, `targetDate`, `weeklyMinutes`, `progress`.
  - **GET `/api/practice/goals/me`**, **PUT `/api/practice/goals/:id`**, **DELETE `/api/practice/goals/:id`**:
    - Manage student goals; teacher can view via **GET `/api/practice/goals/student/:studentId`**.
- **Recordings (`/api/practice/recordings`)**:
  - **POST `/api/practice/recordings`** (student):
    - Stores metadata about a recording: `title`, `fileUrl`, duration, student notes, optional `teacher`.
  - **GET `/api/practice/recordings/me`** (student) and `/recordings/student/:studentId` (teacher).
  - **PUT `/api/practice/recordings/:id/feedback`** (teacher):
    - Adds `teacherFeedback` to a recording; teacher must either be assigned or have an approved booking with that student.
- **Frontend**:
  - Practice-related screens (`practice-log`, `practice-timer`, `dashboard` tabs) call these endpoints and display charts, badges, goals, and recordings.

---

### Slide 13 – Challenges & Gamification

- **Student-facing challenge endpoints (`/api/challenges`)**:
  - **GET `/api/challenges`**:
    - Lists active challenges that are either public or assigned to the student; filter by `instrument`, `difficulty`, `status`.
    - For each challenge, attaches the student’s `progress`, `isJoined`, `isCompleted`.
  - **GET `/api/challenges/me`**:
    - Shows challenges that the student has joined (`ChallengeProgress` docs).
  - **GET `/api/challenges/:id`**:
    - Detailed view, including student-specific progress if they are a student.
  - **POST `/api/challenges/:id/join`**, **POST `/api/challenges/:id/leave`**:
    - Join / leave challenges, respecting visibility rules (public vs private assigned-only).
- **Teacher-facing challenge endpoints**:
  - **GET `/api/challenges/teacher/me`**:
    - Lists challenges created by the teacher, plus participant progress.
  - **POST `/api/challenges`**:
    - Create a challenge with `title`, `description`, `difficulty`, `deadline`, `requirements` (e.g. practice days), `instrument`, `visibility`, `assignedStudents`.
  - **PUT `/api/challenges/:id`**, **DELETE `/api/challenges/:id`**:
    - Update or delete teacher’s own challenges.
- **Automatic progress updates**:
  - **POST `/api/challenges/update-progress`**:
    - Internal endpoint that recomputes progress for active challenges based on `PracticeSession` data (e.g. number of practice days or sessions).
- **Frontend**:
  - Student dashboard surfaces challenges with progress bars.
  - Teacher dashboard shows challenge creation forms and participant stats.

---

### Slide 14 – Community Feed (Social Layer)

- **Community endpoints (`/api/community`)**:
  - **GET `/api/community`**:
    - Returns a feed of posts filtered by `filter` (`all`, `students`, `teachers`), `instrument`, and `sort` (`recent`, `popular`, `comments`).
    - Visibility rules (`public`, `students`, `teachers`) are applied based on the viewer’s role.
  - **GET `/api/community/me`**:
    - Current user’s posts.
  - **GET `/api/community/:id`**:
    - Detailed view of a single post with like status and comments.
  - **POST `/api/community`**:
    - Create a post with `title`, `description`, `mediaUrl`, `mediaType` (video/audio/image), `thumbnailUrl`, `instrument`, `level`, `visibility`.
  - **PUT `/api/community/:id`**, **DELETE `/api/community/:id`**:
    - Edit or delete a post (author only).
  - **POST `/api/community/:id/like`**:
    - Like/unlike a post, updates like count and `isLiked`.
  - **POST `/api/community/:id/comment`**, **DELETE `/api/community/:id/comment/:commentId`**:
    - Add/delete comments (by comment author or post author).
- **Frontend**:
  - Separate community screens for students and teachers under `/(student)/community.tsx` and `/(teacher)/community.tsx`.
  - Feeds show media, likes, comments; filter controls mirror query params.

---

### Slide 15 – How Backend & Frontend Communicate (Design Summary)

- **REST API via `api.ts`**:
  - All HTTP endpoints share:
    - Consistent base URL logic (`EXPO_PUBLIC_API_URL` or platform-specific localhost).
    - Automatic JSON handling and error messaging.
    - Optional query params (`init.params`) and automatic Authorization header.
- **State management & caching**:
  - **React Query** handles:
    - Data fetching, caching, and background refetch for critical data like `users/me`, conversations, bookings, inquiries, practice stats.
    - Infinite scroll where needed (e.g., conversations).
- **Real-time channel via `socket.ts`**:
  - `initSocket()` uses the same base URL and JWT from storage.
  - Shared across features:
    - **Chat** (messages, typing).
    - **Bookings and availability** (teacher/student rooms).
    - **Notifications** (personal user rooms for message notifications).
- **Separation of concerns**:
  - **Backend**: encapsulates business rules (who can book, who can modify what, conflict detection).
  - **Frontend**: focuses on UX, navigation, and presenting data/state from the API and sockets.

---

### Slide 16 – Security & Reliability Considerations

- **Authentication & roles**:
  - JWT-based auth (`Authorization: Bearer <token>`).
  - Role checks for endpoints that should only be accessible to teachers or students (e.g., bookings, availability, resources, goals).
  - Socket.io authentication middleware mirrors HTTP auth (same JWT).
- **Data validation & constraints**:
  - Mongoose schemas for all entities (User, Booking, Availability, PracticeSession, etc.).
  - Booking routes prevent double-booking and enforce pre-contact via messages.
  - Password reset tokens are generated securely, stored as hashes, and have expiration times.
- **Files & secrets**:
  - Cloudinary credentials stored in environment variables (`.env`).
  - Backend validates file types & sizes and sanitizes upload flow.
- **Error handling**:
  - API helper surfaces meaningful error messages (e.g., network issues vs validation).
  - Backend routes consistently respond with structured JSON errors (`{ message: ... }`).

---

### Slide 17 – CS / Engineering Talking Points

- **Domain modeling**:
  - Clear separation of concerns between entities:
    - `User`, `Booking`, `Availability`, `Message`, `Resource`, `ResourceAssignment`, `PracticeSession`, `Goal`, `Recording`, `Challenge`, `ChallengeProgress`, `CommunityPost`, `Inquiry`.
  - This allows focused logic per concern (e.g., bookings vs practice analytics).
- **Patterns & design decisions**:
  - **RESTful design** for clarity and easy debugging.
  - **JWT + middleware** pattern for shared auth across routes and sockets.
  - **Socket.io** chosen over polling to support real-time messaging and notifications efficiently.
  - **React Query** chosen to reduce boilerplate around loading/error states and to support caching and pagination.
- **Scalability thoughts**:
  - Pagination built into list endpoints (teachers, bookings, conversations, community posts).
  - Socket room naming and event design supports adding more real-time features (e.g., live lesson sessions, notifications).

---

### Slide 18 – Future Improvements & Extensions

- **Potential backend improvements**:
  - Add **rate limiting** and more granular roles (e.g., admin).
  - Refine **logging and monitoring** for production.
  - Extract business logic into service layers for better testability.
- **Potential frontend improvements**:
  - Add offline support for practice logging and message drafts.
  - Improve UI/UX for calendar booking and challenge progress visualization.
- **Feature ideas**:
  - Video lesson sessions scheduling + integration with video calling.
  - Recommendation engine for matching students with teachers.
  - Leaderboards and more advanced social features around practice streaks and challenges.
