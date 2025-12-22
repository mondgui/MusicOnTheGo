import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { tokens } from '../../theme';
import { api } from '../../lib/api';
import { useToast } from '../../components/Toast';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Settings = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    dashboardRefreshInterval: 30, // seconds
    defaultTimeRange: '30days',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
    loadSettings();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api('/api/users/me', { auth: true });
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadSettings = () => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing settings:', error);
      }
    }
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      showToast('success', 'Settings saved successfully!');
    } catch (error) {
      showToast('error', 'Failed to save settings');
    }
  };

  return (
    <Box m="20px">
      <Typography variant="h2" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} fontWeight="bold" mb="20px">
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200] }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 1, color: colors.greenAccent[500] }} />
                <Typography variant="h5" fontWeight="600" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
                  Profile
                </Typography>
              </Box>
              
              {user && (
                <Box>
                  <TextField
                    fullWidth
                    label="Name"
                    value={user.name || ''}
                    disabled
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={user.email || ''}
                    disabled
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Role"
                    value={user.role || ''}
                    disabled
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200] }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NotificationsIcon sx={{ mr: 1, color: colors.blueAccent[500] }} />
                <Typography variant="h5" fontWeight="600" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
                  Notifications
                </Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    color="primary"
                  />
                }
                label="Email Notifications"
                sx={{
                  color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
                }}
              />
              
              <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[700]} sx={{ mt: 1, mb: 2 }}>
                Receive email alerts for important events (new users, system issues, etc.)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Dashboard Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200] }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DashboardIcon sx={{ mr: 1, color: colors.greenAccent[500] }} />
                <Typography variant="h5" fontWeight="600" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
                  Dashboard Preferences
                </Typography>
              </Box>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Default Time Range</InputLabel>
                <Select
                  value={settings.defaultTimeRange}
                  onChange={(e) => setSettings({ ...settings, defaultTimeRange: e.target.value })}
                  label="Default Time Range"
                >
                  <MenuItem value="7days">7 Days</MenuItem>
                  <MenuItem value="30days">30 Days</MenuItem>
                  <MenuItem value="90days">90 Days</MenuItem>
                  <MenuItem value="6months">6 Months</MenuItem>
                  <MenuItem value="1year">1 Year</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                type="number"
                label="Auto-refresh Interval (seconds)"
                value={settings.dashboardRefreshInterval}
                onChange={(e) => setSettings({ ...settings, dashboardRefreshInterval: parseInt(e.target.value) || 30 })}
                helperText="How often the dashboard should refresh data automatically"
                sx={{
                  '& .MuiInputBase-input': {
                    color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* System Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200] }}>
            <CardContent>
              <Typography variant="h5" fontWeight="600" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={2}>
                System Information
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Admin Panel Version:</strong> 1.0.0
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:5050'}
                </Typography>
              </Alert>
              
              <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[700]}>
                This admin panel is designed to help you monitor user growth and improve user experience. 
                All data is read-only for analytics purposes, except for bulk messaging which allows you 
                to help users who need support.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button
          variant="contained"
          onClick={handleSaveSettings}
          startIcon={<SaveIcon />}
          sx={{
            backgroundColor: colors.greenAccent[600],
            '&:hover': {
              backgroundColor: colors.greenAccent[700],
            },
          }}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;

