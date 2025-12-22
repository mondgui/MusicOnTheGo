import { useState, useEffect } from 'react';
import { Box, Typography, useTheme, TextField, InputAdornment, IconButton, Tooltip, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { tokens } from '../../theme';
import { api } from '../../lib/api';
import { exportBookings } from '../../utils/exportUtils';
import { useToast } from '../../components/Toast';
import BookingDetailsModal from '../../components/BookingDetailsModal';

const Bookings = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api('/api/admin/bookings', { auth: true });
      const bookingsList = data.bookings || [];
      setBookings(bookingsList);
      setFilteredBookings(bookingsList);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError(error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBookings(bookings);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = bookings.filter((booking) => {
      const studentName = (booking.student?.name || booking.student || '').toLowerCase();
      const teacherName = (booking.teacher?.name || booking.teacher || '').toLowerCase();
      const status = (booking.status || '').toLowerCase();
      const day = (booking.day || '').toLowerCase();
      
      return (
        studentName.includes(searchLower) ||
        teacherName.includes(searchLower) ||
        status.includes(searchLower) ||
        day.includes(searchLower)
      );
    });
    
    console.log('Search term:', searchTerm);
    console.log('Total bookings:', bookings.length);
    console.log('Filtered bookings:', filtered.length);
    setFilteredBookings(filtered);
  }, [searchTerm, bookings]);

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
      field: 'teacher',
      headerName: 'Teacher',
      flex: 1,
      renderCell: ({ row: { teacher } }) => {
        return teacher?.name || teacher || 'N/A';
      },
    },
    {
      field: 'day',
      headerName: 'Date',
      flex: 1,
    },
    {
      field: 'timeSlot',
      headerName: 'Time',
      flex: 1,
      renderCell: ({ row: { timeSlot } }) => {
        if (!timeSlot) return 'N/A';
        return `${timeSlot.start} - ${timeSlot.end}`;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.5,
      renderCell: ({ row: { status } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              status === 'approved'
                ? colors.greenAccent[600]
                : status === 'pending'
                ? colors.blueAccent[600]
                : colors.redAccent[600]
            }
            borderRadius="4px"
          >
            <Typography color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[100]} sx={{ ml: '5px' }}>
              {status}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      flex: 1,
      renderCell: ({ row: { createdAt } }) => {
        return createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A';
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box display="flex" gap="10px">
            <Tooltip title="View Details">
              <IconButton
                onClick={() => handleViewDetails(row)}
                sx={{ color: colors.greenAccent[500] }}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };


  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Typography variant="h2" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} fontWeight="bold">
          Bookings Analytics
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => {
            try {
              exportBookings(filteredBookings);
              toast.showSuccess(`Exported ${filteredBookings.length} bookings to CSV`);
            } catch (error) {
              toast.showError('Failed to export bookings');
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
          <Typography color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>{error}</Typography>
        </Box>
      )}
      <Box mb="20px">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search bookings by student, teacher, status, or date..."
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
      {!loading && filteredBookings.length === 0 && bookings.length === 0 && !error && (
        <Box
          mb="20px"
          p="10px"
          backgroundColor={colors.blueAccent[700]}
          borderRadius="4px"
        >
          <Typography color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>No bookings found. Data may still be loading or there are no bookings in the database.</Typography>
        </Box>
      )}
      {!loading && searchTerm && filteredBookings.length === 0 && bookings.length > 0 && (
        <Box
          mb="20px"
          p="10px"
          backgroundColor={colors.blueAccent[700]}
          borderRadius="4px"
        >
          <Typography color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>No bookings match your search "{searchTerm}". Try a different search term.</Typography>
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
          },
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: colors.primary[300],
            },
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
            borderBottom: 'none',
            color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[100],
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[100],
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
            color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[100],
          },
          '& .MuiDataGrid-cell': {
            color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
          '& .MuiIconButton-root': {
            pointerEvents: 'auto',
            cursor: 'pointer',
          },
        }}
      >
        <DataGrid
          rows={filteredBookings.map((booking, index) => ({
            id: booking._id || booking.id || index,
            ...booking,
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
      <BookingDetailsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
      />
    </Box>
  );
};

export default Bookings;

