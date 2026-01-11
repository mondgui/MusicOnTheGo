import { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Badge,
  Divider,
  useTheme,
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WarningIcon from '@mui/icons-material/Warning';
import { tokens } from '../theme';
import { api } from '../lib/api';

const NotificationsMenu = () => {
  const theme = useTheme();
  const colors = tokens;
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const stats = await api('/api/admin/stats', { auth: true });
      
      const newNotifications = [];
      
      // New users in last 30 days
      if (stats.newUsersLast30Days > 0) {
        newNotifications.push({
          id: 'new-users',
          type: 'info',
          title: 'New Users',
          message: `${stats.newUsersLast30Days} new user(s) signed up in the last 30 days`,
          icon: <PersonAddIcon />,
          timestamp: new Date(),
        });
      }
      
      // Teachers needing students
      if (stats.teachersWithNoStudents > 0) {
        newNotifications.push({
          id: 'teachers-needing-students',
          type: 'warning',
          title: 'Teachers Needing Students',
          message: `${stats.teachersWithNoStudents} teacher(s) have no students yet`,
          icon: <WarningIcon />,
          timestamp: new Date(),
        });
      }
      
      // Users with incomplete profiles
      const incompleteProfiles = stats.totalUsers - stats.completedProfile;
      if (incompleteProfiles > 0 && stats.totalUsers > 0) {
        const percentage = ((incompleteProfiles / stats.totalUsers) * 100).toFixed(1);
        newNotifications.push({
          id: 'incomplete-profiles',
          type: 'info',
          title: 'Incomplete Profiles',
          message: `${incompleteProfiles} user(s) (${percentage}%) haven't completed their profile`,
          icon: <PersonAddIcon />,
          timestamp: new Date(),
        });
      }
      
      // Users without first booking
      const firstBooking = stats.firstBooking || stats.usersWithFirstBooking || 0;
      const usersWithoutBooking = stats.totalUsers - firstBooking;
      if (usersWithoutBooking > 0 && stats.totalUsers > 0) {
        const percentage = ((usersWithoutBooking / stats.totalUsers) * 100).toFixed(1);
        newNotifications.push({
          id: 'no-first-booking',
          type: 'warning',
          title: 'Users Without First Booking',
          message: `${usersWithoutBooking} user(s) (${percentage}%) haven't made their first booking`,
          icon: <WarningIcon />,
          timestamp: new Date(),
        });
      }
      
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning':
        return colors.redAccent[500];
      case 'info':
        return colors.blueAccent[500];
      case 'success':
        return colors.greenAccent[500];
      default:
        return colors.grey[500];
    }
  };

  return (
    <>
      <IconButton onClick={handleMenuOpen}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            width: 350,
            maxHeight: 500,
            backgroundColor: colors.grey[100],
            mt: 1,
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box p={2}>
          <Typography variant="h6" fontWeight="bold" color={colors.grey[900]}>
            Notifications
          </Typography>
        </Box>
        <Divider />
        {loading ? (
          <Box p={2}>
            <Typography variant="body2" color={colors.grey[700]}>
              Loading...
            </Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box p={2}>
            <Typography variant="body2" color={colors.grey[700]}>
              No new notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={handleMenuClose}
              sx={{
                py: 1.5,
                px: 2,
                '&:hover': {
                  backgroundColor: colors.grey[200],
                },
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={1.5} width="100%">
                <Box
                  sx={{
                    color: getNotificationColor(notification.type),
                    mt: 0.5,
                  }}
                >
                  {notification.icon}
                </Box>
                <Box flex={1}>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={colors.grey[900]}
                  >
                    {notification.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={colors.grey[700]}
                    sx={{ mt: 0.5 }}
                  >
                    {notification.message}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationsMenu;

