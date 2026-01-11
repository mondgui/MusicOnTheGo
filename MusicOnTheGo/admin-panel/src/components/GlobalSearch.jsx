import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  CircularProgress,
  InputBase,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MessageIcon from '@mui/icons-material/Message';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ForumIcon from '@mui/icons-material/Forum';
import FolderIcon from '@mui/icons-material/Folder';
import { tokens } from '../theme';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = () => {
  const colors = tokens;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const performSearch = useCallback(async () => {
    try {
      setLoading(true);
      setShowResults(true);
      const data = await api('/api/admin/search', {
        auth: true,
        params: { q: searchTerm, limit: 5 },
      });
      setResults(data);
    } catch (error) {
      console.error('Error performing search:', error);
      setResults({
        users: [],
        bookings: [],
        messages: [],
        practiceSessions: [],
        communityPosts: [],
        resources: [],
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const handleResultClick = (type, item) => {
    setShowResults(false);
    setSearchTerm('');
    
    switch (type) {
      case 'user':
        navigate('/users');
        // Could scroll to user or highlight in the list
        break;
      case 'booking':
        navigate('/bookings');
        break;
      case 'message':
        navigate('/messages');
        break;
      case 'practice':
        navigate('/practice');
        break;
      case 'community':
        navigate('/community');
        break;
      case 'resource':
        navigate('/resources');
        break;
      default:
        break;
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'user':
        return <PersonIcon />;
      case 'booking':
        return <CalendarTodayIcon />;
      case 'message':
        return <MessageIcon />;
      case 'practice':
        return <MusicNoteIcon />;
      case 'community':
        return <ForumIcon />;
      case 'resource':
        return <FolderIcon />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        performSearch();
      } else {
        setResults(null);
        setShowResults(false);
      }
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, performSearch]);

  const totalResults = results
    ? (results.users?.length || 0) +
      (results.bookings?.length || 0) +
      (results.messages?.length || 0) +
      (results.practiceSessions?.length || 0) +
      (results.communityPosts?.length || 0) +
      (results.resources?.length || 0)
    : 0;

  return (
    <Box position="relative" ref={searchRef} sx={{ width: '100%', maxWidth: '600px' }}>
      <Box
        display="flex"
        backgroundColor={colors.grey[200]}
        borderRadius="3px"
        alignItems="center"
      >
        <InputBase
          sx={{
            ml: 2,
            flex: 1,
            color: colors.grey[900],
            '&::placeholder': {
              color: colors.grey[600],
            },
          }}
          placeholder="Search users, bookings, messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (searchTerm.trim().length > 0 && results) {
              setShowResults(true);
            }
          }}
        />
        <IconButton
          type="button"
          sx={{
            p: 1,
            color: colors.grey[700],
          }}
        >
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            <SearchIcon />
          )}
        </IconButton>
      </Box>

      {showResults && (
        <Paper
          ref={resultsRef}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            maxHeight: '500px',
            overflow: 'auto',
            zIndex: 1000,
            backgroundColor: colors.grey[100],
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          {loading ? (
            <Box p={2} display="flex" justifyContent="center">
              <CircularProgress size={24} />
            </Box>
          ) : totalResults === 0 ? (
            <Box p={2}>
              <Typography
                variant="body2"
                color={colors.grey[700]}
              >
                No results found for "{searchTerm}"
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {results.users && results.users.length > 0 && (
                <>
                  <Box px={2} py={1}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color={colors.grey[900]}
                    >
                      Users ({results.users.length})
                    </Typography>
                  </Box>
                  {results.users.map((user) => (
                    <ListItem
                      key={user._id}
                      button
                      onClick={() => handleResultClick('user', user)}
                      sx={{
                        '&:hover': {
                          backgroundColor: colors.grey[200],
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: colors.blueAccent[500] }}>
                        {getResultIcon('user')}
                      </ListItemIcon>
                      <ListItemText
                        primary={user.name}
                        secondary={`${user.email} - ${user.role}`}
                        primaryTypographyProps={{
                          color: colors.grey[900],
                        }}
                        secondaryTypographyProps={{
                          color: colors.grey[700],
                        }}
                      />
                    </ListItem>
                  ))}
                  <Divider />
                </>
              )}

              {results.bookings && results.bookings.length > 0 && (
                <>
                  <Box px={2} py={1}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color={colors.grey[900]}
                    >
                      Bookings ({results.bookings.length})
                    </Typography>
                  </Box>
                  {results.bookings.map((booking) => (
                    <ListItem
                      key={booking._id}
                      button
                      onClick={() => handleResultClick('booking', booking)}
                      sx={{
                        '&:hover': {
                          backgroundColor: colors.grey[200],
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: colors.greenAccent[500] }}>
                        {getResultIcon('booking')}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${booking.student?.name || 'N/A'} → ${booking.teacher?.name || 'N/A'}`}
                        secondary={`Status: ${booking.status}`}
                        primaryTypographyProps={{
                          color: colors.grey[900],
                        }}
                        secondaryTypographyProps={{
                          color: colors.grey[700],
                        }}
                      />
                    </ListItem>
                  ))}
                  <Divider />
                </>
              )}

              {results.messages && results.messages.length > 0 && (
                <>
                  <Box px={2} py={1}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color={colors.grey[900]}
                    >
                      Messages ({results.messages.length})
                    </Typography>
                  </Box>
                  {results.messages.map((message) => (
                    <ListItem
                      key={message._id}
                      button
                      onClick={() => handleResultClick('message', message)}
                      sx={{
                        '&:hover': {
                          backgroundColor: colors.grey[200],
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: colors.blueAccent[500] }}>
                        {getResultIcon('message')}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${message.sender?.name || 'N/A'} → ${message.recipient?.name || 'N/A'}`}
                        secondary={message.text?.substring(0, 60) + (message.text?.length > 60 ? '...' : '')}
                        primaryTypographyProps={{
                          color: colors.grey[900],
                        }}
                        secondaryTypographyProps={{
                          color: colors.grey[700],
                        }}
                      />
                    </ListItem>
                  ))}
                  <Divider />
                </>
              )}

              {results.practiceSessions && results.practiceSessions.length > 0 && (
                <>
                  <Box px={2} py={1}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color={colors.grey[900]}
                    >
                      Practice Sessions ({results.practiceSessions.length})
                    </Typography>
                  </Box>
                  {results.practiceSessions.map((session) => (
                    <ListItem
                      key={session._id}
                      button
                      onClick={() => handleResultClick('practice', session)}
                      sx={{
                        '&:hover': {
                          backgroundColor: colors.grey[200],
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: colors.greenAccent[500] }}>
                        {getResultIcon('practice')}
                      </ListItemIcon>
                      <ListItemText
                        primary={session.student?.name || 'N/A'}
                        secondary={`${session.minutes} minutes - ${session.focus || 'N/A'}`}
                        primaryTypographyProps={{
                          color: colors.grey[900],
                        }}
                        secondaryTypographyProps={{
                          color: colors.grey[700],
                        }}
                      />
                    </ListItem>
                  ))}
                  <Divider />
                </>
              )}

              {results.communityPosts && results.communityPosts.length > 0 && (
                <>
                  <Box px={2} py={1}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color={colors.grey[900]}
                    >
                      Community Posts ({results.communityPosts.length})
                    </Typography>
                  </Box>
                  {results.communityPosts.map((post) => (
                    <ListItem
                      key={post._id}
                      button
                      onClick={() => handleResultClick('community', post)}
                      sx={{
                        '&:hover': {
                          backgroundColor: colors.grey[200],
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: colors.blueAccent[500] }}>
                        {getResultIcon('community')}
                      </ListItemIcon>
                      <ListItemText
                        primary={post.title}
                        secondary={`by ${post.author?.name || 'N/A'}`}
                        primaryTypographyProps={{
                          color: colors.grey[900],
                        }}
                        secondaryTypographyProps={{
                          color: colors.grey[700],
                        }}
                      />
                    </ListItem>
                  ))}
                  <Divider />
                </>
              )}

              {results.resources && results.resources.length > 0 && (
                <>
                  <Box px={2} py={1}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color={colors.grey[900]}
                    >
                      Resources ({results.resources.length})
                    </Typography>
                  </Box>
                  {results.resources.map((resource) => (
                    <ListItem
                      key={resource._id}
                      button
                      onClick={() => handleResultClick('resource', resource)}
                      sx={{
                        '&:hover': {
                          backgroundColor: colors.grey[200],
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: colors.greenAccent[500] }}>
                        {getResultIcon('resource')}
                      </ListItemIcon>
                      <ListItemText
                        primary={resource.title}
                        secondary={`by ${resource.uploadedBy?.name || 'N/A'}`}
                        primaryTypographyProps={{
                          color: colors.grey[900],
                        }}
                        secondaryTypographyProps={{
                          color: colors.grey[700],
                        }}
                      />
                    </ListItem>
                  ))}
                </>
              )}
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default GlobalSearch;

