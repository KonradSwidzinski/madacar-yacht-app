import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box, Button } from '@mui/material';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import YachtCard from './YachtCard';
import { addSampleYachts } from '../sampleData';

const Home = () => {
  const [yachts, setYachts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Luxury Yacht Rentals
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Experience the ultimate luxury on the water
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddSampleData}
          >
            Add Sample Yachts
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleTestFirebase}
          >
            Test Firebase Connection
          </Button>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {yachts.map((yacht) => (
          <Grid item xs={12} sm={6} md={4} key={yacht.id}>
            <YachtCard yacht={yacht} />
          </Grid>
        ))}
        {yachts.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" color="text.secondary" align="center">
              No yachts found. Click "Add Sample Yachts" to add some sample data.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Home; 