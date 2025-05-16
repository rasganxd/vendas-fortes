
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXOTxAAHHBEO00KmpKMego6Hje4YRBug4",
  authDomain: "salestrack-679ef.firebaseapp.com",
  projectId: "salestrack-679ef",
  storageBucket: "salestrack-679ef.firebasestorage.app",
  messagingSenderId: "50223623576",
  appId: "1:50223623576:web:186cffc7afe676c428cfed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
