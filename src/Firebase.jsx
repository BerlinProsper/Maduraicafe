import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyATzJcuaUmfCVLIepdgUpYTlCkoSc0bLvk",
  authDomain: "madurai-cafe.firebaseapp.com",
  projectId: "madurai-cafe",
  storageBucket: "madurai-cafe.firebasestorage.app",
  messagingSenderId: "105593114345",
  appId: "1:105593114345:web:4a4a49c9a19b8a1547ea78"
};

const app = initializeApp(firebaseConfig);
// Get Firestore instance
const db = getFirestore(app);

export { db };