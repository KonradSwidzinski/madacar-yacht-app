import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace these with your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBKayeVHYYqsjbTKtg_0K0f41VLzIBnvdY",
    authDomain: "madacar-yacht-charter.firebaseapp.com",
    projectId: "madacar-yacht-charter",
    storageBucket: "madacar-yacht-charter.firebasestorage.app",
    messagingSenderId: "1040480934653",
    appId: "1:1040480934653:web:cdc622cfe29b6fd8923c94",
    measurementId: "G-83X7VYRPV2"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 