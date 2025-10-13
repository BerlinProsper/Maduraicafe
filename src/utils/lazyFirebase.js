// Lazy Firebase initializer to avoid bundling firebase into the main chunk
let cachedDb = null;
let initializing = null;

export async function getDb() {
  if (cachedDb) return cachedDb;
  if (initializing) return initializing;

  initializing = (async () => {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');

    const firebaseConfig = {
      apiKey: "AIzaSyByogNzbGuYOBOzN4a8xkJ2DjoY4lriUoI",
      authDomain: "barbershop-58368.firebaseapp.com",
      projectId: "barbershop-58368",
      storageBucket: "barbershop-58368.firebasestorage.app",
      messagingSenderId: "385585091708",
      appId: "1:385585091708:web:7024d8a894c9c52972e5f9"
    };

    const app = initializeApp(firebaseConfig);
    cachedDb = getFirestore(app);
    return cachedDb;
  })();

  return initializing;
}
