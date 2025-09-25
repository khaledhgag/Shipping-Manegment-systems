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
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import api from '../../Services/api';

function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchPayments();
    fetchOrders();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/Payment');
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/Order');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await api.delete(`/Payment/${id}`);
        fetchPayments();
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    }
  };

  const handleStatusChange = async (paymentId, status) => {
    try {
      await api.put(`/Payment/${paymentId}/status`, { status });
      fetchPayments();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentPayment) {
        await api.put(`/Payment/${currentPayment._id}`, currentPayment);
      } else {
        await api.post('/Payment', currentPayment);
      }
      setOpen(false);
      fetchPayments();
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Payment Management</h2>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setCurrentPayment({ 
              order: '', 
              amount: '', 
              method: 'cash', 
              status: 'pending' 
            });
            setOpen(true);
          }}
        >
          Add Payment
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell>{payment.order?.customerName || 'Unknown'}</TableCell>
                <TableCell>${payment.amount}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={payment.status}
                      onChange={(e) => handleStatusChange(payment._id, e.target.value)}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => {
                    setCurrentPayment(payment);
                    setOpen(true);
                  }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(payment._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentPayment?._id ? 'Edit Payment' : 'Add New Payment'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Order</InputLabel>
              <Select
                value={currentPayment?.order || ''}
                onChange={(e) => setCurrentPayment({...currentPayment, order: e.target.value})}
                label="Order"
                required
              >
                {orders.map((order) => (
                  <MenuItem key={order._id} value={order._id}>
                    {order.customerName} - {order.from} to {order.to}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Amount"
              type="number"
              value={currentPayment?.amount || ''}
              onChange={(e) => setCurrentPayment({...currentPayment, amount: e.target.value})}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Method</InputLabel>
              <Select
                value={currentPayment?.method || 'cash'}
                onChange={(e) => setCurrentPayment({...currentPayment, method: e.target.value})}
                label="Method"
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="credit_card">Credit Card</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={currentPayment?.status || 'pending'}
                onChange={(e) => setCurrentPayment({...currentPayment, status: e.target.value})}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {currentPayment?._id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PaymentManagement;