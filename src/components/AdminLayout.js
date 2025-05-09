import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, IconButton, CssBaseline, Divider, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArticleIcon from '@mui/icons-material/Article';
import LabelIcon from '@mui/icons-material/Label';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTheme } from '../context/ThemeContext';

const drawerWidth = 220;

const navItems = [
  { text: 'Posts', icon: <ArticleIcon />, path: 'posts' },
  { text: 'Tags', icon: <LabelIcon />, path: 'tags' },
  { text: 'Types', icon: <CategoryIcon />, path: 'types' },
  { text: 'Users', icon: <PeopleIcon />, path: 'users' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navItems.map((item) => (
              <ListItem
                button
                key={item.text}
                component={Link}
                to={item.path}
                selected={location.pathname.endsWith(item.path)}
                onClick={() => setMobileOpen(false)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </div>
      <Box sx={{ p: 2 }}>
        <IconButton
          onClick={toggleTheme}
          sx={{
            width: '100%',
            height: 48,
            borderRadius: 2,
            justifyContent: 'flex-start',
            px: 2.5,
            color: isDark ? 'primary.light' : 'primary.main',
            bgcolor: isDark ? 'grey.900' : 'grey.100',
            boxShadow: isDark ? 2 : 1,
            '&:hover': {
              bgcolor: isDark ? 'primary.dark' : 'primary.light',
              color: isDark ? 'grey.100' : 'primary.dark',
            },
            transition: 'all 0.2s',
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText
            primary={isDark ? 'Light Mode' : 'Dark Mode'}
            primaryTypographyProps={{ fontWeight: 600, color: 'inherit' }}
          />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center', px: { xs: 1, sm: 2 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              textAlign: isMobile ? 'left' : 'left',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            noWrap
          >
            Admin Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* Drawer for desktop and mobile */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        {/* Temporary drawer for mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Permanent drawer for desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: { xs: 1, sm: 2, md: 3 }, minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout; 