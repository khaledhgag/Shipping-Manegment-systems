// src/components/employee/Dashboard.js
import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { DirectionsCar, LocalShipping } from '@mui/icons-material';

function EmployeeDashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Employee Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <DirectionsCar color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4">5</Typography>
              <Typography variant="body2">Available Drivers</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <LocalShipping color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4">12</Typography>
              <Typography variant="body2">Pending Orders</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <LocalShipping color="secondary" sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4">8</Typography>
              <Typography variant="body2">In Transit</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default EmployeeDashboard;