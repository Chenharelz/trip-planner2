import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaPlane, FaCalendarAlt, FaUserFriends, FaTrash, FaImage } from 'react-icons/fa';
import './HomePage.css';

export default function HomePage() {
  const [trips, setTrips] = useState([]);
  const [tripToDelete, setTripToDelete] = useState(null);
  const fileInputRef = useRef(null);
  const [activeUploadId, setActiveUploadId] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const savedTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    setTrips(savedTrips);
  }, []);

  const saveTrips = (updatedTrips) => {
    setTrips(updatedTrips);
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
  };

  const confirmDelete = () => {
    if (tripToDelete) {
      const updatedTrips = trips.filter(t => t.id !== tripToDelete.id);
      saveTrips(updatedTrips);
      setTripToDelete(null);
    }
  };

  const handleImageUploadClick = (e, tripId) => {
    e.stopPropagation();
    setActiveUploadId(tripId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && activeUploadId) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 1200;
          
          if (width > height && width > max_size) {
            height *= max_size / width;
            width = max_size;
          } else if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          const updatedTrips = trips.map(t => 
            t.id === activeUploadId ? { ...t, bannerImage: dataUrl } : t
          );
          saveTrips(updatedTrips);
          setActiveUploadId(null);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
    // reset input
    e.target.value = null;
  };

  return (
    <div className="home-wrapper">
      <motion.div 
        className="home-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="hero-title">Your Planned Journeys</h1>
        <p className="hero-subtitle">Manage your open trips or start a new adventure.</p>
      </motion.div>

      <motion.div 
        className="trips-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Create New Trip Card */}
        <motion.div 
          className="glass-panel trip-card create-card"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/new-trip')}
        >
          <div className="create-icon">
            <FaPlus />
          </div>
          <h3>Start New Trip</h3>
          <p>Plan your next great adventure</p>
        </motion.div>

        {/* Existing Trips */}
        {trips.map((trip, index) => (
          <motion.div 
            key={trip.id}
            className="glass-panel trip-card existing-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
          >
            <div 
              className="card-banner"
              style={trip.bannerImage ? { backgroundImage: `url(${trip.bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              {!trip.bannerImage && <FaPlane className="banner-icon" />}
              
              <div className="banner-actions">
                <button 
                  className="icon-btn image-btn" 
                  onClick={(e) => handleImageUploadClick(e, trip.id)}
                  title="Upload Banner"
                >
                  <FaImage />
                </button>
                <button 
                  className="icon-btn trash-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setTripToDelete(trip);
                  }}
                  title="Delete Trip"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="card-content">
              <h3>{trip.destination || 'Unknown Destination'}</h3>
              <div className="card-detail">
                <FaCalendarAlt className="detail-icon" />
                <span>{trip.startDate} - {trip.endDate}</span>
              </div>
              <div className="card-detail">
                <FaUserFriends className="detail-icon" />
                <span>{trip.companions} • {trip.style}</span>
              </div>
              <button 
                className="view-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/itinerary/${trip.id}`);
                }}
              >
                View Itinerary
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
      />

      {/* Custom Delete Modal */}
      <AnimatePresence>
        {tripToDelete && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="glass-panel modal-content"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2>Delete Trip</h2>
              <p>Are you sure you want to delete your trip to <strong>{tripToDelete.destination}</strong>?</p>
              <p className="modal-warning">This action cannot be undone and will permanently erase your itinerary.</p>
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setTripToDelete(null)}>
                  Cancel
                </button>
                <button className="delete-confirm-btn" onClick={confirmDelete}>
                  Yes, Delete It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
