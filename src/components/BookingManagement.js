import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';

const statusColors = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'info',
  rejected: 'error'
};

const statusLabels = {
  pending: 'Oczekująca',
  confirmed: 'Potwierdzona',
  cancelled: 'Anulowana',
  completed: 'Zakończona',
  rejected: 'Odrzucona'
};

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef);
      const querySnapshot = await getDocs(q);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort bookings by date, most recent first
      bookingsData.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        lastUpdated: new Date().toISOString()
      });
      
      // Update local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (loading) {
    return <Typography>Ładowanie rezerwacji...</Typography>;
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Zarządzanie Rezerwacjami
        </Typography>
        <Tooltip title="Odśwież rezerwacje">
          <IconButton onClick={fetchBookings}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Jacht</TableCell>
              <TableCell>Klient</TableCell>
              <TableCell>Terminy</TableCell>
              <TableCell>Całkowita Cena</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Kontakt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.yachtName}</TableCell>
                <TableCell>{booking.customerName}</TableCell>
                <TableCell>
                  {format(new Date(booking.startDate), 'dd.MM.yyyy')} -<br />
                  {format(new Date(booking.endDate), 'dd.MM.yyyy')}
                </TableCell>
                <TableCell>{booking.totalPrice} zł</TableCell>
                <TableCell>
                  <Select
                    value={booking.status || 'pending'}
                    size="small"
                    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                    sx={{ minWidth: 120 }}
                    renderValue={(status) => (
                      <Chip 
                        label={statusLabels[status]} 
                        size="small" 
                        color={statusColors[status]}
                      />
                    )}
                  >
                    <MenuItem value="pending">Oczekująca</MenuItem>
                    <MenuItem value="confirmed">Potwierdzona</MenuItem>
                    <MenuItem value="cancelled">Anulowana</MenuItem>
                    <MenuItem value="completed">Zakończona</MenuItem>
                    <MenuItem value="rejected">Odrzucona</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {booking.customerEmail}<br />
                    {booking.customerPhone}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BookingManagement; 