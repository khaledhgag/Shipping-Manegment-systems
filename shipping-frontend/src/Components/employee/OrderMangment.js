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
import { Edit, Add } from '@mui/icons-material';
import api from '../../Services/api';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/Order');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/Driver');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleAssignDriver = async (orderId, driverId) => {
    try {
      await api.put(`/Order/${orderId}/assign`, { driverId });
      fetchOrders();
    } catch (error) {
      console.error('Error assigning driver:', error);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/Order/${orderId}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentOrder) {
        await api.put(`/Order/${currentOrder._id}`, currentOrder);
      } else {
        await api.post('/Order', currentOrder);
      }
      setOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Order Management</h2>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setCurrentOrder({ 
              customerName: '', 
              customerPhone: '', 
              from: '', 
              to: '', 
              price: '', 
              status: 'pending' 
            });
            setOpen(true);
          }}
        >
          Add Order
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.from}</TableCell>
                <TableCell>{order.to}</TableCell>
                <TableCell>${order.price}</TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="assigned">Assigned</MenuItem>
                      <MenuItem value="in-transit">In Transit</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={order.assignedDriver || ''}
                      onChange={(e) => handleAssignDriver(order._id, e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">Unassigned</MenuItem>
                      {drivers.map((driver) => (
                        <MenuItem key={driver._id} value={driver._id}>
                          {driver.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => {
                    setCurrentOrder(order);
                    setOpen(true);
                  }}>
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{currentOrder?._id ? 'Edit Order' : 'Add New Order'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Customer Name"
              value={currentOrder?.customerName || ''}
              onChange={(e) => setCurrentOrder({...currentOrder, customerName: e.target.value})}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Customer Phone"
              value={currentOrder?.customerPhone || ''}
              onChange={(e) => setCurrentOrder({...currentOrder, customerPhone: e.target.value})}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="From"
              value={currentOrder?.from || ''}
              onChange={(e) => setCurrentOrder({...currentOrder, from: e.target.value})}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="To"
              value={currentOrder?.to || ''}
              onChange={(e) => setCurrentOrder({...currentOrder, to: e.target.value})}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Price"
              type="number"
              value={currentOrder?.price || ''}
              onChange={(e) => setCurrentOrder({...currentOrder, price: e.target.value})}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={currentOrder?.status || 'pending'}
                onChange={(e) => setCurrentOrder({...currentOrder, status: e.target.value})}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="in-transit">In Transit</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {currentOrder?._id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default OrderManagement;