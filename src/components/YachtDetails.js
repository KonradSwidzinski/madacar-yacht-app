import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Paper,
  TextField,
  Button,
  Stack
} from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const YachtDetails = () => {
  const { id } = useParams();
  const [yacht, setYacht] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const fetchYacht = async () => {
      try {
        const yachtDoc = await getDoc(doc(db, 'yachts', id));
        if (yachtDoc.exists()) {
          setYacht({ id: yachtDoc.id, ...yachtDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching yacht:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchYacht();
  }, [id]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement booking submission to Firebase
    console.log('Booking submitted:', { startDate, endDate, bookingDetails });
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
                <Typography><strong>Length:</strong> {yacht.length}m</Typography>
                <Typography><strong>Capacity:</strong> {yacht.capacity} guests</Typography>
                <Typography><strong>Crew:</strong> {yacht.crew} members</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography><strong>Cabins:</strong> {yacht.cabins}</Typography>
                <Typography><strong>Speed:</strong> {yacht.speed} knots</Typography>
                <Typography><strong>Price:</strong> ${yacht.pricePerDay}/day</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Book This Yacht
            </Typography>
            <form onSubmit={handleBookingSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
                <TextField
                  label="Full Name"
                  value={bookingDetails.name}
                  onChange={(e) => setBookingDetails({...bookingDetails, name: e.target.value})}
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={bookingDetails.email}
                  onChange={(e) => setBookingDetails({...bookingDetails, email: e.target.value})}
                  required
                />
                <TextField
                  label="Phone"
                  value={bookingDetails.phone}
                  onChange={(e) => setBookingDetails({...bookingDetails, phone: e.target.value})}
                  required
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  size="large"
                >
                  Submit Booking
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default YachtDetails; 