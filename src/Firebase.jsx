import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyByogNzbGuYOBOzN4a8xkJ2DjoY4lriUoI",
  authDomain: "barbershop-58368.firebaseapp.com",
  projectId: "barbershop-58368",
  storageBucket: "barbershop-58368.firebasestorage.app",
  messagingSenderId: "385585091708",
  appId: "1:385585091708:web:7024d8a894c9c52972e5f9"
};
const app = initializeApp(firebaseConfig);
// Get Firestore instance
const db = getFirestore(app);

export { db };