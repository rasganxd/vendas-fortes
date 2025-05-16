
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCnNFzlW8J-XD-nIbj67fJ7-gLZFKk8sk",
  authDomain: "app-vendas-5f84d.firebaseapp.com",
  projectId: "app-vendas-5f84d",
  storageBucket: "app-vendas-5f84d.appspot.com",
  messagingSenderId: "107546646976",
  appId: "1:107546646976:web:c64123c3b5b93d79d49e1a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
