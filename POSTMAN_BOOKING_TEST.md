# Postman Testing Guide: Bookings Tab

## Prerequisites
- Backend server running on `http://localhost:5050` (or your server URL)
- Postman installed
- MongoDB connected

---

## Step-by-Step Testing Guide

### **Step 1: Register a Teacher Account**

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:5050/api/auth/register`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "John Teacher",
    "email": "teacher@test.com",
    "password": "password123",
    "role": "teacher",
    "instruments": ["piano", "guitar"],
    "experience": "10 years",
    "location": "New York"
  }
  ```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Teacher",
    "email": "teacher@test.com",
    "role": "teacher",
    "instruments": ["piano", "guitar"]
  }
}
```

**Action:** Copy the `token` and `user.id` - you'll need them!

---

### **Step 2: Register a Student Account**

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:5050/api/auth/register`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "Jane Student",
    "email": "student@test.com",
    "password": "password123",
    "role": "student"
  }
  ```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Jane Student",
    "email": "student@test.com",
    "role": "student"
  }
}
```

**Action:** Copy the `token` and `user.id` from Step 1 (teacher) - you'll need the teacher's ID!

---

### **Step 3: Create a Booking Request (as Student)**

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:5050/api/bookings`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <STUDENT_TOKEN>
  ```
  Replace `<STUDENT_TOKEN>` with the token from Step 2.

- **Body (raw JSON):**
  ```json
  {
    "teacher": "507f1f77bcf86cd799439011",
    "day": "2025-11-15",
    "timeSlot": {
      "start": "14:00",
      "end": "15:00"
    }
  }
  ```
  Replace `"teacher"` with the teacher's ID from Step 1.

**Expected Response:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "student": "507f1f77bcf86cd799439012",
  "teacher": "507f1f77bcf86cd799439011",
  "day": "2025-11-15",
  "timeSlot": {
    "start": "14:00",
    "end": "15:00"
  },
  "status": "pending",
  "createdAt": "2025-11-10T10:00:00.000Z",
  "updatedAt": "2025-11-10T10:00:00.000Z"
}
```

**Action:** Copy the booking `_id` - you'll need it for Step 5!

---

### **Step 4: View Bookings as Teacher (GET /api/bookings/teacher/me)**

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:5050/api/bookings/teacher/me`
- **Headers:**
  ```
  Authorization: Bearer <TEACHER_TOKEN>
  ```
  Replace `<TEACHER_TOKEN>` with the token from Step 1.

**Expected Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "student": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Student",
      "email": "student@test.com"
    },
    "teacher": "507f1f77bcf86cd799439011",
    "day": "2025-11-15",
    "timeSlot": {
      "start": "14:00",
      "end": "15:00"
    },
    "status": "pending",
    "createdAt": "2025-11-10T10:00:00.000Z",
    "updatedAt": "2025-11-10T10:00:00.000Z"
  }
]
```

**✅ This is what the Teacher Dashboard Bookings Tab will display!**

---

### **Step 5: Accept a Booking (as Teacher)**

**Request:**
- **Method:** `PUT`
- **URL:** `http://localhost:5050/api/bookings/<BOOKING_ID>/status`
  Replace `<BOOKING_ID>` with the booking `_id` from Step 3.
  
  Example: `http://localhost:5050/api/bookings/507f1f77bcf86cd799439013/status`

- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <TEACHER_TOKEN>
  ```
  Replace `<TEACHER_TOKEN>` with the token from Step 1.

- **Body (raw JSON):**
  ```json
  {
    "status": "approved"
  }
  ```

**Expected Response:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "student": "507f1f77bcf86cd799439012",
  "teacher": "507f1f77bcf86cd799439011",
  "day": "2025-11-15",
  "timeSlot": {
    "start": "14:00",
    "end": "15:00"
  },
  "status": "approved",
  "createdAt": "2025-11-10T10:00:00.000Z",
  "updatedAt": "2025-11-10T10:05:00.000Z"
}
```

**✅ Status changed to "approved" - this will show as "Confirmed" in the UI!**

---

### **Step 6: Reject a Booking (as Teacher)**

**First, create another booking request (repeat Step 3), then:**

**Request:**
- **Method:** `PUT`
- **URL:** `http://localhost:5050/api/bookings/<NEW_BOOKING_ID>/status`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <TEACHER_TOKEN>
  ```
- **Body (raw JSON):**
  ```json
  {
    "status": "rejected"
  }
  ```

**Expected Response:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "status": "rejected",
  ...
}
```

**✅ Status changed to "rejected" - this booking will be removed from the list in the UI!**

---

### **Step 7: Verify Today's Schedule**

Create a booking for **today's date**:

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:5050/api/bookings`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <STUDENT_TOKEN>
  ```
- **Body (raw JSON):**
  ```json
  {
    "teacher": "507f1f77bcf86cd799439011",
    "day": "2025-11-10",
    "timeSlot": {
      "start": "16:00",
      "end": "17:00"
    }
  }
  ```
  **Note:** Use today's date in `YYYY-MM-DD` format!

Then accept it (Step 5), and it should appear in the "Today's Schedule" section on the Teacher Dashboard home screen.

---

## Testing Checklist

- [ ] Teacher can register and login
- [ ] Student can register and login
- [ ] Student can create a booking request
- [ ] Teacher can view all their bookings (`GET /api/bookings/teacher/me`)
- [ ] Teacher can accept a booking (`PUT /api/bookings/:id/status` with `"approved"`)
- [ ] Teacher can reject a booking (`PUT /api/bookings/:id/status` with `"rejected"`)
- [ ] Accepted bookings show status as "approved" (displays as "Confirmed" in UI)
- [ ] Pending bookings show status as "pending" (displays as "Pending" in UI)
- [ ] Today's bookings appear in the Schedule Tab

---

## Common Issues & Solutions

### Issue: "Unauthorized" or 401 Error
**Solution:** Make sure you're using `Bearer <TOKEN>` in the Authorization header (with a space after "Bearer")

### Issue: "Missing required fields"
**Solution:** Ensure `teacher`, `day`, and `timeSlot` (with `start` and `end`) are all provided

### Issue: "Unauthorized teacher" when accepting/rejecting
**Solution:** Make sure you're using the teacher's token (not the student's) and the booking belongs to that teacher

### Issue: Date format
**Solution:** Use `YYYY-MM-DD` format for the `day` field (e.g., "2025-11-15")

---

## Quick Reference: API Endpoints

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/bookings` | student | Create booking request |
| GET | `/api/bookings/teacher/me` | teacher | Get all bookings for teacher |
| GET | `/api/bookings/student/me` | student | Get all bookings for student |
| PUT | `/api/bookings/:id/status` | teacher | Accept/reject booking |
| DELETE | `/api/bookings/:id` | teacher/student | Delete booking |

---

## Postman Collection Setup Tips

1. **Create Environment Variables:**
   - `base_url`: `http://localhost:5050`
   - `teacher_token`: (set after Step 1)
   - `student_token`: (set after Step 2)
   - `teacher_id`: (set after Step 1)
   - `booking_id`: (set after Step 3)

2. **Use Variables in URLs:**
   - `{{base_url}}/api/bookings`
   - `{{base_url}}/api/bookings/{{booking_id}}/status`

3. **Use Variables in Headers:**
   - `Authorization: Bearer {{teacher_token}}`

This makes testing much faster! 🚀

