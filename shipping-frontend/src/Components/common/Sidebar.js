import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Toolbar, 
  Box 
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard,
  People,
  DirectionsCar,
  LocalShipping,
  Payment,
  Assessment,
} from '@mui/icons-material';


const drawerWidth = 240;

function Sidebar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Drivers', icon: <DirectionsCar />, path: '/drivers' },
    { text: 'Orders', icon: <LocalShipping />, path: '/orders' },
    { text: 'Payments', icon: <Payment />, path: '/payments' },
    { text: 'Reports', icon: <Assessment />, path: '/reports' },
  ];

  const employeeMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Orders', icon: <LocalShipping />, path: '/orders' },
    { text: 'Drivers', icon: <DirectionsCar />, path: '/drivers' },
  ];

  const menuItems = currentUser?.role === 'admin' ? adminMenuItems : employeeMenuItems;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
}

export default Sidebar;