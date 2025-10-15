import React, { createContext, useContext, useState } from 'react';
import { getDb } from '../utils/lazyFirebase';
const MyContext = createContext();

export const MyProvider = ({ children }) => {
const [inventory, setInventory] = useState([]); 
const [checkingDatabase,setCheckingDatabase]=useState(false);

  const fetchServices = async () => {
    try {
      const db = await getDb();
      const [{ collection, getDocs }] = await Promise.all([
        import('firebase/firestore'),
      ]).then(mods => [mods[0]]);
      const servicesCol = collection(db, "inventory");
      const servicesSnapshot = await getDocs(servicesCol);
      const servicesList = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("inventory list");
      console.log(servicesList);
      
      
      setInventory(servicesList);
    } catch (error) {
      console.error("Error fetching services: ", error);
    }
  };


const addCheckList = async () => {
  setCheckingDatabase(true);

  const daysOfWeek = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];

  const today = new Date();
  const todayIndex = today.getDay();
  const todayDay = daysOfWeek[todayIndex];

  // Get yesterday, today, and next two days
  const yesterdayDay = daysOfWeek[(todayIndex + 6) % 7]; // +6 instead of -1 to wrap
  const nextDay1 = daysOfWeek[(todayIndex + 1) % 7];
  const nextDay2 = daysOfWeek[(todayIndex + 2) % 7];

  const keepDays = [yesterdayDay, todayDay];

  // ❌ Delete collections for all days except yesterday and today
  const daysToDelete = daysOfWeek.filter(day => !keepDays.includes(day));
  for (const day of daysToDelete) {
    const db = await getDb();
    const [{ collection, getDocs, deleteDoc, doc }] = await Promise.all([
      import('firebase/firestore'),
    ]).then(mods => [mods[0]]);
    const dayCol = collection(db, day);
    const snapshot = await getDocs(dayCol);
    for (const docItem of snapshot.docs) {
      await deleteDoc(doc(db, day, docItem.id));
    }
  }

  console.log("Keeping:", keepDays);
  console.log("Adding data for:", [todayDay, nextDay1, nextDay2]);

  const todayDate = today.toISOString().split('T')[0];
  const [{ collection: _collection, query: _query, where: _where, getDocs: _getDocs, addDoc: _addDoc, serverTimestamp: _serverTimestamp }] = await Promise.all([
    import('firebase/firestore'),
  ]).then(mods => [mods[0]]);

  const db = await getDb();

  const targetDays = [todayDay, nextDay1, nextDay2];

  for (const day of targetDays) {
    const filteredInventory = inventory.filter(item =>
      item.checkDays && item.checkDays.includes(day)
    );

    const dayCollection = _collection(db, day);

    for (const item of filteredInventory) {
      const { id, ...rest } = item;
      const q = _query(dayCollection, _where("name", "==", item.name));
      const existingDocs = await _getDocs(q);
      if (!existingDocs.empty) {
        continue;
      }

      await _addDoc(dayCollection, {
        ...rest,
        date: todayDate,
        status: 'pending',
        createdAt: _serverTimestamp()
      });
    }
  }

  setCheckingDatabase(false);
};



  return (
    <MyContext.Provider value={{ inventory, fetchServices , addCheckList , checkingDatabase}}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  return useContext(MyContext);
};

