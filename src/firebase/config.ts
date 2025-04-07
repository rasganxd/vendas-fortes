
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Para um projeto real, estas chaves devem ser armazenadas em variáveis de ambiente
// mas para fins de demonstração, estamos colocando diretamente no código
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // Substitua pelo seu apiKey
  authDomain: "YOUR_AUTH_DOMAIN",      // Substitua pelo seu authDomain 
  projectId: "YOUR_PROJECT_ID",        // Substitua pelo seu projectId
  storageBucket: "YOUR_STORAGE_BUCKET", // Substitua pelo seu storageBucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Substitua pelo seu messagingSenderId
  appId: "YOUR_APP_ID"                 // Substitua pelo seu appId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
