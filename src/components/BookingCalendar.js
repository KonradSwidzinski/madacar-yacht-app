import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  TextField,
  Button,
  Alert,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { addDays, differenceInDays, isWithinInterval, parseISO, startOfToday, isBefore } from 'date-fns';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const BookingCalendar = ({ yacht, onBookingSubmit }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [existingBookings, setExistingBookings] = useState([]);
  const [error, setError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch existing bookings for this yacht
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef, 
          where('yachtId', '==', yacht.id),
          where('status', 'in', ['confirmed', 'pending']) // Only check active bookings
        );
        const querySnapshot = await getDocs(q);
        const bookings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          startDate: parseISO(doc.data().startDate),
          endDate: parseISO(doc.data().endDate)
        }));
        console.log('Fetched bookings:', bookings); // Debug log
        setExistingBookings(bookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Error checking availability. Please try again.');
      }
    };

    if (yacht?.id) {
      fetchBookings();
    }
  }, [yacht?.id]);

  // Calculate total price when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const days = differenceInDays(endDate, startDate);
      setTotalPrice(days * yacht.pricePerDay);
    } else {
      setTotalPrice(0);
    }
  }, [startDate, endDate, yacht.pricePerDay]);

  const isDateDisabled = (date) => {
    // Prevent booking past dates
    if (isBefore(date, startOfToday())) {
      return true;
    }

    // Only allow dates from May to November
    const month = date.getMonth();
    if (month < 4 || month > 10) { // 4 = May, 10 = November
      return true;
    }

    // Check if date is within any existing booking
    return existingBookings.some(booking => {
      const isBooked = isWithinInterval(date, { 
        start: booking.startDate, 
        end: booking.endDate 
      });
      if (isBooked) {
        console.log('Date is booked:', date, 'by booking:', booking);
      }
      return isBooked;
    });
  };

  const validateDateRange = (start, end) => {
    if (!start || !end) return false;
    
    // Minimum 3 days
    const days = differenceInDays(end, start);
    if (days < 3) {
      setError('Minimum booking duration is 3 days');
      return false;
    }

    // Check if the range overlaps with existing bookings
    const hasOverlap = existingBookings.some(booking => {
      const overlaps = (start <= booking.endDate && end >= booking.startDate);
      if (overlaps) {
        console.log('Date range overlaps with booking:', booking); // Debug log
      }
      return overlaps;
    });
    
    if (hasOverlap) {
      setError('Selected dates overlap with existing bookings');
      return false;
    }

    setError('');
    return true;
  };

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    if (endDate && newDate) {
      validateDateRange(newDate, endDate);
    }
  };

  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
    if (startDate && newDate) {
      validateDateRange(startDate, newDate);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateDateRange(startDate, endDate)) {
      return;
    }

    onBookingSubmit({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalPrice,
      ...bookingDetails
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Book This Yacht
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
              shouldDisableDate={isDateDisabled}
              minDate={new Date()}
              slotProps={{
                textField: {
                  required: true,
                  fullWidth: true
                }
              }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={handleEndDateChange}
              shouldDisableDate={isDateDisabled}
              minDate={startDate ? addDays(startDate, 3) : new Date()}
              slotProps={{
                textField: {
                  required: true,
                  fullWidth: true
                }
              }}
            />
            <TextField
              label="Full Name"
              value={bookingDetails.name}
              onChange={(e) => setBookingDetails({...bookingDetails, name: e.target.value})}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={bookingDetails.email}
              onChange={(e) => setBookingDetails({...bookingDetails, email: e.target.value})}
              required
              fullWidth
            />
            <TextField
              label="Phone"
              value={bookingDetails.phone}
              onChange={(e) => setBookingDetails({...bookingDetails, phone: e.target.value})}
              required
              fullWidth
            />
            
            {totalPrice > 0 && (
              <Box sx={{ my: 2 }}>
                <Typography variant="h6">
                  Total Price: ${totalPrice}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {differenceInDays(endDate, startDate)} days at ${yacht.pricePerDay}/day
                </Typography>
              </Box>
            )}

            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              size="large"
              disabled={!!error || !startDate || !endDate}
            >
              Submit Booking
            </Button>
          </Stack>
        </form>
      </Paper>
    </LocalizationProvider>
  );
};

export default BookingCalendar; 