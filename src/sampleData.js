import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

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