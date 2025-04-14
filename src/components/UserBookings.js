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
      
      // Sort bookings by date, most recent first
      bookingsData.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      
      setBookings(bookingsData);
      setError('');
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
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
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        lastUpdated: new Date().toISOString()
      });
      
      // Update local state
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
      setError('Failed to cancel booking. Please try again.');
    }
  };

  if (loading) {
    return <Typography>Loading your bookings...</Typography>;
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        My Bookings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>You don't have any bookings yet.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Yacht</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.yachtName}</TableCell>
                  <TableCell>
                    {format(new Date(booking.startDate), 'MMM d, yyyy')} -<br />
                    {format(new Date(booking.endDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>${booking.totalPrice}</TableCell>
                  <TableCell>
                    <Chip 
                      label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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
                        Cancel Booking
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