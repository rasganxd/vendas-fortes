
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFpXRLcnIqh_78gJYaWT2lyPkFlNJXB8Q",
  authDomain: "distribuidora-e9469.firebaseapp.com",
  projectId: "distribuidora-e9469",
  storageBucket: "distribuidora-e9469.firebasestorage.app",
  messagingSenderId: "196175852822",
  appId: "1:196175852822:web:5fa5e99e9ec786ccb58c37",
  measurementId: "G-RRNF8SXPTX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
