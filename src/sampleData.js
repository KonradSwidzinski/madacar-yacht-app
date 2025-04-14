import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';

const sampleYachts = [
  {
    name: "Ocean Paradise",
    description: "Experience true luxury aboard this stunning 55-meter superyacht. Features include a master suite with private balcony, infinity pool, and state-of-the-art entertainment systems.",
    imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?ixlib=rb-4.0.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    pricePerDay: 25000,
    length: 55,
    capacity: 12,
    crew: 13,
    cabins: 6,
    speed: 15.5
  },
  {
    name: "Azure Dreams",
    description: "A masterpiece of modern yacht design, offering the perfect blend of performance and luxury. Featuring a spacious sundeck, jacuzzi, and premium water toys.",
    imageUrl: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?ixlib=rb-4.0.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    pricePerDay: 18000,
    length: 45,
    capacity: 10,
    crew: 8,
    cabins: 5,
    speed: 17
  },
  {
    name: "Royal Voyager",
    description: "Classic elegance meets modern comfort in this exceptional yacht. Perfect for family vacations with its spacious layout and variety of entertainment options.",
    imageUrl: "https://images.unsplash.com/photo-1577287973230-6c957d0682bf?ixlib=rb-4.0.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    pricePerDay: 15000,
    length: 40,
    capacity: 8,
    crew: 6,
    cabins: 4,
    speed: 14
  }
];

// Sample booking data for testing
const sampleBookings = [
  {
    startDate: '2024-05-15T00:00:00.000Z',
    endDate: '2024-05-20T00:00:00.000Z',
    customerName: 'John Smith',
    customerEmail: 'john.smith@example.com',
    customerPhone: '+1234567890',
    status: 'confirmed'
  },
  {
    startDate: '2024-06-10T00:00:00.000Z',
    endDate: '2024-06-15T00:00:00.000Z',
    customerName: 'Alice Johnson',
    customerEmail: 'alice.j@example.com',
    customerPhone: '+0987654321',
    status: 'pending'
  },
  {
    startDate: '2024-07-01T00:00:00.000Z',
    endDate: '2024-07-05T00:00:00.000Z',
    customerName: 'Bob Wilson',
    customerEmail: 'bob.wilson@example.com',
    customerPhone: '+1122334455',
    status: 'confirmed'
  }
];

export const addSampleYachts = async () => {
  try {
    const yachtsCollection = collection(db, 'yachts');
    for (const yacht of sampleYachts) {
      await addDoc(yachtsCollection, yacht);
    }
    console.log('Sample yachts added successfully!');
  } catch (error) {
    console.error('Error adding sample yachts:', error);
  }
};

export const addSampleBookings = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error('No authenticated user found. Please log in first.');
      return;
    }

    // First get all yachts to distribute bookings among them
    const yachtsSnapshot = await getDocs(collection(db, 'yachts'));
    const yachts = yachtsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (yachts.length === 0) {
      console.error('No yachts found. Please add yachts first.');
      return;
    }

    // Add bookings for each yacht
    for (const yacht of yachts) {
      for (const booking of sampleBookings) {
        const bookingData = {
          ...booking,
          yachtId: yacht.id,
          yachtName: yacht.name,
          userId: currentUser.uid,
          totalPrice: calculatePrice(booking.startDate, booking.endDate, yacht.pricePerDay),
          createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'bookings'), bookingData);
      }
    }

    console.log('Sample bookings added successfully!');
  } catch (error) {
    console.error('Error adding sample bookings:', error.message);
    throw error; // Re-throw the error so it can be handled by the calling component
  }
};

const calculatePrice = (startDate, endDate, pricePerDay) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return days * pricePerDay;
}; 