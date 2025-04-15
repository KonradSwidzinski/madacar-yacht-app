import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Paper,
  Alert,
  Snackbar,
  Button
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
        } else {
          setError('Nie znaleziono jachtu');
        }
      } catch (error) {
        setError('Błąd podczas ładowania danych jachtu');
      } finally {
        setLoading(false);
      }
    };

    fetchYacht();
  }, [id]);

  const handleBookingSubmit = async (bookingData) => {
    try {
      if (!currentUser) {
        setError('Musisz być zalogowany, aby dokonać rezerwacji');
        return;
      }

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

      setSuccessMessage('Rezerwacja została złożona pomyślnie! Sprawdź swoją skrzynkę email.');
    } catch (error) {
      setError('Nie udało się złożyć rezerwacji. Spróbuj ponownie.');
    }
  };

  if (loading) return <Container><Typography>Ładowanie...</Typography></Container>;
  if (!yacht) return <Container><Typography>Nie znaleziono jachtu</Typography></Container>;

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

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
      )}

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
              Opis
            </Typography>
            <Typography paragraph>
              {yacht.description}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Specyfikacja
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography><strong>Długość:</strong> {yacht.length} m</Typography>
                <Typography><strong>Pojemność:</strong> {yacht.capacity} osób</Typography>
                <Typography><strong>Lokalizacja:</strong> {yacht.location}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography><strong>Cena:</strong> {yacht.pricePerDay} zł/dzień</Typography>
                <Typography><strong>Wyposażenie:</strong> {yacht.features}</Typography>
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
                Zaloguj się, aby zarezerwować jacht
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Musisz być zalogowany, aby dokonać rezerwacji.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/login')}
                fullWidth
              >
                Zaloguj się
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default YachtDetails; 