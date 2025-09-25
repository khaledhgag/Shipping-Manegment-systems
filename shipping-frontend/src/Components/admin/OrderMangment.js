// src/components/admin/OrderManagement.js
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
import OrderForm from '../common/OrderForm';

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/Order/${id}`);
        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
      }
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Order Management</h2>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setCurrentOrder(null);
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
              <TableCell>ID</TableCell>
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
                <TableCell>{order._id.substring(0, 8)}</TableCell>
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
                  <IconButton onClick={() => handleDelete(order._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{currentOrder ? 'Edit Order' : 'Add New Order'}</DialogTitle>
        <DialogContent>
          <OrderForm
            order={currentOrder}
            onSave={() => {
              setOpen(false);
              fetchOrders();
            }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrderManagement;