import React from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="fullscreen-wrapper">
      <div className="homepage-container">
        <h1 className="title">Madhurai Cafe</h1>
        <div className="card-container">
          <div className="card" onClick={() => navigate('/add')}>
            <h4>Add Item to Inventory</h4>
          </div>

          <div className="card" onClick={() => navigate('/category')}>
            <h4>View by Category</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;