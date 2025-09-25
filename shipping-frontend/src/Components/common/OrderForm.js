// src/components/common/OrderForm.js
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import api from '../../Services/api';

function OrderForm({ order, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    from: '',
    to: '',
    price: '',
    status: 'pending',
  });

  useEffect(() => {
    if (order) {
      setFormData(order);
    }
  }, [order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (order) {
        await api.put(`/Order/${order._id}`, formData);
      } else {
        await api.post('/Order', formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            name="customerName"
            label="Customer Name"
            value={formData.customerName}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="customerPhone"
            label="Customer Phone"
            value={formData.customerPhone}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="from"
            label="From"
            value={formData.from}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="to"
            label="To"
            value={formData.to}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="price"
            label="Price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="in-transit">In Transit</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          {order ? 'Update' : 'Create'}
        </Button>
      </Box>
    </Box>
  );
}

export default OrderForm;