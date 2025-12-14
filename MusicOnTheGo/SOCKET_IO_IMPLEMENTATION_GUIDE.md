# Socket.io Implementation Guide

## 🎯 Overview

This guide will help you implement real-time features using Socket.io for instant messaging, live notifications, and real-time updates.

---

## 📦 Installation

### Backend
```bash
cd MusicOnTheGo/backend
npm install socket.io
```

### Frontend
```bash
cd MusicOnTheGo/frontend
npx expo install socket.io-client
```

---

## 🔧 Backend Setup

### 1. Update `server.js`

```javascript
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, specify your frontend URL
    methods: ["GET", "POST"]
  }
});

// ... your existing Express setup ...

// Socket.io connection handling
io.use((socket, next) => {
  // Authenticate socket connection
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  
  // Verify JWT token (use your existing auth logic)
  // If valid, attach user to socket
  // socket.user = decodedUser;
  next();
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user's personal room
  socket.join(`user:${socket.user.id}`);
  
  // Handle joining chat room
  socket.on('join-chat', (otherUserId) => {
    const roomId = [socket.user.id, otherUserId].sort().join('-');
    socket.join(`chat:${roomId}`);
  });
  
  // Handle leaving chat room
  socket.on('leave-chat', (otherUserId) => {
    const roomId = [socket.user.id, otherUserId].sort().join('-');
    socket.leave(`chat:${roomId}`);
  });
  
  // Handle sending message
  socket.on('send-message', async (data) => {
    const { recipientId, text } = data;
    
    // Save message to database (use your existing Message model)
    const message = await Message.create({
      sender: socket.user.id,
      recipient: recipientId,
      text: text.trim(),
    });
    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name profileImage')
      .populate('recipient', 'name profileImage');
    
    // Emit to recipient
    const roomId = [socket.user.id, recipientId].sort().join('-');
    io.to(`chat:${roomId}`).emit('new-message', populatedMessage);
  });
  
  // Handle typing indicator
  socket.on('typing', (data) => {
    const { recipientId, isTyping } = data;
    const roomId = [socket.user.id, recipientId].sort().join('-');
    socket.to(`chat:${roomId}`).emit('user-typing', {
      userId: socket.user.id,
      isTyping
    });
  });
  
  // Handle like on community post
  socket.on('like-post', async (data) => {
    const { postId } = data;
    // Update post in database
    // Emit to all users viewing that post
    io.emit('post-liked', { postId, userId: socket.user.id });
  });
  
  // Handle new comment
  socket.on('new-comment', async (data) => {
    const { postId, text } = data;
    // Save comment to database
    // Emit to all users viewing that post
    io.emit('comment-added', { postId, comment: newComment });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Update your server to use httpServer instead of app
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 📱 Frontend Setup

### 1. Create Socket Context (`lib/socket.ts`)

```typescript
import { io, Socket } from 'socket.io-client';
import { getTokenFromStorage } from './auth';

let socket: Socket | null = null;

export const initSocket = async (): Promise<Socket> => {
  if (socket?.connected) {
    return socket;
  }

  const token = await getTokenFromStorage();
  
  socket = io('http://your-backend-url', {
    auth: {
      token: token || '',
    },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### 2. Update Chat Screen (`app/chat/[id].tsx`)

```typescript
import { useEffect, useRef } from 'react';
import { initSocket, getSocket } from '../../lib/socket';

export default function ChatScreen() {
  const socketRef = useRef<Socket | null>(null);
  
  useEffect(() => {
    // Initialize socket
    initSocket().then((socket) => {
      socketRef.current = socket;
      
      // Join chat room
      socket.emit('join-chat', contactId);
      
      // Listen for new messages
      socket.on('new-message', (message) => {
        // Add message to state
        setMessages((prev) => [...prev, formatMessage(message)]);
      });
      
      // Listen for typing indicator
      socket.on('user-typing', (data) => {
        if (data.userId === contactId) {
          setIsTyping(data.isTyping);
        }
      });
    });
    
    return () => {
      // Cleanup
      if (socketRef.current) {
        socketRef.current.emit('leave-chat', contactId);
        socketRef.current.off('new-message');
        socketRef.current.off('user-typing');
      }
    };
  }, [contactId]);
  
  const handleSend = async (text: string) => {
    // Optimistic update (already implemented)
    // ...
    
    // Send via socket
    if (socketRef.current) {
      socketRef.current.emit('send-message', {
        recipientId: contactId,
        text: text.trim(),
      });
    }
  };
  
  const handleTyping = (isTyping: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', {
        recipientId: contactId,
        isTyping,
      });
    }
  };
}
```

### 3. Update Community Screen for Real-Time Likes/Comments

```typescript
import { initSocket, getSocket } from '../../lib/socket';

export default function CommunityScreen() {
  useEffect(() => {
    initSocket().then((socket) => {
      // Listen for new likes
      socket.on('post-liked', (data) => {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === data.postId
              ? {
                  ...post,
                  likeCount: post.likeCount + 1,
                  isLiked: data.userId === currentUserId,
                }
              : post
          )
        );
      });
      
      // Listen for new comments
      socket.on('comment-added', (data) => {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === data.postId
              ? {
                  ...post,
                  comments: [...post.comments, data.comment],
                  commentCount: post.commentCount + 1,
                }
              : post
          )
        );
      });
    });
    
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('post-liked');
        socket.off('comment-added');
      }
    };
  }, []);
  
  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p._id === postId);
    if (!post) return;
    
    // Optimistic update
    const wasLiked = post.isLiked;
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              isLiked: !wasLiked,
              likeCount: wasLiked ? p.likeCount - 1 : p.likeCount + 1,
            }
          : p
      )
    );
    
    try {
      // Send via socket
      const socket = getSocket();
      if (socket) {
        socket.emit('like-post', { postId });
      }
      
      // Also update via API (for persistence)
      await api(`/api/community/${postId}/like`, {
        method: 'POST',
        auth: true,
      });
    } catch (error) {
      // Rollback on error
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                isLiked: wasLiked,
                likeCount: wasLiked ? p.likeCount + 1 : p.likeCount - 1,
              }
            : p
        )
      );
    }
  };
}
```

---

## 🔐 Authentication

You'll need to authenticate socket connections. Update your socket middleware:

```javascript
import jwt from 'jsonwebtoken';

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

---

## 🚀 Benefits

1. **Instant Messages**: No polling, messages appear immediately
2. **Live Notifications**: Real-time updates for likes, comments
3. **Better UX**: Feels like modern social media apps
4. **Reduced Server Load**: No constant polling
5. **Battery Efficient**: Only active when needed

---

## 📝 Next Steps

1. Install dependencies
2. Update `server.js` with Socket.io
3. Create socket context in frontend
4. Update chat screen
5. Update community screen for real-time updates
6. Test thoroughly

---

## ⚠️ Important Notes

- **Production**: Use environment variables for backend URL
- **Security**: Always authenticate socket connections
- **Error Handling**: Handle disconnections gracefully
- **Reconnection**: Socket.io handles reconnection automatically
- **Scaling**: For multiple servers, use Redis adapter

