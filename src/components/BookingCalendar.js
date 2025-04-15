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

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef, 
          where('yachtId', '==', yacht.id),
          where('status', 'in', ['confirmed', 'pending'])
        );
        const bookings = (await getDocs(q)).docs.map(doc => ({
          id: doc.id,
          startDate: parseISO(doc.data().startDate),
          endDate: parseISO(doc.data().endDate)
        }));
        setExistingBookings(bookings);
      } catch (error) {
        setError('Błąd podczas sprawdzania dostępności. Spróbuj ponownie.');
      }
    };

    if (yacht?.id) {
      fetchBookings();
    }
  }, [yacht?.id]);

  useEffect(() => {
    if (startDate && endDate) {
      setTotalPrice(differenceInDays(endDate, startDate) * yacht.pricePerDay);
    } else {
      setTotalPrice(0);
    }
  }, [startDate, endDate, yacht.pricePerDay]);

  const isDateDisabled = (date) => {
    if (isBefore(date, startOfToday())) return true;
    
    const month = date.getMonth();
    if (month < 4 || month > 10) return true;

    return existingBookings.some(booking => 
      isWithinInterval(date, { 
        start: booking.startDate, 
        end: booking.endDate 
      })
    );
  };

  const validateDateRange = (start, end) => {
    if (!start || !end) return false;
    
    const days = differenceInDays(end, start);
    if (days < 3) {
      setError('Minimalny okres rezerwacji to 3 dni');
      return false;
    }

    const hasOverlap = existingBookings.some(booking => 
      start <= booking.endDate && end >= booking.startDate
    );
    
    if (hasOverlap) {
      setError('Wybrane daty pokrywają się z istniejącą rezerwacją');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateDateRange(startDate, endDate)) {
      onBookingSubmit({
        ...bookingDetails,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalPrice
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Rezerwacja
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <DatePicker
              label="Data rozpoczęcia"
              value={startDate}
              onChange={handleStartDateChange}
              shouldDisableDate={isDateDisabled}
              minDate={startOfToday()}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="Data zakończenia"
              value={endDate}
              onChange={handleEndDateChange}
              shouldDisableDate={isDateDisabled}
              minDate={startDate ? addDays(startDate, 3) : startOfToday()}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <TextField
              label="Imię i nazwisko"
              name="name"
              value={bookingDetails.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={bookingDetails.email}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Telefon"
              name="phone"
              value={bookingDetails.phone}
              onChange={handleInputChange}
              required
            />
            {totalPrice > 0 && (
              <Box sx={{ my: 2 }}>
                <Typography variant="h6">
                  Całkowita cena: {totalPrice} zł
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {differenceInDays(endDate, startDate)} dni po {yacht.pricePerDay} zł/dzień
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
              Zatwierdź rezerwację
            </Button>
          </Stack>
        </form>
      </Paper>
    </LocalizationProvider>
  );
};

export default BookingCalendar; 