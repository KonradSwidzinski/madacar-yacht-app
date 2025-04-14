import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField
} from '@mui/material';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import BookingManagement from './BookingManagement';

const AdminDashboard = () => {
  const [yachts, setYachts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingYacht, setEditingYacht] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    pricePerDay: '',
    capacity: '',
    length: '',
    location: '',
    features: ''
  });
  const navigate = useNavigate();
  const { logout, isAdmin, currentUser } = useAuth();

  useEffect(() => {
    // Redirect if not admin
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    fetchYachts();
  }, [currentUser, isAdmin, navigate]);

  const fetchYachts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'yachts'));
      const yachtsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setYachts(yachtsData);
    } catch (error) {
      console.error('Error fetching yachts:', error);
      setError('Failed to fetch yachts: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to log out: ' + error.message);
    }
  };

  const handleDeleteYacht = async (yachtId) => {
    if (window.confirm('Are you sure you want to delete this yacht?')) {
      try {
        await deleteDoc(doc(db, 'yachts', yachtId));
        await fetchYachts(); // Refresh the list
      } catch (error) {
        console.error('Error deleting yacht:', error);
        setError('Failed to delete yacht: ' + error.message);
      }
    }
  };

  const handleOpen = (yacht = null) => {
    if (yacht) {
      setEditingYacht(yacht);
      setFormData({
        name: yacht.name || '',
        description: yacht.description || '',
        imageUrl: yacht.imageUrl || '',
        pricePerDay: yacht.pricePerDay || '',
        capacity: yacht.capacity || '',
        length: yacht.length || '',
        location: yacht.location || '',
        features: yacht.features || ''
      });
    } else {
      setEditingYacht(null);
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        pricePerDay: '',
        capacity: '',
        length: '',
        location: '',
        features: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingYacht(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const yachtData = {
        ...formData,
        pricePerDay: Number(formData.pricePerDay),
        capacity: Number(formData.capacity),
        length: Number(formData.length)
      };

      if (editingYacht) {
        await updateDoc(doc(db, 'yachts', editingYacht.id), yachtData);
      } else {
        await addDoc(collection(db, 'yachts'), yachtData);
      }
      
      handleClose();
      await fetchYachts();
    } catch (error) {
      console.error('Error saving yacht:', error);
      setError('Failed to save yacht: ' + error.message);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!currentUser || !isAdmin) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleLogout}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Yachts Management" />
          <Tab label="Bookings Management" />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h2">
              Yachts
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => handleOpen()}
            >
              Add New Yacht
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price/Day</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {yachts.map((yacht) => (
                  <TableRow key={yacht.id}>
                    <TableCell>{yacht.name}</TableCell>
                    <TableCell>${yacht.pricePerDay}</TableCell>
                    <TableCell>{yacht.capacity} guests</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpen(yacht)}
                        size="small"
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteYacht(yacht.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <BookingManagement />
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingYacht ? 'Edit Yacht' : 'Add New Yacht'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Image URL"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Price per Day"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Length (ft)"
                  name="length"
                  value={formData.length}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Features (comma-separated)"
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  helperText="Enter features separated by commas"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingYacht ? 'Save Changes' : 'Add Yacht'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 