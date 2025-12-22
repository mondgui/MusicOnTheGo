import { useState, useEffect } from 'react';
import { Box, Typography, useTheme, TextField, InputAdornment, Button, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { tokens } from '../../theme';
import { api } from '../../lib/api';
import { exportCommunityPosts } from '../../utils/exportUtils';
import { useToast } from '../../components/Toast';

const Community = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api('/api/admin/community-posts', { auth: true });
      const postsList = data.posts || [];
      setPosts(postsList);
      setFilteredPosts(postsList);
    } catch (error) {
      console.error('Error loading community posts:', error);
      setError(error.message || 'Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  // Filter posts based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = posts.filter((post) => {
      const title = (post.title || '').toLowerCase();
      const authorName = (post.author?.name || post.author || '').toLowerCase();
      const instrument = (post.instrument || '').toLowerCase();
      
      return (
        title.includes(searchLower) ||
        authorName.includes(searchLower) ||
        instrument.includes(searchLower)
      );
    });
    
    console.log('Search term:', searchTerm);
    console.log('Total posts:', posts.length);
    console.log('Filtered posts:', filtered.length);
    setFilteredPosts(filtered);
  }, [searchTerm, posts]);

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      flex: 0.5,
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      cellClassName: 'name-column--cell',
    },
    {
      field: 'author',
      headerName: 'Author',
      flex: 1,
      renderCell: ({ row: { author } }) => {
        return author?.name || author || 'N/A';
      },
    },
    {
      field: 'instrument',
      headerName: 'Instrument',
      flex: 0.5,
    },
    {
      field: 'likeCount',
      headerName: 'Likes',
      flex: 0.5,
    },
    {
      field: 'commentCount',
      headerName: 'Comments',
      flex: 0.5,
    },
    {
      field: 'visibility',
      headerName: 'Visibility',
      flex: 0.5,
      renderCell: ({ row: { visibility } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={colors.blueAccent[600]}
            borderRadius="4px"
          >
            <Typography color={colors.grey[100]} sx={{ ml: '5px' }}>
              {visibility || 'public'}
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
            <Tooltip title="Delete Post">
              <IconButton
                onClick={() => handleDeletePost(row)}
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

  const handleDeletePost = async (post) => {
    if (window.confirm(`Are you sure you want to delete this community post?\n\nTitle: ${post.title || 'N/A'}\nAuthor: ${post.author?.name || 'N/A'}\nInstrument: ${post.instrument || 'N/A'}`)) {
      try {
        setLoading(true);
        const postId = post._id || post.id;
        await api(`/api/admin/community-posts/${postId}`, {
          method: 'DELETE',
          auth: true,
        });
        
        // Remove from local state
        setPosts(posts.filter(p => (p._id || p.id) !== postId));
        setFilteredPosts(filteredPosts.filter(p => (p._id || p.id) !== postId));
        
        toast.showSuccess('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        const errorMessage = error.message || 'Failed to delete post';
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
        <Typography variant="h2" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} fontWeight="bold">
          Community Posts Moderation
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => {
            try {
              exportCommunityPosts(filteredPosts);
              toast.showSuccess(`Exported ${filteredPosts.length} posts to CSV`);
            } catch (error) {
              toast.showError('Failed to export posts');
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
          placeholder="Search posts by title, author, or instrument..."
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
      {!loading && filteredPosts.length === 0 && posts.length === 0 && !error && (
        <Box
          mb="20px"
          p="10px"
          backgroundColor={colors.blueAccent[700]}
          borderRadius="4px"
        >
          <Typography color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>No community posts found. Data may still be loading or there are no posts in the database.</Typography>
        </Box>
      )}
      {!loading && searchTerm && filteredPosts.length === 0 && posts.length > 0 && (
        <Box
          mb="20px"
          p="10px"
          backgroundColor={colors.blueAccent[700]}
          borderRadius="4px"
        >
          <Typography color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>No posts match your search "{searchTerm}". Try a different search term.</Typography>
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
          '& .name-column--cell': {
            color: colors.greenAccent[300],
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
        }}
      >
        <DataGrid
          rows={filteredPosts.map((post, index) => ({
            id: post._id || post.id || index,
            ...post,
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

export default Community;

