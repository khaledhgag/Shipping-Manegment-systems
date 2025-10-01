// src/Components/admin/PaymentManagement.js
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { Edit, Payment, CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import api from '../../Services/api';

function PaymentManagement() {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/payment`, { paymentStatus: status });
      fetchOrders(); // Refresh the list
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError('Failed to update payment status');
    }
  };

  const handleOpenDialog = (order) => {
    setCurrentOrder(order);
    setPaymentStatus(order.paymentStatus);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setCurrentOrder(null);
    setPaymentStatus('');
  };

  const handleSubmit = async () => {
    if (!currentOrder) return;
    
    try {
      await api.put(`/orders/${currentOrder._id}/payment`, { paymentStatus });
      fetchOrders();
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating payment:', error);
      setError('Failed to update payment');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Cancel color="error" />;
      default:
        return <HourglassEmpty color="warning" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (loading) return <div>Loading payments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Payment Management</h2>
        <Button
          variant="contained"
          startIcon={<Payment />}
          onClick={fetchOrders}
        >
          Refresh
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Order Status</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>${order.price}</TableCell>
                <TableCell>
                  <Chip 
                    icon={getStatusIcon(order.status)}
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    icon={getStatusIcon(order.paymentStatus)}
                    label={order.paymentStatus}
                    color={getStatusColor(order.paymentStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleOpenDialog(order)}
                    color="primary"
                    title="Update Payment"
                  >
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          {currentOrder && (
            <div>
              <h3>Order: {currentOrder.orderNumber}</h3>
              <p>Customer: {currentOrder.customerName}</p>
              <p>Amount: ${currentOrder.price}</p>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  label="Payment Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PaymentManagement;