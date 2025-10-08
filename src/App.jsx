import React from 'react'
import HomePage from './Components/Home'
import AddInventoryItem from './Components/inventortForm'
import { MyProvider } from './Contexts/myContext'
import InventoryCategoryView from './Components/ByCategory'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './Components/Header'

function App() {
  return (
    <MyProvider>
      <Router>
        {/* Place Header outside Routes so it appears on all pages */}
        <Header />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add" element={<AddInventoryItem />} />
          <Route path="/category" element={<InventoryCategoryView />} />
        </Routes>
      </Router>
    </MyProvider>
  )
}

 

export default App



// import React, { createContext, useContext, useState } from 'react';
// import {  getDocs, query, orderBy ,serverTimestamp , collection, addDoc, getFirestore, where, deleteDoc, doc } from 'firebase/firestore';
// import { db } from '../Firebase';
// const MyContext = createContext();

// export const MyProvider = ({ children }) => {
// const [inventory, setInventory] = useState([]); 



//   const fetchServices = async () => {
//     try {
//       const servicesCol = collection(db, "inventory");
//       const servicesSnapshot = await getDocs(servicesCol);
//       const servicesList = servicesSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       console.log("inventory list");
//       console.log(servicesList);
      
      
//       setInventory(servicesList);
//     } catch (error) {
//       console.error("Error fetching services: ", error);
//     }
//   };


// const addCheckList = async () => {


// // Helper function to get the next date for a given weekday
// const getNextDateForDay = (dayName) => {
//   const daysOfWeek = [
//     'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
//   ];
//   const today = new Date();
//   const todayDayIndex = today.getDay(); // 0 (Sunday) to 6 (Saturday)
//   const targetDayIndex = daysOfWeek.indexOf(dayName.toLowerCase());

//   let daysUntil = targetDayIndex - todayDayIndex;
//   if (daysUntil < 0) {
//     daysUntil += 7; // Next week's day
//   }

//   const targetDate = new Date(today);
//   targetDate.setDate(today.getDate() + daysUntil);
//   return targetDate.toISOString().split('T')[0]; // Return date in YYYY-MM-DD format
// };
// const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// const filterByDay = (day) => {
//   return inventory
//     .filter(item => item.checkDays && item.checkDays.includes(day))
//     .map(item => ({
//       ...item,
//       checked: "no",
//       date: getNextDateForDay(day)
//     }));
// };

// const inventoryByDay = daysOfWeek.reduce((acc, day) => {
//   acc[day] = filterByDay(day);
//   return acc;
// }, {});

// // Example: access Tuesday's array
// console.log(inventoryByDay.wednesday);
// console.log(inventoryByDay);
// console.log("sorted");
// const today = new Date();
// const year = today.getFullYear();
// const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
// const day = String(today.getDate()).padStart(2, '0');

// const todayStr = `${year}-${month}-${day}`;
// console.log(todayStr);
// for (const key in inventoryByDay) {
//     const q = query(collection(db, key), where('date', '<', todayStr));
//   const querySnapshot = await getDocs(q);
//   const batchPromises = [];

//   querySnapshot.forEach((docSnap) => {
//     batchPromises.push(deleteDoc(doc(db, key, docSnap.id)));
//   });
//   await Promise.all(batchPromises);

//     for (const element of inventoryByDay[key]) {

//     try {
//     const q = query(
//       collection(db, key),
//       where('date', '==', element.date),
//       where('name', '==', element.name)
//     );

//     const querySnapshot = await getDocs(q);

//     if (!querySnapshot.empty) {
//       console.log('Document with same date and name already exists.');
//       return; // Or handle as needed
//     }

//     // If no such document exists, add new document
//     const docRef = await addDoc(collection(db, key), {
//       ...element,
//       createdAt: serverTimestamp()
//     });

//     console.log('Document written with ID: ' + docRef.id);
//   } catch (e) {
//     console.error(e);
//     alert('Error adding document.');
//   }

//     }
// }


//   };


//   return (
//     <MyContext.Provider value={{ inventory, fetchServices , addCheckList }}>
//       {children}
//     </MyContext.Provider>
//   );
// };

// export const useMyContext = () => {
//   return useContext(MyContext);
// };


