import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box, Button } from '@mui/material';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import YachtCard from './YachtCard';
import { addSampleYachts, addSampleBookings } from '../sampleData';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia } from '@mui/material';

const Home = () => {
  const [yachts, setYachts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchYachts = async () => {
      console.log('Fetching yachts...');
      try {
        const querySnapshot = await getDocs(collection(db, 'yachts'));
        console.log('Query snapshot:', querySnapshot);
        const yachtsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Yachts data:', yachtsData);
        setYachts(yachtsData);
      } catch (error) {
        console.error('Error fetching yachts:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchYachts();
  }, []);

  const handleAddSampleData = async () => {
    console.log('Adding sample yachts...');
    try {
      await addSampleYachts();
      // Instead of reloading the page, let's fetch the data again
      const querySnapshot = await getDocs(collection(db, 'yachts'));
      const yachtsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setYachts(yachtsData);
    } catch (error) {
      console.error('Error adding sample yachts:', error);
      setError(error.message);
    }
  };

  const handleAddSampleBookings = async () => {
    console.log('Adding sample bookings...');
    try {
      await addSampleBookings();
      alert('Sample bookings added successfully!');
    } catch (error) {
      console.error('Error adding sample bookings:', error);
      setError(error.message);
    }
  };

  const handleTestFirebase = async () => {
    try {
      console.log('Testing Firebase connection...');
      // Try to add a test document
      const testDoc = await addDoc(collection(db, 'test'), {
        test: 'This is a test document'
      });
      console.log('Test document added successfully:', testDoc.id);
      alert('Firebase connection successful! Test document added.');
    } catch (error) {
      console.error('Firebase test failed:', error);
      alert('Firebase connection failed: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleYachtClick = (yachtId) => {
    navigate(`/yacht/${yachtId}`);
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">Error: {error}</Typography>
      </Container>
    );
  }

  console.log('Rendering Home component with yachts:', yachts);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Luxury Yacht Rentals
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Experience the ultimate luxury on the water
          </Typography>
        </Box>
        <Box>
          {currentUser ? (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body1">
                Welcome, {currentUser.email}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {isAdmin && (
        <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleAddSampleData}
          >
            Add Sample Yachts
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleAddSampleBookings}
          >
            Add Sample Bookings
          </Button>
        </Box>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        Available Yachts
      </Typography>
      <Grid container spacing={4}>
        {yachts.map((yacht) => (
          <Grid item key={yacht.id} xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease-in-out'
                }
              }}
              onClick={() => handleYachtClick(yacht.id)}
            >
              <CardMedia
                component="img"
                height="200"
                image={yacht.imageUrl || 'https://via.placeholder.com/300x200?text=Yacht+Image'}
                alt={yacht.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {yacht.name}
                </Typography>
                <Typography>
                  {yacht.description?.substring(0, 100)}...
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" color="primary">
                    ${yacht.pricePerDay} / day
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 