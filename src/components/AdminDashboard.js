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
      setError('Błąd podczas pobierania jachtów: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      setError('Błąd podczas wylogowywania: ' + error.message);
    }
  };

  const handleDeleteYacht = async (yachtId) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten jacht?')) {
      try {
        await deleteDoc(doc(db, 'yachts', yachtId));
        await fetchYachts();
      } catch (error) {
        console.error('Error deleting yacht:', error);
        setError('Błąd podczas usuwania jachtu: ' + error.message);
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
          Panel Administratora
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleLogout}
          sx={{ mt: 2 }}
        >
          Wyloguj
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Zarządzanie Jachtami" />
          <Tab label="Zarządzanie Rezerwacjami" />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h2">
              Jachty
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => handleOpen()}
            >
              Dodaj Nowy Jacht
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nazwa</TableCell>
                  <TableCell>Cena/Dzień</TableCell>
                  <TableCell>Pojemność</TableCell>
                  <TableCell>Akcje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {yachts.map((yacht) => (
                  <TableRow key={yacht.id}>
                    <TableCell>{yacht.name}</TableCell>
                    <TableCell>{yacht.pricePerDay} zł</TableCell>
                    <TableCell>{yacht.capacity} osób</TableCell>
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
          {editingYacht ? 'Edytuj Jacht' : 'Dodaj Nowy Jacht'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Nazwa"
                  fullWidth
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Opis"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="imageUrl"
                  label="URL Zdjęcia"
                  fullWidth
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="pricePerDay"
                  label="Cena za Dzień"
                  type="number"
                  fullWidth
                  value={formData.pricePerDay}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="capacity"
                  label="Pojemność"
                  type="number"
                  fullWidth
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="length"
                  label="Długość (m)"
                  type="number"
                  fullWidth
                  value={formData.length}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="location"
                  label="Lokalizacja"
                  fullWidth
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="features"
                  label="Wyposażenie"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.features}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Anuluj</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingYacht ? 'Zapisz Zmiany' : 'Dodaj Jacht'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 