/**
 * Utility functions for exporting data to CSV
 */

export const exportToCSV = (data, filename, headers) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Prepare CSV content
  let csvContent = '';

  // Add headers if provided
  if (headers && headers.length > 0) {
    csvContent += headers.join(',') + '\n';
  }

  // Add data rows
  data.forEach((row) => {
    const values = Object.values(row).map((value) => {
      // Handle null/undefined
      if (value === null || value === undefined) return '';
      
      // Handle objects (like nested user objects)
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      
      // Handle strings with commas or quotes
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    });
    csvContent += values.join(',') + '\n';
  });

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export users to CSV
 */
export const exportUsers = (users) => {
  const headers = ['ID', 'Name', 'Email', 'Role', 'Instruments', 'Location', 'Created At'];
  const data = users.map((user) => ({
    ID: user._id || user.id || '',
    Name: user.name || '',
    Email: user.email || '',
    Role: user.role || '',
    Instruments: Array.isArray(user.instruments) ? user.instruments.join('; ') : user.instruments || '',
    Location: user.location || '',
    'Created At': user.createdAt ? new Date(user.createdAt).toLocaleString() : '',
  }));
  
  exportToCSV(data, 'users', headers);
};

/**
 * Export bookings to CSV
 */
export const exportBookings = (bookings) => {
  const headers = ['ID', 'Student', 'Teacher', 'Date', 'Time Slot', 'Status', 'Created At'];
  const data = bookings.map((booking) => ({
    ID: booking._id || booking.id || '',
    Student: booking.student?.name || booking.student || '',
    Teacher: booking.teacher?.name || booking.teacher || '',
    Date: booking.day || '',
    'Time Slot': booking.timeSlot ? `${booking.timeSlot.start} - ${booking.timeSlot.end}` : '',
    Status: booking.status || '',
    'Created At': booking.createdAt ? new Date(booking.createdAt).toLocaleString() : '',
  }));
  
  exportToCSV(data, 'bookings', headers);
};

/**
 * Export messages to CSV
 */
export const exportMessages = (messages) => {
  const headers = ['ID', 'From', 'To', 'Message', 'Read', 'Sent At'];
  const data = messages.map((message) => ({
    ID: message._id || message.id || '',
    From: message.sender?.name || message.sender || '',
    To: message.recipient?.name || message.recipient || '',
    Message: message.text || '',
    Read: message.read ? 'Yes' : 'No',
    'Sent At': message.createdAt ? new Date(message.createdAt).toLocaleString() : '',
  }));
  
  exportToCSV(data, 'messages', headers);
};

/**
 * Export practice sessions to CSV
 */
export const exportPracticeSessions = (sessions) => {
  const headers = ['ID', 'Student', 'Minutes', 'Focus', 'Date', 'Notes'];
  const data = sessions.map((session) => ({
    ID: session._id || session.id || '',
    Student: session.student?.name || session.student || '',
    Minutes: session.minutes || 0,
    Focus: session.focus || '',
    Date: session.date ? new Date(session.date).toLocaleDateString() : '',
    Notes: session.notes || '',
  }));
  
  exportToCSV(data, 'practice_sessions', headers);
};

/**
 * Export community posts to CSV
 */
export const exportCommunityPosts = (posts) => {
  const headers = ['ID', 'Title', 'Author', 'Instrument', 'Likes', 'Comments', 'Visibility', 'Created At'];
  const data = posts.map((post) => ({
    ID: post._id || post.id || '',
    Title: post.title || '',
    Author: post.author?.name || post.author || '',
    Instrument: post.instrument || '',
    Likes: post.likeCount || 0,
    Comments: post.commentCount || 0,
    Visibility: post.visibility || 'public',
    'Created At': post.createdAt ? new Date(post.createdAt).toLocaleString() : '',
  }));
  
  exportToCSV(data, 'community_posts', headers);
};

