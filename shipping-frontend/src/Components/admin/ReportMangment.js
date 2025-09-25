import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { DateRange } from '@mui/icons-material';
import api from '../../Services/api';

function ReportManagement() {
  const [ordersReport, setOrdersReport] = useState([]);
  const [driversPerformance, setDriversPerformance] = useState([]);
  const [revenueReport, setRevenueReport] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const ordersResponse = await api.get('/Report/orders');
      setOrdersReport(ordersResponse.data);
      
      const driversResponse = await api.get('/Report/drivers-performance');
      setDriversPerformance(driversResponse.data);
      
      const revenueResponse = await api.get('/Report/revenue');
      setRevenueReport(revenueResponse.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleDateRangeChange = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const ordersResponse = await api.get(`/Report/orders?${params}`);
      setOrdersReport(ordersResponse.data);
      
      const revenueResponse = await api.get(`/Report/revenue?${params}`);
      setRevenueReport(revenueResponse.data);
    } catch (error) {
      console.error('Error fetching filtered reports:', error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Report Management
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filter by Date Range
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                label="Start Date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="End Date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button 
                variant="contained" 
                startIcon={<DateRange />}
                onClick={handleDateRangeChange}
                fullWidth
              >
                Apply Filter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Orders Report
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>Count</TableCell>
                      <TableCell>Total Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ordersReport.map((report, index) => (
                      <TableRow key={index}>
                        <TableCell>{report._id}</TableCell>
                        <TableCell>{report.count}</TableCell>
                        <TableCell>${report.totalAmount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Report
              </Typography>
              {revenueReport.length > 0 ? (
                <div>
                  <Typography variant="body1">
                    Total Revenue: ${revenueReport[0].totalRevenue}
                  </Typography>
                  <Typography variant="body1">
                    Total Payments: {revenueReport[0].count}
                  </Typography>
                </div>
              ) : (
                <Typography variant="body1">No revenue data available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Drivers Performance
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Vehicle</TableCell>
                      <TableCell>Total Orders</TableCell>
                      <TableCell>Completed Orders</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {driversPerformance.map((driver, index) => (
                      <TableRow key={index}>
                        <TableCell>{driver.name}</TableCell>
                        <TableCell>{driver.phone}</TableCell>
                        <TableCell>{driver.vehicle}</TableCell>
                        <TableCell>{driver.totalOrders}</TableCell>
                        <TableCell>{driver.completedOrders}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default ReportManagement;