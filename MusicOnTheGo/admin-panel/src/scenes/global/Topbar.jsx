import { Box, IconButton, useTheme, Menu, MenuItem, Typography } from '@mui/material';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColorModeContext, tokens } from '../../theme';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import NotificationsMenu from '../../components/NotificationsMenu';

const Topbar = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Box display="flex" justifyContent="space-between" p={2}>
            {/* SEARCH BAR */} 
            <Box 
              display="flex" 
              backgroundColor={theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]} 
              borderRadius="3px"
            >
                <InputBase 
                  sx={{ 
                    ml: 2, 
                    flex: 1,
                    color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
                    '&::placeholder': {
                      color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600],
                    },
                  }} 
                  placeholder="Search" 
                />
                <IconButton 
                  type="button" 
                  sx={{ 
                    p: 1,
                    color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[700],
                  }}
                >
                    <SearchIcon />
                </IconButton>
            </Box>

            {/* ICONS */}
            <Box display="flex" alignItems="center" gap={1}>
                <IconButton onClick={colorMode.toggleColorMode}>
                    {theme.palette.mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
                </IconButton>
                <NotificationsMenu />
                <IconButton onClick={() => navigate('/settings')}>
                    <SettingsOutlinedIcon />
                </IconButton>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
                        {user.name || 'Admin'}
                    </Typography>
                    <IconButton onClick={handleMenuOpen}>
                        <PersonOutlinedIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={handleLogout}>
                            <LogoutOutlinedIcon sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>
        </Box>
    );
}

export default Topbar;