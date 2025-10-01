// src/components/employee/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { DirectionsCar, LocalShipping } from '@mui/icons-material';
import api from '../../Services/api';

function EmployeeDashboard() {
  const [stats, setStats] = useState({
    availableDrivers: 0,
    pendingOrders: 0,
    inTransitOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // جلب السائقين المتاحين
        const driversResponse = await api.get('/Driver');
        const availableDrivers = driversResponse.data.filter(driver => driver.availability === 'available').length;
        
        // جلب الطلبات
        const ordersResponse = await api.get('/Order');
        const pendingOrders = ordersResponse.data.filter(order => order.status === 'pending').length;
        const inTransitOrders = ordersResponse.data.filter(order => order.status === 'in-transit').length;
        
        setStats({
          availableDrivers,
          pendingOrders,
          inTransitOrders
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
              <Typography variant="h4">{stats.availableDrivers}</Typography>
              <Typography variant="body2">Available Drivers</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <LocalShipping color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4">{stats.pendingOrders}</Typography>
              <Typography variant="body2">Pending Orders</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <LocalShipping color="secondary" sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4">{stats.inTransitOrders}</Typography>
              <Typography variant="body2">In Transit</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default EmployeeDashboard;