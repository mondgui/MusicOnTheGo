import { useState, useEffect } from 'react';
import { Box, Typography, useTheme, TextField, InputAdornment, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { tokens } from '../../theme';
import { api } from '../../lib/api';
import { exportMessages } from '../../utils/exportUtils';
import { useToast } from '../../components/Toast';

const Messages = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api('/api/admin/messages', { auth: true });
      const messagesList = data.messages || [];
      setMessages(messagesList);
      setFilteredMessages(messagesList);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError(error.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Filter messages based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMessages(messages);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = messages.filter((message) => {
      const senderName = (message.sender?.name || message.sender || '').toLowerCase();
      const recipientName = (message.recipient?.name || message.recipient || '').toLowerCase();
      const text = (message.text || '').toLowerCase();
      
      return (
        senderName.includes(searchLower) ||
        recipientName.includes(searchLower) ||
        text.includes(searchLower)
      );
    });
    
    console.log('Search term:', searchTerm);
    console.log('Total messages:', messages.length);
    console.log('Filtered messages:', filtered.length);
    setFilteredMessages(filtered);
  }, [searchTerm, messages]);

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      flex: 0.5,
    },
    {
      field: 'sender',
      headerName: 'From',
      flex: 1,
      renderCell: ({ row: { sender } }) => {
        return sender?.name || sender || 'N/A';
      },
    },
    {
      field: 'recipient',
      headerName: 'To',
      flex: 1,
      renderCell: ({ row: { recipient } }) => {
        return recipient?.name || recipient || 'N/A';
      },
    },
    {
      field: 'text',
      headerName: 'Message',
      flex: 2,
      renderCell: ({ row: { text } }) => {
        return (
          <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
            {text || 'N/A'}
          </Typography>
        );
      },
    },
    {
      field: 'read',
      headerName: 'Read',
      flex: 0.5,
      renderCell: ({ row: { read } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={read ? colors.greenAccent[600] : colors.redAccent[600]}
            borderRadius="4px"
          >
            <Typography color={colors.grey[100]} sx={{ ml: '5px' }}>
              {read ? 'Yes' : 'No'}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Sent',
      flex: 1,
      renderCell: ({ row: { createdAt } }) => {
        return createdAt ? new Date(createdAt).toLocaleString() : 'N/A';
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
          </Box>
        );
      },
    },
  ];


  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Typography variant="h2" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} fontWeight="bold">
          Messages Analytics
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => {
            try {
              exportMessages(filteredMessages);
              toast.showSuccess(`Exported ${filteredMessages.length} messages to CSV`);
            } catch (error) {
              toast.showError('Failed to export messages');
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
          placeholder="Search messages by sender, recipient, or content..."
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
      {!loading && filteredMessages.length === 0 && messages.length === 0 && !error && (
        <Box
          mb="20px"
          p="10px"
          backgroundColor={colors.blueAccent[700]}
          borderRadius="4px"
        >
          <Typography color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>No messages found. Data may still be loading or there are no messages in the database.</Typography>
        </Box>
      )}
      {!loading && searchTerm && filteredMessages.length === 0 && messages.length > 0 && (
        <Box
          mb="20px"
          p="10px"
          backgroundColor={colors.blueAccent[700]}
          borderRadius="4px"
        >
          <Typography color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>No messages match your search "{searchTerm}". Try a different search term.</Typography>
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
            color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
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
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
        }}
      >
        <DataGrid
          rows={filteredMessages.map((message, index) => ({
            id: message._id || message.id || index,
            ...message,
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

export default Messages;

