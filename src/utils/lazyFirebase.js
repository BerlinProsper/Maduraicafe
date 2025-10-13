// Lazy Firebase initializer to avoid bundling firebase into the main chunk
let cachedDb = null;
let initializing = null;

export async function getDb() {
  if (cachedDb) return cachedDb;
  if (initializing) return initializing;

  initializing = (async () => {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATzJcuaUmfCVLIepdgUpYTlCkoSc0bLvk",
  authDomain: "madurai-cafe.firebaseapp.com",
  projectId: "madurai-cafe",
  storageBucket: "madurai-cafe.firebasestorage.app",
  messagingSenderId: "105593114345",
  appId: "1:105593114345:web:4a4a49c9a19b8a1547ea78"
};



    /////////
    const app = initializeApp(firebaseConfig);
    cachedDb = getFirestore(app);
    return cachedDb;
  })();

  return initializing;
}
