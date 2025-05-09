import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Button, TextField, Paper, Typography, CircularProgress, Snackbar, Alert, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Slide } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AdminTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/types');
      setTypes(res.data);
    } catch (err) {
      setError('Failed to fetch types');
    }
    setLoading(false);
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/types/${deleteId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      setSnackbar({ open: true, message: 'Type deleted', severity: 'success' });
      fetchTypes();
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

  const handleAddType = () => {
    setEditing(null);
    setForm({ name: '' });
    setFormDialogOpen(true);
  };

  const handleEdit = (type) => {
    setEditing(type._id);
    setForm({ name: type.name });
    setFormDialogOpen(true);
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${localStorage.getItem('adminToken')}` };
    try {
      if (editing) {
        await api.put(`/types/${editing}`, form, { headers });
        setSnackbar({ open: true, message: 'Type updated', severity: 'success' });
      } else {
        await api.post('/types', form, { headers });
        setSnackbar({ open: true, message: 'Type created', severity: 'success' });
      }
      setEditing(null);
      setForm({ name: '' });
      setFormDialogOpen(false);
      fetchTypes();
    } catch {
      setSnackbar({ open: true, message: 'Save failed', severity: 'error' });
    }
  };

  const handleCloseDialog = () => {
    setFormDialogOpen(false);
    setEditing(null);
    setForm({ name: '' });
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
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
          Manage Types
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddType}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          Add Type
        </Button>
        <IconButton
          color="primary"
          onClick={handleAddType}
          sx={{ display: { xs: 'flex', sm: 'none' } }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <Box sx={{ width: '100%', maxWidth: '100vw', overflowX: 'auto' }}>
          <DataGrid
            autoHeight
            rows={types.map(t => ({ ...t, id: t._id }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20, 100]}
            sx={{ minWidth: 320, maxWidth: '100vw', bgcolor: 'background.paper', color: 'text.primary', borderRadius: 2 }}
            disableSelectionOnClick
          />
        </Box>
      )}

      {/* Type Form Dialog */}
      <Dialog 
        open={formDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle>
          {editing ? 'Edit Type' : 'Add New Type'}
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleFormSubmit} style={{ width: '100%' }}>
            <TextField 
              name="name" 
              label="Type name" 
              value={form.name} 
              onChange={handleFormChange} 
              required 
              size="small" 
              variant="outlined" 
              fullWidth 
              sx={{ mt: 1 }}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained"
            disabled={!form.name}
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
          Are you sure you want to delete this type?
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

export default AdminTypes; 