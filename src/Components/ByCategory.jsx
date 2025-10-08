import React, { useState, useEffect } from "react";
import { useMyContext } from "../Contexts/myContext";
import "./Category.css";
import { db } from '../Firebase';
import { collection, query, where, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

const categories = ["ALL", "ingredient", "utensil", "food", "beverage"];
const allDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const InventoryCheckByCategoryAndDay = () => {
  const [inventory, setInventory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [rotatedWeekdays, setRotatedWeekdays] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popupData, setPopupData] = useState({ visible: false, item: null });

  // Rotate weekdays based on today
  useEffect(() => {
    const todayIndex = new Date().getDay(); // 0 = Sunday
    const rotated = [...allDays.slice(todayIndex), ...allDays.slice(0, todayIndex)];
    setRotatedWeekdays(rotated);
    setSelectedDay(rotated[0]); // Default: today
  }, []);

 

  // Fetch inventory for selected day
  useEffect(() => {
    fetchTodayInventory(selectedDay);
  }, [selectedDay]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setSelectedDay(rotatedWeekdays[0]); // Reset to today when category changes
  };

  const handleCheckboxChange = (item) => {
    setCurrentItem(item);
    setPopupData({ visible: true, item });
  };

  const handleClosePopup = () => {
    setPopupData({ visible: false, item: null });
  };

  const handleConfirmCheck = async () => {
    setPopupData({ visible: false, item: null });
    setLoading(true);
    if (currentItem) {
      try {
        const collectionRef = collection(db, selectedDay);
        const q = query(
          collectionRef,
          where('date', '==', currentItem.date),
          where('name', '==', currentItem.name)
        );
        const querySnapshot = await getDocs(q);
try{
        // Delete existing matching docs
        const deletePromises = [];
        querySnapshot.forEach((docSnap) => {
          deletePromises.push(deleteDoc(doc(db, selectedDay, docSnap.id)));
        });
        await Promise.all(deletePromises);
      }catch(err){
        alert("Error deleting existing docs: ", err);
      }
        // Add new checked doc
        await setDoc(doc(collectionRef), { ...currentItem, checked: "yes" });
        fetchTodayInventory(selectedDay);
      } catch (error) {
        console.error("Error updating check status: ", error);
      }
    }
    setLoading(false);
    setCurrentItem(null);
  };



  const fetchTodayInventory = async (day) => {
    setLoading(true);
    try {
      const inventoryToday = collection(db, day);
      const inventorySnapshot = await getDocs(inventoryToday);
      const inventoryList = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInventory(inventoryList);
    } catch (error) {
      console.error("Error fetching services: ", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = inventory.filter((item) => {
    const matchesCategory =
      selectedCategory === "ALL" || item.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesDay = item.checkDays && item.checkDays.includes(selectedDay);
    return matchesCategory && matchesDay;
  });

  // Sort items: unchecked ("no") first, checked ("yes") last
  const sortedItems = filteredItems.slice().sort((a, b) => {
    if (a.checked === b.checked) return 0;
    if (a.checked === "no") return -1; // no items first
    if (b.checked === "no") return 1;  // yes items last
    return 0;
  });

  return (
    <div className="fullscreen-wrapper">
      <div className="category-page">
        <h1 className="title">Inventory Schedule</h1>

        <div className="custom-dropdown">
          <select
            className="styled-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">-- Choose a Category --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {selectedCategory && (
          <>
  <div className="schedule-container">
  <div className="schedule-label">
  </div>
  
  <div className="day-labels">
    {rotatedWeekdays.map((day) => (
  <span
    key={day}
    className={`day-label ${day === selectedDay ? "active" : ""}`}
    onClick={() => setSelectedDay(day)}
  >
    {day.substring(0, 3).toUpperCase()}
  </span>
))}
  </div>
</div>
          </>
        )}

        {loading ? (
          // Show a big spinner centered
          <div className="spinner-container">
            <div className="loading-spinner-large"></div>
          </div>
        ) : (
          // Show sorted cards
          <div className="card-container">
            {selectedCategory && sortedItems.length === 0 ? (
              <p>
                No items in <strong>{selectedCategory}</strong> to be Checked for{" "}
                <strong>{selectedDay}</strong>.
              </p>
            ) : (
              sortedItems.map((item) => (
                <div
                  className={`card ${item.checked === "yes" ? "checked" : "not-checked"}`}
                  key={item.id}
                  onClick={() => handleCheckboxChange(item)}
                >
                  <h2 className="card-title">{item.name}</h2>
                </div>
              ))
            )}
          </div>
        )}

        {/* Popup for confirmation */}
        {popupData.visible && popupData.item && (
          <div className="popup-overlay" onMouseEnter={() => {}} onMouseLeave={handleClosePopup}>
            <div className="popup" onMouseEnter={() => {}} onMouseLeave={handleClosePopup}>
              <p>Mark {popupData.item.name} as checked?</p>
              <button onClick={handleConfirmCheck}>Yes</button>
              <button onClick={handleClosePopup}>No</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryCheckByCategoryAndDay;

/* Make sure you add these styles to your CSS for the spinner: */
/*
.loading-spinner-large {
  border: 6px solid #f3f3f3; 
  border-top: 6px solid #333; 
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px; // or your desired height
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
*/