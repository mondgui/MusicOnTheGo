import { useState, useEffect } from 'react';
import { Box, Typography, useTheme, TextField, InputAdornment, Button, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { tokens } from '../../theme';
import { api } from '../../lib/api';
import { exportUsers } from '../../utils/exportUtils';
import { useToast } from '../../components/Toast';
import UserDetailsModal from '../../components/UserDetailsModal';

const Users = () => {
  const theme = useTheme();
  const colors = tokens;
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading users from API...');
      const data = await api('/api/admin/users', { auth: true });
      console.log('API Response:', data);
      const usersList = Array.isArray(data) ? data : (data?.users || []);
      console.log('Loaded users:', usersList.length);
      console.log('First user sample:', usersList[0]);
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
      setError(error.message || 'Failed to load users');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  useEffect(() => {
    console.log('🔄 Filter effect triggered. Search term:', searchTerm, 'Users count:', users.length);
    
    if (!searchTerm.trim()) {
      console.log('📋 No search term, showing all users');
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    console.log('🔍 Searching for:', searchLower);
    console.log('📊 Total users to search:', users.length);
    
    if (users.length === 0) {
      console.log('⚠️ No users available to search');
      setFilteredUsers([]);
      return;
    }
    
    const filtered = users.filter((user) => {
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const role = (user.role || '').toLowerCase();
      const instruments = Array.isArray(user.instruments) 
        ? user.instruments.map(inst => (inst || '').toLowerCase()).join(' ')
        : (user.instruments || '').toLowerCase();
      
      const matches = (
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        role.includes(searchLower) ||
        instruments.includes(searchLower)
      );
      
      if (matches) {
        console.log('✅ Match found:', user.name, '- Name:', name, 'Email:', email);
      }
      
      return matches;
    });
    
    console.log('📈 Filtered results:', filtered.length);
    console.log('📋 Setting filtered users, count:', filtered.length);
    
    if (filtered.length === 0 && users.length > 0) {
      console.log('⚠️ No matches found. Sample user data:', {
        name: users[0]?.name,
        email: users[0]?.email,
        role: users[0]?.role,
        instruments: users[0]?.instruments
      });
      console.log('🔍 Search term was:', searchLower);
      console.log('📝 First user name (lowercase):', (users[0]?.name || '').toLowerCase());
      console.log('🔎 Does it include search?', (users[0]?.name || '').toLowerCase().includes(searchLower));
    }
    
    setFilteredUsers(filtered);
    console.log('✅ Filtered users state updated');
  }, [searchTerm, users]);

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      flex: 0.5,
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      cellClassName: 'name-column--cell',
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 0.5,
      renderCell: ({ row: { role } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              role === 'teacher'
                ? colors.greenAccent[600]
                : colors.blueAccent[600]
            }
            borderRadius="4px"
          >
            <Typography color="#ffffff" sx={{ ml: '5px', fontSize: '0.875rem', fontWeight: 500 }}>
              {role}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'instruments',
      headerName: 'Instruments',
      flex: 1,
      renderCell: ({ row: { instruments } }) => {
        return Array.isArray(instruments) ? instruments.join(', ') : instruments || 'N/A';
      },
    },
    {
      field: 'createdAt',
      headerName: 'Joined',
      flex: 1,
      renderCell: ({ row: { createdAt } }) => {
        return createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A';
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box display="flex" gap="10px">
            <Tooltip title="View Details">
              <IconButton
                onClick={() => {
                  setSelectedUser(row);
                  setModalOpen(true);
                }}
                sx={{ 
                  color: colors.greenAccent[700],
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  },
                }}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete User">
              <IconButton
                onClick={() => handleDeleteUser(row)}
                sx={{ color: colors.redAccent[500] }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete this user?\n\nName: ${user.name || 'N/A'}\nEmail: ${user.email || 'N/A'}\nRole: ${user.role || 'N/A'}\n\nThis action cannot be undone!`)) {
      try {
        setLoading(true);
        const userId = user._id || user.id;
        await api(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          auth: true,
        });
        
        // Remove from local state
        setUsers(users.filter(u => (u._id || u.id) !== userId));
        setFilteredUsers(filteredUsers.filter(u => (u._id || u.id) !== userId));
        
        toast.showSuccess(`User "${user.name || 'Unknown'}" deleted successfully`);
      } catch (error) {
        console.error('Error deleting user:', error);
        const errorMessage = error.message || 'Failed to delete user';
        setError(errorMessage);
        toast.showError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Typography variant="h2" color={colors.grey[900]} fontWeight="bold">
          Users Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => {
            try {
              exportUsers(filteredUsers);
              toast.showSuccess(`Exported ${filteredUsers.length} users to CSV`);
            } catch (error) {
              toast.showError('Failed to export users');
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
      {!loading && filteredUsers.length === 0 && users.length === 0 && !error && (
        <Box
          mb="20px"
          p="10px"
          backgroundColor={colors.blueAccent[700]}
          borderRadius="4px"
        >
          <Typography color={colors.grey[900]}>No users found. Data may still be loading or there are no users in the database.</Typography>
        </Box>
      )}
      {!loading && searchTerm && filteredUsers.length === 0 && users.length > 0 && (
        <Box
          mb="20px"
          p="10px"
          backgroundColor={colors.blueAccent[700]}
          borderRadius="4px"
        >
          <Typography color={colors.grey[900]}>No users match your search "{searchTerm}". Try a different search term.</Typography>
        </Box>
      )}
      <Box mb="20px">
        <Box display="flex" alignItems="center" gap="10px" mb="10px">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name, email, role, or instrument..."
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              console.log('🔤 Search input changed:', value);
              setSearchTerm(value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                console.log('⏎ Enter pressed, search term:', searchTerm);
              }
            }}
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
                color: colors.grey[900],
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors.grey[600] }} />
                </InputAdornment>
              ),
            }}
          />
          {searchTerm && (
            <Button
              variant="outlined"
              onClick={() => {
                console.log('🗑️ Clearing search');
                setSearchTerm('');
              }}
              sx={{
                color: colors.grey[700],
                borderColor: colors.grey[300],
                '&:hover': {
                  borderColor: colors.grey[400],
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              Clear
            </Button>
          )}
        </Box>
        {/* DEBUG INFO - Very visible */}
        <Box 
          p="10px" 
          mb="10px"
          backgroundColor={colors.primary[500]}
          borderRadius="4px"
          border={`1px solid ${colors.grey[700]}`}
        >
          <Typography variant="body2" color={colors.grey[900]}>
            <strong>Debug Info:</strong> Search: "{searchTerm}" | Total Users: {users.length} | Filtered: {filteredUsers.length} | Loading: {loading ? 'Yes' : 'No'}
          </Typography>
        </Box>
        {searchTerm && (
          <Typography variant="body2" color={colors.grey[400]} sx={{ ml: '10px' }}>
            Showing {filteredUsers.length} of {users.length} users
            {filteredUsers.length === 0 && users.length > 0 && ' - No matches found'}
          </Typography>
        )}
      </Box>
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
              backgroundColor: colors.grey[200],
            },
          },
          '& .name-column--cell': {
            color: colors.greenAccent[700],
            fontWeight: 500,
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
          '& .MuiCheckbox-root': {
            color: `${colors.greenAccent[600]} !important`,
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
        }}
      >
        {filteredUsers.length > 0 ? (
          <DataGrid
            key={`users-grid-${filteredUsers.length}-${searchTerm}`}
            rows={filteredUsers.map((user, index) => ({
              id: user._id || user.id || `user-${index}`,
              ...user,
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
            getRowId={(row) => row.id || row._id || `row-${Math.random()}`}
          />
        ) : !loading ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="400px"
            flexDirection="column"
            gap="20px"
          >
            <Typography variant="h5" color={colors.grey[700]}>
              {searchTerm ? `No users found matching "${searchTerm}"` : 'No users available'}
            </Typography>
            {searchTerm && users.length > 0 && (
              <Typography variant="body2" color={colors.grey[600]}>
                Try searching by email, role, or instrument instead
              </Typography>
            )}
          </Box>
        ) : null}
      </Box>
      <UserDetailsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </Box>
  );
};

export default Users;

