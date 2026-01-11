import { useState } from 'react';
import { Sidebar as ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Box, IconButton, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokens } from '../../theme';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';

const Item = ({ title, to, icon, selected, setSelected }) => {
  const colors = tokens;
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;
  
  const handleClick = () => {
    setSelected(title);
    navigate(to);
  };
  
  return (
    <MenuItem
      active={isActive}
      style={{
        color: colors.grey[900],
        backgroundColor: isActive 
          ? (colors.grey[200])
          : 'transparent',
      }}
      onClick={handleClick}
      icon={icon}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

const AdminSidebar = () => {
  const colors = tokens;
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Set selected based on current route
  const getSelectedTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/users') return 'All Users';
    if (path === '/bulk-messaging') return 'Bulk Messaging';
    if (path === '/bookings') return 'Bookings Analytics';
    if (path === '/messages') return 'Messages Analytics';
    if (path === '/practice') return 'Practice Sessions';
    if (path === '/resources') return 'Resources';
    if (path === '/community') return 'Community Posts';
    return 'Dashboard';
  };
  
  const [selected, setSelected] = useState(getSelectedTitle());
  
  const sidebarBgColor = colors.grey[100];

  return (
    <Box
      sx={{
        "& .pro-sidebar": {
          backgroundColor: `${sidebarBgColor} !important`,
          background: `${sidebarBgColor} !important`,
        },
        "& .pro-sidebar-inner": {
          background: `${sidebarBgColor} !important`,
          backgroundColor: `${sidebarBgColor} !important`,
        },
        "& .pro-sidebar-content": {
          backgroundColor: `${sidebarBgColor} !important`,
          background: `${sidebarBgColor} !important`,
        },
        "& .pro-menu": {
          backgroundColor: `${sidebarBgColor} !important`,
          background: `${sidebarBgColor} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
          color: colors.grey[900] + " !important",
        },
        "& .pro-inner-item:hover": {
          color: colors.blueAccent[700] + " !important",
          backgroundColor: colors.grey[200] + " !important",
        },
        "& .pro-menu-item.active": {
          color: colors.blueAccent[700] + " !important",
          backgroundColor: colors.grey[200] + " !important",
        },
      }}
    >
      <ProSidebar 
        collapsed={isCollapsed}
        backgroundColor={sidebarBgColor}
        style={{
          backgroundColor: sidebarBgColor,
        }}
      >
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[900],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[900]}>
                  MUSIC ADMIN
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <Box
                  width="100px"
                  height="100px"
                  borderRadius="50%"
                  sx={{
                    backgroundColor: colors.primary[300],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "40px",
                  }}
                >
                  🎵
                </Box>
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[900]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  MusicOnTheGo
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[700]}>
                  Admin Panel
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            
            <Typography
              variant="h6"
              color={colors.grey[700]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Users
            </Typography>
            <Item
              title="All Users"
              to="/users"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Bulk Messaging"
              to="/bulk-messaging"
              icon={<MessageOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[700]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Analytics
            </Typography>
            <Item
              title="Bookings Analytics"
              to="/bookings"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Messages Analytics"
              to="/messages"
              icon={<MessageOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Practice Sessions"
              to="/practice"
              icon={<MusicNoteOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Community Posts"
              to="/community"
              icon={<ForumOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Resources"
              to="/resources"
              icon={<FolderOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default AdminSidebar;
