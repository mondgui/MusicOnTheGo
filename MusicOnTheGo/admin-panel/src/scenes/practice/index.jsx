import { useState, useEffect } from 'react';
import { Box, Typography, useTheme, TextField, InputAdornment, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { tokens } from '../../theme';
import { api } from '../../lib/api';
import { exportPracticeSessions } from '../../utils/exportUtils';
import { useToast } from '../../components/Toast';

const Practice = () => {
  const theme = useTheme();
  const colors = tokens;
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api('/api/admin/practice-sessions', { auth: true });
      const sessionsList = data.sessions || [];
      setSessions(sessionsList);
      setFilteredSessions(sessionsList);
    } catch (error) {
      console.error('Error loading practice sessions:', error);
      setError(error.message || 'Failed to load practice sessions');
    } finally {
      setLoading(false);
    }
  };

  // Filter sessions based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSessions(sessions);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = sessions.filter((session) => {
      const studentName = (session.student?.name || session.student || '').toLowerCase();
      const focus = (session.focus || '').toLowerCase();
      const notes = (session.notes || '').toLowerCase();
      
      return (
        studentName.includes(searchLower) ||
        focus.includes(searchLower) ||
        notes.includes(searchLower)
      );
    });
    
    console.log('Search term:', searchTerm);
    console.log('Total sessions:', sessions.length);
    console.log('Filtered sessions:', filtered.length);
    setFilteredSessions(filtered);
  }, [searchTerm, sessions]);

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      flex: 0.5,
    },
    {
      field: 'student',
      headerName: 'Student',
      flex: 1,
      renderCell: ({ row: { student } }) => {
        return student?.name || student || 'N/A';
      },
    },
    {
      field: 'minutes',
      headerName: 'Minutes',
      flex: 0.5,
    },
    {
      field: 'focus',
      headerName: 'Focus',
      flex: 1,
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      renderCell: ({ row: { date } }) => {
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
    },
    {
      field: 'notes',
      headerName: 'Notes',
      flex: 2,
      renderCell: ({ row: { notes } }) => {
        return (
          <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
            {notes || 'N/A'}
          </Typography>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Typography variant="h2" color={colors.grey[900]} fontWeight="bold">
          Practice Sessions Analytics
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => {
            try {
              exportPracticeSessions(filteredSessions);
              toast.showSuccess(`Exported ${filteredSessions.length} practice sessions to CSV`);
            } catch (error) {
              toast.showError('Failed to export practice sessions');
            }
          }}
          sx={{
            backgroundColor: colors.greenAccent[600],
            '&:hover': {
              backgroundColor: colors.greenAccent[700],
            },
          }}
        >
          Export CSV
        </Button>
      </Box>
      {error && (
        <Box
          mb="20px"
          p="10px"
          backgroundColor={colors.redAccent[700]}
          borderRadius="4px"
        >
          <Typography color={colors.grey[900]}>{error}</Typography>
        </Box>
      )}
      <Box mb="20px">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search sessions by student, focus, or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: colors.primary[400],
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
            '& .MuiInputBase-input': {
              color: colors.grey[100],
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.grey[400] }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {!loading && filteredSessions.length === 0 && sessions.length === 0 && !error && (
        <Box
          mb="20px"
          p="10px"
          backgroundColor={colors.blueAccent[700]}
          borderRadius="4px"
        >
          <Typography color={colors.grey[900]}>No practice sessions found. Data may still be loading or there are no sessions in the database.</Typography>
        </Box>
      )}
      {!loading && searchTerm && filteredSessions.length === 0 && sessions.length > 0 && (
        <Box
          mb="20px"
          p="10px"
          backgroundColor={colors.blueAccent[700]}
          borderRadius="4px"
        >
          <Typography color={colors.grey[900]}>No sessions match your search "{searchTerm}". Try a different search term.</Typography>
        </Box>
      )}
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
            pointerEvents: 'auto',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
            cursor: 'pointer',
            color: colors.grey[900],
          },
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: colors.primary[300],
            },
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: colors.blueAccent[500],
            borderBottom: 'none',
            color: colors.grey[100],
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: colors.grey[100],
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: colors.blueAccent[500],
            color: colors.grey[100],
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
        }}
      >
        <DataGrid
          rows={filteredSessions.map((session, index) => ({
            id: session._id || session.id || index,
            ...session,
          }))}
          columns={columns}
          loading={loading}
          checkboxSelection
          pageSize={25}
          rowsPerPageOptions={[25, 50, 100]}
          disableRowSelectionOnClick={false}
          onRowClick={(params) => {
            console.log('Row clicked:', params.row);
          }}
        />
      </Box>
    </Box>
  );
};

export default Practice;

