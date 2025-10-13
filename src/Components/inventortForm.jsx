import React, { useState, useEffect } from 'react';
import { getDb } from '../utils/lazyFirebase';

const categories = ['Front','Hot Servings', 'Deep fry -1','Sauces-2', 'Breads', 'Grill and others','Confectionery','Boxes','Utensils counter','Walk in Freezer','Walk in Cooler','Drinks','Freezer-Outside']; 
const frequencies = ['daily','selected days'];
const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function AddInventoryItem() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'ingredient',
    checkFrequency: 'daily',
    lastChecked: new Date().toISOString(),
    isAvailable: false,
    checkDays: weekDays, // daily by default
  });

  // ⏲️ Watch frequency changes
  useEffect(() => {
    if (formData.checkFrequency === 'daily') {
      setFormData(prev => ({
        ...prev,
        checkDays: weekDays,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        checkDays: [],
      }));
    }
  }, [formData.checkFrequency]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'checkDays') {
      let updatedCheckDays = [...formData.checkDays];
      if (checked) {
        updatedCheckDays.push(value);
      } else {
        updatedCheckDays = updatedCheckDays.filter(day => day !== value);
      }
      setFormData(prev => ({ ...prev, checkDays: updatedCheckDays }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSave = {
      ...formData,
      lastChecked: new Date().toISOString(),
    };

    try {
      const db = await getDb();
      const [{ collection, addDoc, serverTimestamp }] = await Promise.all([
        import('firebase/firestore'),
      ]).then(mods => [mods[0]]);

      const docRef = await addDoc(collection(db, "inventory"), {
        ...dataToSave,
        createdAt: serverTimestamp()
      });
setFormData({
        name: '',
        category: 'ingredient',
        checkFrequency: 'daily',
        lastChecked: new Date().toISOString(),
        isAvailable: false,
        checkDays: weekDays,
      });
      alert("Item added successfully!");
    } catch (e) {
      console.error(e);
      alert("Error adding document.");
    }
  };

  return (
    <div style={styles.fullscreenWrapper}>
      <div style={styles.homepageContainer}>
        <h4 style={styles.title}>Add Inventory Item</h4>
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Name */}
          <label style={styles.label}>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Milk"
              style={styles.input}
            />
          </label>

          {/* Category */}
          <label style={styles.label}>
            Category:
            <select name="category" value={formData.category} onChange={handleChange} style={styles.input}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </label>

          {/* Frequency */}
          <label style={styles.label}>
            Check Frequency:
            <select name="checkFrequency" value={formData.checkFrequency} onChange={handleChange} style={styles.input}>
              {frequencies.map(freq => (
                <option key={freq} value={freq}>{freq}</option>
              ))}
            </select>
          </label>

          {/* Check Days */}
          <fieldset style={styles.fieldset}>
            {formData.checkFrequency !== 'daily' && (
              <legend style={styles.legend}>Select days</legend>
            )}
            <div style={styles.checkboxContainer}>
              {weekDays.map(day => (
                <label key={day} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="checkDays"
                    value={day}
                    checked={formData.checkDays.includes(day)}
                    onChange={handleChange}
                    disabled={formData.checkFrequency === 'daily'}
                  />{" "}
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Submit Button */}
          <button type="submit" style={styles.button}>Submit</button>
        </form>
      </div>
    </div>
  );
}

// 🎨 Styles
const styles = {
  // Your existing styles
  container: {
    maxWidth: '550px',
    margin: '3rem auto',
    padding: '2rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    color: '#333',
  },
  header: {
    textAlign: 'center',
    color: '#4a4031',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: '600',
    color: '#3e3e3e',
  },
  input: {
    padding: '0.6rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginTop: '0.5rem',
    fontSize: '1rem',
  },
  fieldset: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
  },
  legend: {
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#5c4a1d',
  },
  checkboxContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  checkboxLabel: {
    fontSize: '0.95rem',
    textTransform: 'capitalize',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  button: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f0b90c',
    color: '#5c4a1d',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },

  // New styles added from your CSS
  fullscreenWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh', // full viewport height
    width: '100vw',  // full viewport width
    boxSizing: 'border-box',
    backgroundColor: '#F5D8A0', // optional: light neutral background
  },
  homepageContainer: {
    textAlign: 'center',
    fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    padding: '2rem',
    maxWidth: '90%',
  },
  title: {
    color: '#633B11',
    fontSize: '1.5rem',
    fontWeight: 300,
    marginBottom: '1rem',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
    maxWidth: '600px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#E7B253',
    color: '#fff',
    padding: '1.2rem',
    borderRadius: '12px',
    width: '140px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, background-color 0.3s, box-shadow 0.3s',
    boxShadow: '0 4px 8px rgba(76, 125, 126, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHover: {
    transform: 'translateY(-4px) scale(1.02)',
    backgroundColor: '#E5B635',
    boxShadow: '0 6px 12px rgba(76, 125, 126, 0.3)',
  },
  cardTitle: {
    margin: 0,
    fontSize: '0.8rem',
    letterSpacing: '0.8px',
    color: '#fff',
    textAlign: 'center',
  },
};