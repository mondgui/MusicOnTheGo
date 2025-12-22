import { useState } from 'react';
import { Box, Button, TextField, Typography, useTheme, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import { api } from '../../lib/api';

const Login = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: { email, password },
      });

      if (response.token && response.user) {
        // Check if user is admin
        if (response.user.role !== 'admin') {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }

        // Store token in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Redirect to dashboard
        navigate('/');
      } else {
        setError('Invalid login response');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        backgroundColor: colors.primary[500],
      }}
    >
      <Box
        width="400px"
        p="30px"
        sx={{
          backgroundColor: colors.primary[400],
          borderRadius: '10px',
        }}
      >
        <Typography
          variant="h2"
          color={colors.grey[100]}
          fontWeight="bold"
          textAlign="center"
          mb="20px"
        >
          🎵 MusicOnTheGo
        </Typography>
        <Typography
          variant="h4"
          color={colors.greenAccent[400]}
          textAlign="center"
          mb="30px"
        >
          Admin Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: colors.grey[700],
                },
                '&:hover fieldset': {
                  borderColor: colors.grey[500],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.greenAccent[500],
                },
              },
              '& .MuiInputLabel-root': {
                color: colors.grey[300],
              },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: colors.grey[700],
                },
                '&:hover fieldset': {
                  borderColor: colors.grey[500],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.greenAccent[500],
                },
              },
              '& .MuiInputLabel-root': {
                color: colors.grey[300],
              },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: colors.greenAccent[500],
              color: colors.grey[100],
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '10px',
              '&:hover': {
                backgroundColor: colors.greenAccent[600],
              },
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <Typography
          variant="body2"
          color={colors.grey[400]}
          textAlign="center"
          mt="20px"
        >
          Note: Only users with admin role can access this panel
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;

