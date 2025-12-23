import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { tokens } from '../../theme';
import { api } from '../../lib/api';
import { useToast } from '../../components/Toast';
import SendIcon from '@mui/icons-material/Send';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleIcon from '@mui/icons-material/People';
import MessageIcon from '@mui/icons-material/Message';

const BulkMessaging = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { showToast } = useToast();

  const [filters, setFilters] = useState({
    role: 'all',
    instrument: 'all',
    activityLevel: 'all',
    hasProfile: 'all',
    hasBooking: 'all',
    signupDateFrom: '',
    signupDateTo: '',
  });

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('custom');
  const [availableInstruments, setAvailableInstruments] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);

  // Predefined message templates
  const messageTemplates = {
    welcome: 'Welcome to MusicOnTheGo! We\'re excited to have you join our community of music learners and teachers. Start by completing your profile to connect with others!',
    onboarding: 'Hi! We noticed you haven\'t completed your profile yet. Completing your profile helps you connect with the right teachers or students. Take a moment to finish setting up your account!',
    inactive: 'We miss you! It\'s been a while since you\'ve been active on MusicOnTheGo. There are new teachers and students waiting to connect. Come back and explore!',
    newTeachers: 'Welcome new teachers! Thank you for joining MusicOnTheGo. Make sure your profile is complete so students can find you. Good luck with your teaching journey!',
    custom: '',
  };

  useEffect(() => {
    loadAvailableInstruments();
  }, []);

  useEffect(() => {
    if (messageType !== 'custom' && messageTemplates[messageType]) {
      setMessage(messageTemplates[messageType]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageType]);

  const loadAvailableInstruments = async () => {
    try {
      const response = await api('/api/admin/users', { auth: true });
      const users = Array.isArray(response) ? response : (response.users || []);
      const instrumentsSet = new Set();
      users.forEach((user) => {
        if (user.instruments && Array.isArray(user.instruments)) {
          user.instruments.forEach((inst) => {
            if (inst) instrumentsSet.add(inst);
          });
        }
      });
      setAvailableInstruments(Array.from(instrumentsSet).sort());
    } catch (error) {
      console.error('Error loading instruments:', error);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
      };

      const response = await api('/api/admin/users/filtered', {
        auth: true,
        params,
      });

      setFilteredUsers(response.users || []);
      setSelectedUsers([]); // Reset selection when filters change
      showToast('success', `Found ${response.count} user(s) matching your criteria`);
    } catch (error) {
      console.error('Error filtering users:', error);
      showToast('error', error.message || 'Failed to filter users');
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u._id));
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSendBulkMessage = async () => {
    if (selectedUsers.length === 0) {
      showToast('error', 'Please select at least one user');
      return;
    }

    if (!message || !message.trim()) {
      showToast('error', 'Please enter a message');
      return;
    }

    if (!previewMode) {
      setPreviewMode(true);
      return;
    }

    try {
      setSending(true);
      const response = await api('/api/admin/bulk-message', {
        method: 'POST',
        auth: true,
        body: {
          userIds: selectedUsers,
          message: message.trim(),
          messageType,
        },
      });

      showToast('success', `Successfully sent ${response.count} message(s)!`);
      setMessage('');
      setSelectedUsers([]);
      setPreviewMode(false);
    } catch (error) {
      console.error('Error sending bulk messages:', error);
      showToast('error', error.message || 'Failed to send messages');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box m="20px">
      <Typography variant="h2" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} fontWeight="bold" mb="20px">
        Bulk Messaging
      </Typography>

      <Grid container spacing={3}>
        {/* Filters Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200] }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <FilterListIcon sx={{ mr: 1, color: colors.greenAccent[500] }} />
                <Typography variant="h5" fontWeight="600" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
                  User Segmentation
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={2}>
                {/* Role Filter */}
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={filters.role}
                    label="Role"
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    sx={{
                      color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
                    }}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="student">Students</MenuItem>
                    <MenuItem value="teacher">Teachers</MenuItem>
                  </Select>
                </FormControl>

                {/* Instrument Filter */}
                <FormControl fullWidth>
                  <InputLabel>Instrument</InputLabel>
                  <Select
                    value={filters.instrument}
                    label="Instrument"
                    onChange={(e) => setFilters({ ...filters, instrument: e.target.value })}
                    sx={{
                      color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
                    }}
                  >
                    <MenuItem value="all">All Instruments</MenuItem>
                    {availableInstruments.map((inst) => (
                      <MenuItem key={inst} value={inst}>
                        {inst}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Activity Level Filter */}
                <FormControl fullWidth>
                  <InputLabel>Activity Level</InputLabel>
                  <Select
                    value={filters.activityLevel}
                    label="Activity Level"
                    onChange={(e) => setFilters({ ...filters, activityLevel: e.target.value })}
                    sx={{
                      color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
                    }}
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="active">Active (Last 30 days)</MenuItem>
                    <MenuItem value="inactive">Inactive (No activity 30+ days)</MenuItem>
                  </Select>
                </FormControl>

                {/* Profile Completion */}
                <FormControl fullWidth>
                  <InputLabel>Profile Status</InputLabel>
                  <Select
                    value={filters.hasProfile}
                    label="Profile Status"
                    onChange={(e) => setFilters({ ...filters, hasProfile: e.target.value })}
                    sx={{
                      color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
                    }}
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="true">Completed Profile</MenuItem>
                    <MenuItem value="false">Incomplete Profile</MenuItem>
                  </Select>
                </FormControl>

                {/* Has Booking */}
                <FormControl fullWidth>
                  <InputLabel>Booking Status</InputLabel>
                  <Select
                    value={filters.hasBooking}
                    label="Booking Status"
                    onChange={(e) => setFilters({ ...filters, hasBooking: e.target.value })}
                    sx={{
                      color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
                    }}
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="true">Has Bookings</MenuItem>
                    <MenuItem value="false">No Bookings</MenuItem>
                  </Select>
                </FormControl>

                {/* Date Range */}
                <TextField
                  label="Signup Date From"
                  type="date"
                  value={filters.signupDateFrom}
                  onChange={(e) => setFilters({ ...filters, signupDateFrom: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
                    },
                  }}
                />
                <TextField
                  label="Signup Date To"
                  type="date"
                  value={filters.signupDateTo}
                  onChange={(e) => setFilters({ ...filters, signupDateTo: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
                    },
                  }}
                />

                <Button
                  variant="contained"
                  onClick={applyFilters}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <FilterListIcon />}
                  sx={{
                    backgroundColor: colors.blueAccent[600],
                    '&:hover': {
                      backgroundColor: colors.blueAccent[700],
                    },
                  }}
                >
                  {loading ? 'Filtering...' : 'Apply Filters'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Message Composition & User Selection */}
        <Grid item xs={12} md={8}>
          <Card sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200], mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MessageIcon sx={{ mr: 1, color: colors.greenAccent[500] }} />
                <Typography variant="h5" fontWeight="600" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
                  Compose Message
                </Typography>
              </Box>

              {/* Message Type Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Message Type</InputLabel>
                <Select
                  value={messageType}
                  label="Message Type"
                  onChange={(e) => setMessageType(e.target.value)}
                  sx={{
                    color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
                  }}
                >
                  <MenuItem value="custom">Custom Message</MenuItem>
                  <MenuItem value="welcome">Welcome Message</MenuItem>
                  <MenuItem value="onboarding">Onboarding Nudge</MenuItem>
                  <MenuItem value="inactive">Re-engagement</MenuItem>
                  <MenuItem value="newTeachers">New Teacher Welcome</MenuItem>
                </Select>
              </FormControl>

              {/* Message Text */}
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                sx={{
                  mb: 2,
                  '& .MuiInputBase-input': {
                    color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
                  },
                }}
              />

              {/* Selected Users Count */}
              {filteredUsers.length > 0 && (
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body1" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
                      <PeopleIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      {filteredUsers.length} user(s) found
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                          onChange={handleSelectAll}
                        />
                      }
                      label="Select All"
                      sx={{
                        color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
                      }}
                    />
                  </Box>

                  {/* Selected Users Chips */}
                  {selectedUsers.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[700]} mb={1}>
                        Selected: {selectedUsers.length} user(s)
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {filteredUsers
                          .filter((u) => selectedUsers.includes(u._id))
                          .slice(0, 10)
                          .map((user) => (
                            <Chip
                              key={user._id}
                              label={user.name}
                              onDelete={() => handleSelectUser(user._id)}
                              size="small"
                              sx={{
                                backgroundColor: colors.greenAccent[500],
                                color: colors.grey[100],
                              }}
                            />
                          ))}
                        {selectedUsers.length > 10 && (
                          <Chip
                            label={`+${selectedUsers.length - 10} more`}
                            size="small"
                            sx={{
                              backgroundColor: colors.grey[600],
                              color: colors.grey[100],
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* User List */}
                  <Paper
                    sx={{
                      maxHeight: '300px',
                      overflow: 'auto',
                      backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[100],
                      p: 1,
                    }}
                  >
                    {filteredUsers.map((user) => (
                      <Box
                        key={user._id}
                        display="flex"
                        alignItems="center"
                        p={1}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200],
                          },
                        }}
                        onClick={() => handleSelectUser(user._id)}
                      >
                        <Checkbox
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Box ml={1}>
                          <Typography variant="body1" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
                            {user.name}
                          </Typography>
                          <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600]}>
                            {user.email} • {user.role}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                </Box>
              )}

              {filteredUsers.length === 0 && !loading && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Apply filters to see users. Select users to send them a message.
                </Alert>
              )}

              {/* Send Button */}
              <Box display="flex" justifyContent="flex-end" mt={3}>
                {previewMode && (
                  <Alert severity="warning" sx={{ flex: 1, mr: 2 }}>
                    You are about to send this message to {selectedUsers.length} user(s). Click "Send Message" again to confirm.
                  </Alert>
                )}
                <Button
                  variant="contained"
                  onClick={handleSendBulkMessage}
                  disabled={sending || selectedUsers.length === 0 || !message.trim()}
                  startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
                  sx={{
                    backgroundColor: colors.greenAccent[600],
                    '&:hover': {
                      backgroundColor: colors.greenAccent[700],
                    },
                  }}
                >
                  {sending ? 'Sending...' : previewMode ? 'Confirm Send' : 'Preview & Send'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BulkMessaging;

