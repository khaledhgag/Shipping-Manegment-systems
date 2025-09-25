import React, { useState, useEffect } from 'react';
import { Button, DialogActions } from '@mui/material';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
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

  const handleStatusChange = async (driverId, availability) => {
    try {
      await api.put(`/Driver/${driverId}/status`, { availability });
      fetchDrivers();
    } catch (error) {
      console.error('Error updating driver status:', error);
    }
  };

  return (
    <div>
      <h2>Driver Management</h2>

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
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={driver.availability}
                      onChange={(e) => handleStatusChange(driver._id, e.target.value)}
                    >
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="busy">Busy</MenuItem>
                      <MenuItem value="off">Off</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => {
                    setCurrentDriver(driver);
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Driver Details</DialogTitle>
        <DialogContent>
          {currentDriver && (
            <div>
              <TextField
                margin="normal"
                fullWidth
                label="Name"
                value={currentDriver.name}
                InputProps={{ readOnly: true }}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Phone"
                value={currentDriver.phone}
                InputProps={{ readOnly: true }}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Vehicle"
                value={currentDriver.vehicle}
                InputProps={{ readOnly: true }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Availability</InputLabel>
                <Select
                  value={currentDriver.availability}
                  onChange={(e) => handleStatusChange(currentDriver._id, e.target.value)}
                  label="Availability"
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="busy">Busy</MenuItem>
                  <MenuItem value="off">Off</MenuItem>
                </Select>
              </FormControl>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DriverManagement;