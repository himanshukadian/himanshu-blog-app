import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Button, TextField, Paper, Typography, CircularProgress, Snackbar, Alert, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch, Slide } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', isAdmin: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users');
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/users/${deleteId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      setSnackbar({ open: true, message: 'User deleted', severity: 'success' });
      fetchUsers();
    } catch {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const openDeleteDialog = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleAddUser = () => {
    setEditing(null);
    setForm({ username: '', password: '', isAdmin: false });
    setFormDialogOpen(true);
  };

  const handleEdit = (user) => {
    setEditing(user._id);
    setForm({ username: user.username, password: '', isAdmin: user.isAdmin });
    setFormDialogOpen(true);
  };

  const handleFormChange = e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${localStorage.getItem('adminToken')}` };
    try {
      if (editing) {
        const updateData = { ...form };
        if (!updateData.password) delete updateData.password;
        await api.put(`/users/${editing}`, updateData, { headers });
        setSnackbar({ open: true, message: 'User updated', severity: 'success' });
      } else {
        await api.post('/users', form, { headers });
        setSnackbar({ open: true, message: 'User created', severity: 'success' });
      }
      setEditing(null);
      setForm({ username: '', password: '', isAdmin: false });
      setFormDialogOpen(false);
      fetchUsers();
    } catch {
      setSnackbar({ open: true, message: 'Save failed', severity: 'error' });
    }
  };

  const handleCloseDialog = () => {
    setFormDialogOpen(false);
    setEditing(null);
    setForm({ username: '', password: '', isAdmin: false });
  };

  const columns = [
    { field: 'username', headerName: 'Username', flex: 1 },
    { 
      field: 'isAdmin', 
      headerName: 'Admin', 
      flex: 1,
      renderCell: (params) => (
        <Typography color={params.value ? 'primary' : 'text.secondary'}>
          {params.value ? 'Yes' : 'No'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: (params) => (
        <>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleEdit(params.row)}
            sx={{ mr: 1, display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => openDeleteDialog(params.row._id)}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Delete
          </Button>
          <IconButton size="small" onClick={() => handleEdit(params.row)} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}><EditIcon /></IconButton>
          <IconButton size="small" color="error" onClick={() => openDeleteDialog(params.row._id)} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}><DeleteIcon /></IconButton>
        </>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.4rem', sm: '2rem' }, fontWeight: 700 }}>
          Manage Users
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          Add User
        </Button>
        <IconButton
          color="primary"
          onClick={handleAddUser}
          sx={{ display: { xs: 'flex', sm: 'none' } }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <Box sx={{ width: '100%', maxWidth: '100vw', overflowX: 'auto' }}>
          <DataGrid
            autoHeight
            rows={users.map(u => ({ ...u, id: u._id }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20, 100]}
            sx={{ minWidth: 320, maxWidth: '100vw', bgcolor: 'background.paper', color: 'text.primary', borderRadius: 2 }}
            disableSelectionOnClick
          />
        </Box>
      )}

      {/* User Form Dialog */}
      <Dialog 
        open={formDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle>
          {editing ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleFormSubmit} style={{ width: '100%' }}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField 
                name="username" 
                label="Username" 
                value={form.username} 
                onChange={handleFormChange} 
                required 
                size="small" 
                variant="outlined" 
                fullWidth 
              />
              <TextField 
                name="password" 
                label={editing ? "New Password (leave blank to keep current)" : "Password"} 
                type="password"
                value={form.password} 
                onChange={handleFormChange} 
                required={!editing}
                size="small" 
                variant="outlined" 
                fullWidth 
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isAdmin}
                    onChange={handleFormChange}
                    name="isAdmin"
                  />
                }
                label="Admin User"
              />
            </Stack>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained"
            disabled={!form.username || (!editing && !form.password)}
          >
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        TransitionComponent={Transition}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          Are you sure you want to delete this user?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsers; 