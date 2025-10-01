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
  Tabs,
  Tab,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  DateRange,
  Refresh,
  Assignment,
  People,
  DirectionsBike,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  FilterList
} from '@mui/icons-material';
import api from '../../Services/api';

// Define the SummaryCard component separately to avoid initialization issues
const SummaryCard = ({ title, value, icon, color, subtitle, trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box>
          <IconButton sx={{ 
            backgroundColor: `${color}.light`, 
            color: `${color}.main`,
            '&:hover': { backgroundColor: `${color}.main`, color: 'white' }
          }}>
            {icon}
          </IconButton>
        </Box>
      </Box>
      {trend && (
        <Box display="flex" alignItems="center" mt={1}>
          {trend === 'up' ? (
            <TrendingUp color="success" fontSize="small" />
          ) : (
            <TrendingDown color="error" fontSize="small" />
          )}
          <Typography variant="body2" color={trend === 'up' ? 'success.main' : 'error.main'} ml={1}>
            {trend === 'up' ? '12% increase' : '5% decrease'} from last month
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

// Main component function
function ReportManagement() {
  const [tab, setTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalEmployees: 0,
    totalDrivers: 0,
    activeDrivers: 0
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [o, e, d, r] = await Promise.all([
        api.get('/reports/orders'),
        api.get('/reports/employees'),
        api.get('/reports/drivers'),
        api.get('/reports/revenue')
      ]);
      
      setOrders(o.data);
      setEmployees(e.data);
      setDrivers(d.data);
      setRevenue(r.data);
      
      // Calculate summary statistics
      const totalOrders = o.data.length;
      const pendingOrders = o.data.filter(order => order.status === 'pending').length;
      const completedOrders = o.data.filter(order => order.status === 'delivered').length;
      const totalRevenue = r.data.length > 0 ? r.data[0].totalRevenue : 0;
      const totalEmployees = e.data.length;
      const totalDrivers = d.data.length;
      const activeDrivers = d.data.filter(driver => driver.totalOrders > 0).length;
      
      setSummary({
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        totalEmployees,
        totalDrivers,
        activeDrivers
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const [o, r] = await Promise.all([
        api.get(`/reports/orders?${params}`),
        api.get(`/reports/revenue?${params}`)
      ]);
      
      setOrders(o.data);
      setRevenue(r.data);
      
      // Update summary with filtered data
      const totalOrders = o.data.length;
      const pendingOrders = o.data.filter(order => order.status === 'pending').length;
      const completedOrders = o.data.filter(order => order.status === 'delivered').length;
      const totalRevenue = r.data.length > 0 ? r.data[0].totalRevenue : 0;
      
      setSummary(prev => ({
        ...prev,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue
      }));
    } catch (error) {
      console.error('Error filtering reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
      case 'paid':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'failed':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchReports} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Orders"
            value={summary.totalOrders}
            icon={<Assignment />}
            color="primary"
            subtitle={`${summary.pendingOrders} pending, ${summary.completedOrders} completed`}
            trend="up"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Revenue"
            value={`EGP ${summary.totalRevenue}`}
            icon={<AttachMoney />}
            color="success"
            trend="up"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Employees"
            value={summary.totalEmployees}
            icon={<People />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Drivers"
            value={`${summary.activeDrivers}/${summary.totalDrivers}`}
            icon={<DirectionsBike />}
            color="warning"
            subtitle="Active/Total"
          />
        </Grid>
      </Grid>

      {/* Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <FilterList /> Filter Reports
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<DateRange />} 
              onClick={handleDateRangeChange}
              disabled={loading}
            >
              Apply Filter
            </Button>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Start Date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="End Date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setDateRange({ startDate: '', endDate: '' });
                  fetchReports();
                }}
                fullWidth
              >
                Clear Filter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Orders Report" />
        <Tab label="Employees Report" />
        <Tab label="Drivers Report" />
        <Tab label="Revenue Report" />
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tab === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Orders Report
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Order #</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Route</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>Employee</TableCell>
                        <TableCell>Driver</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.length > 0 ? orders.map((o, i) => (
                        <TableRow key={i}>
                          <TableCell>{o.orderNumber}</TableCell>
                          <TableCell>{o.customerName}</TableCell>
                          <TableCell>{o.from} → {o.to}</TableCell>
                          <TableCell>EGP {o.price}</TableCell>
                          <TableCell>
                            <Chip label={o.status} color={getStatusColor(o.status)} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={o.paymentStatus} color={getStatusColor(o.paymentStatus)} size="small" />
                          </TableCell>
                          <TableCell>{o.employee || 'N/A'}</TableCell>
                          <TableCell>{o.driver || 'N/A'}</TableCell>
                          <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={9} align="center">
                            No orders found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {tab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Employees Report
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Total Orders</TableCell>
                        <TableCell>Total Amount</TableCell>
                        <TableCell>Average Order</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {employees.length > 0 ? employees.map((e, i) => (
                        <TableRow key={i}>
                          <TableCell>{e.name}</TableCell>
                          <TableCell>{e.email}</TableCell>
                          <TableCell>{e.phone}</TableCell>
                          <TableCell>{e.totalOrders}</TableCell>
                          <TableCell>EGP {e.totalAmount || 0}</TableCell>
                          <TableCell>
                            EGP {e.totalOrders > 0 ? (e.totalAmount / e.totalOrders).toFixed(2) : '0.00'}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No employees found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {tab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Drivers Report
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Vehicle</TableCell>
                        <TableCell>Total Orders</TableCell>
                        <TableCell>Delivered</TableCell>
                        <TableCell>In Transit</TableCell>
                        <TableCell>Completion Rate</TableCell>
                        <TableCell>Total Collected</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {drivers.length > 0 ? drivers.map((d, i) => {
                        const completionRate = d.totalOrders > 0 
                          ? ((d.deliveredOrders / d.totalOrders) * 100).toFixed(1) 
                          : '0.0';
                        
                        return (
                          <TableRow key={i}>
                            <TableCell>{d.name}</TableCell>
                            <TableCell>{d.phone}</TableCell>
                            <TableCell>{d.vehicle || 'N/A'}</TableCell>
                            <TableCell>{d.totalOrders}</TableCell>
                            <TableCell>{d.deliveredOrders}</TableCell>
                            <TableCell>{d.inTransitOrders}</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Typography variant="body2" mr={1}>
                                  {completionRate}%
                                </Typography>
                                <Box width="100px">
                                  <Box 
                                    height={8} 
                                    borderRadius={4} 
                                    bgcolor="grey.200"
                                    overflow="hidden"
                                  >
                                    <Box 
                                      height="100%" 
                                      width={`${completionRate}%`}
                                      bgcolor={completionRate > 70 ? "success.main" : completionRate > 40 ? "warning.main" : "error.main"}
                                    />
                                  </Box>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>EGP {d.totalCollected || 0}</TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            No drivers found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {tab === 3 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue Report
                </Typography>
                {revenue.length > 0 ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Total Revenue
                          </Typography>
                          <Typography variant="h4" component="div">
                            EGP {revenue[0].totalRevenue}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Total Payments
                          </Typography>
                          <Typography variant="h4" component="div">
                            {revenue[0].count}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Average Payment Value
                          </Typography>
                          <Typography variant="h4" component="div">
                            EGP {revenue[0].count > 0 ? (revenue[0].totalRevenue / revenue[0].count).toFixed(2) : '0.00'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Box textAlign="center" py={5}>
                    <Typography variant="h6" color="textSecondary">
                      No revenue data available
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Try adjusting the date range filter
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default ReportManagement;