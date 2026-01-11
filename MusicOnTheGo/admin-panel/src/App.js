import { useTheme } from './theme';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import Topbar from './scenes/global/Topbar';
import AdminSidebar from './scenes/global/Sidebar';
import Login from './scenes/login';
import Dashboard from './scenes/dashboard';
import Users from './scenes/users';
import BulkMessaging from './scenes/bulk-messaging';
import Bookings from './scenes/bookings';
import Messages from './scenes/messages';
import Practice from './scenes/practice';
import Resources from './scenes/resources';
import Community from './scenes/community';
import Settings from './scenes/settings';
import { ProSidebarProvider } from 'react-pro-sidebar';
import { ToastProvider } from './components/Toast';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <ProSidebarProvider>
                    <AdminSidebar />
                    <main className="content">
                      <Topbar />
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/bulk-messaging" element={<BulkMessaging />} />
                        <Route path="/bookings" element={<Bookings />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/practice" element={<Practice />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/community" element={<Community />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </main>
                  </ProSidebarProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
