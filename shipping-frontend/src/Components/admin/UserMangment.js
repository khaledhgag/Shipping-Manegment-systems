// src/components/admin/UserManagement.js
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
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import api from '../../Services/api';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('UserManagement: Component mounted, fetching users...');
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('UserManagement: Fetching users...');
      const response = await api.get('/users');
      console.log('UserManagement: Users response:', response.status, response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('UserManagement: Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        console.log('UserManagement: Deleting user:', id);
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('UserManagement: Error deleting user:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
     if (currentUser && currentUser._id) {
  // تحديث
  console.log('UserManagement: Updating user:', currentUser._id);
  await api.put(`/users/${currentUser._id}`, currentUser);
} else {
  // إنشاء
  console.log('UserManagement: Creating new user');
  await api.post('/users', currentUser);
}

      setOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('UserManagement: Error saving user:', error);
    }
  };

  console.log('UserManagement: Rendered, loading:', loading, 'users count:', users.length);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setCurrentUser({ name: '', email: '', password: '', role: 'employee' });
            setOpen(true);
          }}
        >
          Add User
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <IconButton onClick={() => {
                    setCurrentUser(user);
                    setOpen(true);
                  }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentUser?._id ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              value={currentUser?.name || ''}
              onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              value={currentUser?.email || ''}
              onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
            />
            <TextField
              margin="normal"
              required={!currentUser?._id}
              fullWidth
              label="Password"
              type="password"
              value={currentUser?.password || ''}
              onChange={(e) => setCurrentUser({...currentUser, password: e.target.value})}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={currentUser?.role || 'employee'}
                onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {currentUser?._id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UserManagement;