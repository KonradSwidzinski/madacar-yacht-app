import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import BookingCalendar from './BookingCalendar';

const YachtDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [yacht, setYacht] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchYacht = async () => {
      try {
        const yachtDoc = await getDoc(doc(db, 'yachts', id));
        if (yachtDoc.exists()) {
          setYacht({ id: yachtDoc.id, ...yachtDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching yacht:', error);
        setError('Failed to load yacht details');
      } finally {
        setLoading(false);
      }
    };

    fetchYacht();
  }, [id]);

  const handleBookingSubmit = async (bookingData) => {
    try {
      if (!currentUser) {
        setError('You must be logged in to make a booking');
        return;
      }

      // Create the booking in Firestore
      await addDoc(collection(db, 'bookings'), {
        yachtId: yacht.id,
        yachtName: yacht.name,
        userId: currentUser.uid,
        customerName: bookingData.name,
        customerEmail: bookingData.email,
        customerPhone: bookingData.phone,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        totalPrice: bookingData.totalPrice,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      setSuccessMessage('Booking submitted successfully! Check your email for confirmation.');
    } catch (error) {
      console.error('Error submitting booking:', error);
      setError('Failed to submit booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!yacht) {
    return (
      <Container>
        <Typography>Yacht not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {yacht.name}
            </Typography>
            <Box
              component="img"
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 1,
                mb: 3
              }}
              src={yacht.imageUrl}
              alt={yacht.name}
            />
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography paragraph>
              {yacht.description}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Specifications
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography><strong>Length:</strong> {yacht.length}ft</Typography>
                <Typography><strong>Capacity:</strong> {yacht.capacity} guests</Typography>
                <Typography><strong>Location:</strong> {yacht.location}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography><strong>Price:</strong> ${yacht.pricePerDay}/day</Typography>
                <Typography><strong>Features:</strong> {yacht.features}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          {currentUser ? (
            <BookingCalendar 
              yacht={yacht} 
              onBookingSubmit={handleBookingSubmit} 
            />
          ) : (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Please log in to book this yacht
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You need to be logged in to make a booking. Click here to log in or create an account.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default YachtDetails; 