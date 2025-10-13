import React, { useState, useEffect, useRef } from "react";
import "./Category.css"; 
// load firebase/firestore dynamically where needed to avoid bundling it into the main chunk
import { useMyContext } from "../Contexts/myContext";
// load html2canvas and jspdf dynamically inside handler to keep them out of main bundle

const categories = ['ALL','Front','Hot Servings', 'Deep fry ','Sauces', 'Breads', 'Grill and others','Confectionery','Boxes','Utensils counter','Walk in Freezer','Walk in Cooler','Drinks','Freezer-Outside']; 
const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const today = new Date();
const todayDay = daysOfWeek[today.getDay()];
const allDays = [todayDay];
    
const InventoryCheckByCategoryAndDay = () => {
  const { checkingDatabase } = useMyContext();
  const [inventory, setInventory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDay, setSelectedDay] = useState("");
  const [rotatedWeekdays, setRotatedWeekdays] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popupData, setPopupData] = useState({ visible: false, item: null });
  const [statusUpdate, setStatusUpdate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const pdfRef = useRef();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Inject responsive + PDF styles
useEffect(() => {
  const style = document.createElement("style");
  style.setAttribute("data-inventory-pdf", "true");
  style.innerHTML = `
    @media (max-width: 600px) {
      body {
        font-size: 8px;
      }
      h2, h3 {
        font-size: 13px !important;
        text-align: center;
      }
      li {
        padding: 0.75rem !important;
      }
      li > div {
        flex-direction: column !important;
        gap: 8px;
      }
      li span {
        font-size: 10px !important;
      }
      input, button {
        font-size: 10px !important;
      }
      .tab-buttons {
        flex-direction: column;
        gap: 8px;
      }
    }

    .pdf-mode {
      background: #fff !important;
      color: #000 !important;
      font-size: 8px !important;
      font-family: sans-serif !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .pdf-mode * {
      background: none !important;
      color: #000 !important;
      font-size: 8px !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
      box-shadow: none !important;
    }

    .pdf-mode li {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      gap: 5px !important;
      border-bottom: 1px solid #ccc !important;
      list-style: none !important;
      padding: 2px 0 !important;
      font-size: 8px !important;
    }

    .pdf-mode li > div {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pdf-mode button {
      font-size: 5px !important;
      padding: 1px 1px !important;
      margin: 1px !important;
      border-radius: 2px !important;
      display: inline-block !important;
    }

    .pdf-mode .tab-buttons {
      display: none !important;
    }

    .pdf-mode h2,
    .pdf-mode h3,
    .pdf-mode h4 {
      font-size: 10px !important;
      font-weight: bold;
      margin: 6px 0;
      text-align: left;
    }

    /* 👇 Scoped PDF headings by status */
    .pdf-mode .pdf-status-heading {
      font-size: 10px !important;
      font-weight: bold !important;
      margin: 6px 0 4px 0 !important;
      text-align: left !important;
    }

    .pdf-mode .pdf-status-need-immediately {
      color: #e60000 !important; /* red */
    }

    .pdf-mode .pdf-status-need-soon {
      color: #ff6600 !important; /* orange */
    }

    .pdf-mode .pdf-status-we-are-good {
      color: green !important;
    }

    .pdf-mode .pdf-status-pending {
      color: black !important;
      font-weight: normal !important;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  return () => document.head.removeChild(style);
}, []);


  const handleDownloadPDF = async () => {
    const input = pdfRef.current;
    try {
      // switch UI to grouped PDF layout
      setIsGeneratingPDF(true);
      // wait for the grouped layout to render
      await new Promise((res) => setTimeout(res, 300));

      input.classList.add("pdf-mode");
      // allow pdf-mode styles to apply
      await new Promise((res) => setTimeout(res, 100));

      // dynamically import heavy libs so they are code-split from main bundle
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf")
      ]);

      const canvas = await html2canvas(input, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("records.pdf");
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      // always restore UI
      if (input) input.classList.remove("pdf-mode");
      setIsGeneratingPDF(false);
    }
  };


  useEffect(() => {
    const todayIndex = new Date().getDay();
    const rotated = [...allDays.slice(todayIndex), ...allDays.slice(0, todayIndex)];
    setRotatedWeekdays(rotated);
    setSelectedDay(rotated[0]);
  }, []);

  useEffect(() => {
    fetchTodayInventory(selectedDay);
  }, [selectedDay]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedDay(rotatedWeekdays[0]);
    setSearchTerm("");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCheckboxChange = (item) => {
    setCurrentItem(item);
    setPopupData({ visible: true, item });
  };

  const handleClosePopup = () => {
    setPopupData({ visible: false, item: null });
  };

  const handleConfirmCheck = async (e) => {
    if (popupData.item !== "confirm") {
      setStatusUpdate(e);
      setPopupData({ visible: true, item: "confirm" });
      return;
    } else {
      e = statusUpdate;
      setPopupData({ visible: false, item: "confirm" });
      setLoading(true);
      if (currentItem) {
        try {
          const [{ collection, query, where, getDocs, deleteDoc, doc, setDoc }, { db }] = await Promise.all([
            import('firebase/firestore'),
            import('../Firebase')
          ]);

          const collectionRef = collection(db, selectedDay);
          const q = query(
            collectionRef,
            where('date', '==', currentItem.date),
            where('name', '==', currentItem.name)
          );
          const querySnapshot = await getDocs(q);
          const deletePromises = [];
          querySnapshot.forEach((docSnap) => {
            deletePromises.push(deleteDoc(doc(db, selectedDay, docSnap.id)));
          });
          await Promise.all(deletePromises);
          await setDoc(doc(collectionRef), { ...currentItem, status: e });
          fetchTodayInventory(selectedDay);
        } catch (error) {
          console.error("Error updating check status: ", error);
        }
      }
      setLoading(false);
      setCurrentItem(null);
    }
  };

  const fetchTodayInventory = async (day) => {
    setLoading(true);
    try {
      const [{ collection, getDocs }, { db }] = await Promise.all([
        import('firebase/firestore'),
        import('../Firebase')
      ]);

      const inventoryToday = collection(db, day);
      const inventorySnapshot = await getDocs(inventoryToday);
      const inventoryList = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort inventoryList by category order
      const categoryOrder = [
        'Front',
        'Hot Servings',
        'Deep fry ',
        'Sauces',
        'Breads',
        'Grill and others',
        'Confectionery',
        'Boxes',
        'Utensils counter',
        'Walk in Freezer',
        'Walk in Cooler',
        'Drinks',
        'Freezer-Outside'
      ];
      inventoryList.sort((a, b) => {
        const idxA = categoryOrder.findIndex(cat => cat.toLowerCase() === (a.category || '').toLowerCase());
        const idxB = categoryOrder.findIndex(cat => cat.toLowerCase() === (b.category || '').toLowerCase());
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      });
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

  filteredItems.sort((a, b) => {
    const order = {
      "pending": 0,
      "Need Immediately": 1,
      "Need Soon": 2,
      "We are Good": 3,
    };
    const priorityA = order[a.status] !== undefined ? order[a.status] : 99;
    const priorityB = order[b.status] !== undefined ? order[b.status] : 99;
    return priorityA - priorityB;
  });

  const searchedItems = filteredItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // group items by status for the PDF layout
  const itemsByStatus = {
    "Need Immediately": [],
    "Need Soon": [],
    "We are Good": [],
    pending: [],
  };

  searchedItems.forEach((it) => {
    const key = it.status && itemsByStatus[it.status] ? it.status : "pending";
    itemsByStatus[key].push(it);
  });

  return (
    <div className="fullscreen-wrapper">
      <div className="category-page">
        <h1 className="title">Inventory Checkup</h1>

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

        <div className="search-container">
          <input
            type="text"
            placeholder="Search by item name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

      <div ref={pdfRef}>
          <div className="today-date">
            <strong>
              {todayDay.charAt(0).toUpperCase() + todayDay.slice(1)}, {today.toLocaleDateString()}
            </strong>
          </div>

          {loading || checkingDatabase ? (
            <div className="spinner-container">
              <div className="loading-spinner-large"></div>
            </div>
          ) : isGeneratingPDF ? (
            // Grouped layout for PDF generation
            <>
              {selectedCategory && searchedItems.length === 0 ? (
                <p>
                  No items matching <strong>{searchTerm}</strong> in{" "}
                  <strong>{selectedCategory}</strong> for <strong>{selectedDay}</strong>.
                </p>
              ) : (
                <>
                  <div className="pdf-status-group">
                    {/* Need Immediately */}
                    {itemsByStatus["Need Immediately"].length > 0 && (
                      <>
                        <h2 className="pdf-status-heading pdf-status-need-immediately">
                          Need those items immediately:
                        </h2>
                        <ul>
                          {itemsByStatus["Need Immediately"].map((item) => (
                            <li key={item.id}>{item.name}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* Need Soon */}
                    {itemsByStatus["Need Soon"].length > 0 && (
                      <>
                        <h2 className="pdf-status-heading pdf-status-need-soon">
                          Need those items sooner:
                        </h2>
                        <ul>
                          {itemsByStatus["Need Soon"].map((item) => (
                            <li key={item.id}>{item.name}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* We are Good */}
                    {itemsByStatus["We are Good"].length > 0 && (
                      <>
                        <h2 className="pdf-status-heading pdf-status-we-are-good">
                          We are good with those items:
                        </h2>
                        <ul>
                          {itemsByStatus["We are Good"].map((item) => (
                            <li key={item.id}>{item.name}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {/* Pending */}
                    {itemsByStatus["pending"].length > 0 && (
                      <>
                        <h2 className="pdf-status-heading pdf-status-pending">
                          Didn't check those items in inventory:
                        </h2>
                        <ul>
                          {itemsByStatus["pending"].map((item) => (
                            <li key={item.id}>{item.name}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <div
              className="card-container"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(1, 1fr)",
                gap: "1rem",
              }}
            >
              {selectedCategory && searchedItems.length === 0 ? (
                <p>
                  No items matching <strong>{searchTerm}</strong> in{" "}
                  <strong>{selectedCategory}</strong> for <strong>{selectedDay}</strong>.
                </p>
              ) : (
                searchedItems.map((item) => {
                  let statusClass = "";
                  switch (item.status) {
                    case "pending": statusClass = "pending"; break;
                    case "Need Immediately": statusClass = "danger"; break;
                    case "Need Soon": statusClass = "warning"; break;
                    case "We are Good": statusClass = "success"; break;
                  }
                  return (
                    <div
                      className={`card ${statusClass}`}
                      key={item.id}
                      onClick={() => handleCheckboxChange(item)}
                      style={{
                        minWidth: 0,
                        wordBreak: "break-word",
                      }}
                    >
                      <h2 className="card-title">{item.name}</h2>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {popupData.visible && (
            <div className="popup-overlay" onMouseLeave={handleClosePopup}>
              <div className="popup">
                <div className="close-button" onClick={handleClosePopup}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>

                {popupData.item === "confirm" ? (
                  <>
                    <p>
                      Are you sure you want to update status of{" "}
                      <strong>{currentItem?.name || "this item"}</strong>?
                    </p>
                    <div className="popup-buttons">
                      <button className="popup-btn success" onClick={() => handleConfirmCheck()}>
                        Yes
                      </button>
                      <button className="popup-btn danger" onClick={() => setPopupData((prev) => ({ ...prev, item: null }))}>
                        No
                      </button>
                    </div>
                  </>
                ) : popupData.item && typeof popupData.item === "object" ? (
                  <>
                    <p>Mark <strong>{popupData.item.name}</strong> as</p>
                    <div className="popup-buttons">
                      <button className="popup-btn danger" onClick={() => handleConfirmCheck("Need Immediately")}>Need Immediately</button>
                      <button className="popup-btn warning" onClick={() => handleConfirmCheck("Need Soon")}>Need Soon</button>
                      <button className="popup-btn success" onClick={() => handleConfirmCheck("We are Good")}>We are Good</button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* PDF Download Button */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
          {searchedItems.length > 0 && (
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              style={{
                padding: "0.7rem 1.4rem",
                background: isGeneratingPDF ? "#a77b5a" : "#8B4513",
                color: "white",
                fontWeight: "bold",
                border: "none",
                borderRadius: "6px",
                cursor: isGeneratingPDF ? "default" : "pointer",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {isGeneratingPDF ? (
                <>
                  <div className="small-spinner" style={{width:16,height:16,border:"2px solid rgba(255,255,255,0.6)",borderTop:"2px solid white",borderRadius:"50%",animation:"spin 1s linear infinite"}} />
                  Generating...
                </>
              ) : (
                "Download PDF"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryCheckByCategoryAndDay;
