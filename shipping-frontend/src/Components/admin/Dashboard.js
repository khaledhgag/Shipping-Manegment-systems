// src/components/admin/Dashboard.js
import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { People, DirectionsCar, LocalShipping, Payment } from '@mui/icons-material';

function AdminDashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <People color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4">12</Typography>
              <Typography variant="body2">Users</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <DirectionsCar color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4">8</Typography>
              <Typography variant="body2">Drivers</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <LocalShipping color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4">24</Typography>
              <Typography variant="body2">Orders</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Payment color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4">$4,200</Typography>
              <Typography variant="body2">Revenue</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminDashboard;