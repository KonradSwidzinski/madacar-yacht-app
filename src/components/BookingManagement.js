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
    return <Typography>Loading bookings...</Typography>;
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Booking Management
        </Typography>
        <Tooltip title="Refresh bookings">
          <IconButton onClick={fetchBookings}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Yacht</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Contact</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.yachtName}</TableCell>
                <TableCell>{booking.customerName}</TableCell>
                <TableCell>
                  {format(new Date(booking.startDate), 'MMM d, yyyy')} -<br />
                  {format(new Date(booking.endDate), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>${booking.totalPrice}</TableCell>
                <TableCell>
                  <Select
                    value={booking.status || 'pending'}
                    size="small"
                    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                    sx={{ minWidth: 120 }}
                    renderValue={(status) => (
                      <Chip 
                        label={status.charAt(0).toUpperCase() + status.slice(1)} 
                        size="small" 
                        color={statusColors[status]}
                      />
                    )}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
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