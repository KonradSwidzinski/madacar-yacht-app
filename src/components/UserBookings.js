import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Chip
} from '@mui/material';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const statusColors = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'info',
  rejected: 'error'
};

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef, 
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      bookingsData.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      
      setBookings(bookingsData);
      setError('');
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Błąd podczas ładowania rezerwacji. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Czy na pewno chcesz anulować tę rezerwację?')) {
      return;
    }

    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        lastUpdated: new Date().toISOString()
      });
      
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
      setError('');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Błąd podczas anulowania rezerwacji. Spróbuj ponownie.');
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: 'Oczekująca',
      confirmed: 'Potwierdzona',
      cancelled: 'Anulowana',
      completed: 'Zakończona',
      rejected: 'Odrzucona'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return <Typography>Ładowanie rezerwacji...</Typography>;
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Moje Rezerwacje
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>Nie masz jeszcze żadnych rezerwacji.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Jacht</TableCell>
                <TableCell>Terminy</TableCell>
                <TableCell>Całkowita Cena</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.yachtName}</TableCell>
                  <TableCell>
                    {format(new Date(booking.startDate), 'dd.MM.yyyy')} -<br />
                    {format(new Date(booking.endDate), 'dd.MM.yyyy')}
                  </TableCell>
                  <TableCell>{booking.totalPrice} zł</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(booking.status)}
                      size="small"
                      color={statusColors[booking.status]}
                    />
                  </TableCell>
                  <TableCell>
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Anuluj Rezerwację
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default UserBookings; 