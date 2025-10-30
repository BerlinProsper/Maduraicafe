import React, { createContext, useContext, useState } from 'react';
import { getDb } from '../utils/lazyFirebase';
const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [checkingDatabase, setCheckingDatabase] = useState(false);

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
        ...doc.data(),
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
      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
    ];

    const today = new Date();
    const todayIndex = today.getDay();
    const todayDay = daysOfWeek[todayIndex];

    const nextDay1 = daysOfWeek[(todayIndex + 1) % 7];
    const nextDay2 = daysOfWeek[(todayIndex + 2) % 7];
    const deleteDay1 = daysOfWeek[(todayIndex + 3) % 7];
    const deleteDay2 = daysOfWeek[(todayIndex + 4) % 7];

    const keepDays = [todayDay, nextDay1, nextDay2];
    const deleteDays = [deleteDay1, deleteDay2];

    const db = await getDb();
    const [
      { collection, getDocs, deleteDoc, doc, query, where, addDoc, serverTimestamp },
    ] = await Promise.all([import('firebase/firestore')]).then(mods => [mods[0]]);

    // ❌ Delete only specific future days (day+3, day+4)
    for (const day of deleteDays) {
      const dayCol = collection(db, day);
      const snapshot = await getDocs(dayCol);
      for (const docItem of snapshot.docs) {
        await deleteDoc(doc(db, day, docItem.id));
      }
    }

    // 🕓 Delete any document older than 5 days in ALL day collections
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    for (const day of daysOfWeek) {
      const dayCol = collection(db, day);
      const snapshot = await getDocs(dayCol);
      for (const docItem of snapshot.docs) {
        const data = docItem.data();
        const timestamp = data.createdAt?.toDate?.() || data.timestamp?.toDate?.();
        if (timestamp && timestamp < fiveDaysAgo) {
          console.log(`Deleting old doc in ${day}: ${docItem.id}`);
          await deleteDoc(doc(db, day, docItem.id));
        }
      }
    }

    console.log("Keeping:", keepDays);
    console.log("Deleting:", deleteDays);

    const todayDate = today.toISOString().split('T')[0];
    const targetDays = [todayDay, nextDay1, nextDay2];

    // ✅ Add data to today, tomorrow, and day after
    for (const day of targetDays) {
      const filteredInventory = inventory.filter(
        item => item.checkDays && item.checkDays.includes(day)
      );

      const dayCollection = collection(db, day);

      for (const item of filteredInventory) {
        const { id, ...rest } = item;
        const q = query(dayCollection, where("name", "==", item.name));
        const existingDocs = await getDocs(q);
        if (!existingDocs.empty) continue;

        await addDoc(dayCollection, {
          ...rest,
          date: todayDate,
          status: 'pending',
          createdAt: serverTimestamp(),
        });
      }
    }

    setCheckingDatabase(false);
  };

  return (
    <MyContext.Provider
      value={{
        inventory,
        fetchServices,
        addCheckList,
        checkingDatabase,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  return useContext(MyContext);
};
