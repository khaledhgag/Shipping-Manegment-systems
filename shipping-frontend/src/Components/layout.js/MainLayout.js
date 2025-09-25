import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';

function MainLayout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default MainLayout;