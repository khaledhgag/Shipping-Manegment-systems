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

function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/Driver');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await api.delete(`/Driver/${id}`);
        fetchDrivers();
      } catch (error) {
        console.error('Error deleting driver:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentDriver) {
        await api.put(`/Driver/${currentDriver._id}`, currentDriver);
      } else {
        await api.post('/Driver', currentDriver);
      }
      setOpen(false);
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Driver Management</h2>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setCurrentDriver({ name: '', phone: '', vehicle: '', availability: 'available' });
            setOpen(true);
          }}
        >
          Add Driver
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Availability</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver._id}>
                <TableCell>{driver.name}</TableCell>
                <TableCell>{driver.phone}</TableCell>
                <TableCell>{driver.vehicle}</TableCell>
                <TableCell>{driver.availability}</TableCell>
                <TableCell>
                  <IconButton onClick={() => {
                    setCurrentDriver(driver);
                    setOpen(true);
                  }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(driver._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentDriver?._id ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              value={currentDriver?.name || ''}
              onChange={(e) => setCurrentDriver({...currentDriver, name: e.target.value})}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Phone"
              value={currentDriver?.phone || ''}
              onChange={(e) => setCurrentDriver({...currentDriver, phone: e.target.value})}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Vehicle"
              value={currentDriver?.vehicle || ''}
              onChange={(e) => setCurrentDriver({...currentDriver, vehicle: e.target.value})}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Availability</InputLabel>
              <Select
                value={currentDriver?.availability || 'available'}
                onChange={(e) => setCurrentDriver({...currentDriver, availability: e.target.value})}
                label="Availability"
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="busy">Busy</MenuItem>
                <MenuItem value="off">Off</MenuItem>
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {currentDriver?._id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DriverManagement;