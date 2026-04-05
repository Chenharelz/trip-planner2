import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import './ItineraryPage.css';

const generateDays = (start, end) => {
  const days = [];
  const curr = new Date(start);
  const finish = new Date(end);
  
  while (curr <= finish) {
    days.push({
      date: curr.toISOString().split('T')[0],
      startLocation: '',
      endLocation: '',
      plans: '',
      attractions: '',
      comments: ''
    });
    curr.setDate(curr.getDate() + 1);
  }
  return days;
};

const getPaddingDays = (startDateStr) => {
  const startDay = new Date(startDateStr).getDay(); // 0 is Sunday
  return Array(startDay).fill(null);
};

export default function ItineraryPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  
  const [trips, setTrips] = useState([]);
  const [tripIndex, setTripIndex] = useState(-1);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayFormData, setDayFormData] = useState({});

  useEffect(() => {
    const savedTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    const index = savedTrips.findIndex(t => t.id === parseInt(tripId));
    
    if (index >= 0) {
      const currentTrip = savedTrips[index];
      if (!currentTrip.itinerary || currentTrip.itinerary.length === 0) {
        currentTrip.itinerary = generateDays(currentTrip.startDate, currentTrip.endDate);
        savedTrips[index] = currentTrip;
        localStorage.setItem('trips', JSON.stringify(savedTrips));
      } else {
        // Migration logic for old schema
        const updatedItinerary = currentTrip.itinerary.map(day => ({
          ...day,
          startLocation: day.startLocation || '',
          endLocation: day.endLocation || '',
          plans: day.plans || '',
          attractions: day.attractions || '',
          comments: day.comments || ''
        }));
        currentTrip.itinerary = updatedItinerary;
      }
      setTrips(savedTrips);
      setTripIndex(index);
    }
  }, [tripId]);

  const trip = tripIndex >= 0 ? trips[tripIndex] : null;

  const saveTrips = (updatedTrips) => {
    setTrips(updatedTrips);
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
  };

  const openDayModal = (dayIndex) => {
    setSelectedDay(dayIndex);
    setDayFormData({ ...trip.itinerary[dayIndex] });
  };

  const handleDaySave = () => {
    const updatedTrips = [...trips];
    updatedTrips[tripIndex].itinerary[selectedDay] = dayFormData;
    saveTrips(updatedTrips);
    setSelectedDay(null);
  };

  if (!trip) {
    return (
      <div className="itinerary-wrapper">
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Trip not found...</h2>
          <button className="back-btn" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
            <FaArrowLeft /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  const paddingDays = getPaddingDays(trip.startDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate location summary
  const locationCounts = trip.itinerary.reduce((acc, day) => {
    const loc = day.endLocation?.trim();
    if (loc) {
      acc[loc] = (acc[loc] || 0) + 1;
    }
    return acc;
  }, {});
  
  const locationSummary = Object.entries(locationCounts);

  return (
    <div className="itinerary-wrapper calendar-mode">
      <div className="itinerary-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FaArrowLeft /> Back
        </button>
        <div className="header-info">
          <h1 className="hero-title">{trip.destination} Itinerary</h1>
          <p className="hero-subtitle">
            {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="calendar-container glass-panel">
        <div className="calendar-grid">
          {/* Weekday Headers */}
          {weekDays.map(wd => (
            <div key={wd} className="weekday-header">{wd}</div>
          ))}
          
          {/* Padding tiles for offset */}
          {paddingDays.map((_, i) => (
            <div key={`pad-${i}`} className="calendar-tile empty"></div>
          ))}
          
          {/* Actual trip days */}
          {trip.itinerary.map((day, dIndex) => {
            const dateObj = new Date(day.date);
            const isToday = false; 

            return (
              <motion.div 
                key={day.date} 
                className="calendar-tile active"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openDayModal(dIndex)}
              >
                <div className="tile-date">{dateObj.getDate()}</div>
                <div className="tile-locations">
                  {day.startLocation && (
                    <div className="loc start">
                      <FaMapMarkerAlt className="loc-icon" /> {day.startLocation} (Start)
                    </div>
                  )}
                  {day.endLocation && (
                    <div className="loc end">
                      <FaMapMarkerAlt className="loc-icon" /> {day.endLocation} (End)
                    </div>
                  )}
                  {(!day.startLocation && !day.endLocation) && (
                    <div className="loc empty">No locations set</div>
                  )}
                </div>
                {(day.plans || day.attractions) && <div className="has-plans-indicator" />}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Location Summary Footer */}
      <div className="summary-footer glass-panel">
        <h3>Trip Summary</h3>
        {locationSummary.length > 0 ? (
          <div className="summary-chips">
            {locationSummary.map(([loc, count], idx) => (
              <div key={idx} className="summary-chip">
                <strong>{loc}:</strong> {count} {count === 1 ? 'day' : 'days'}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-summary">Set your "End Location" for the dates to see your summary.</p>
        )}
      </div>

      {/* Day Edit Modal */}
      <AnimatePresence>
        {selectedDay !== null && (
          <motion.div 
            className="modal-overlay day-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="glass-panel day-modal-content"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button className="close-modal-btn" onClick={() => setSelectedDay(null)}>
                <FaTimes />
              </button>
              
              <h2>{new Date(dayFormData.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric'})}</h2>
              
              <div className="day-form">
                <div className="form-group row">
                  <div className="input-field">
                    <label>Start of day location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Tokyo" 
                      value={dayFormData.startLocation}
                      onChange={(e) => setDayFormData({...dayFormData, startLocation: e.target.value})}
                    />
                  </div>
                  <div className="input-field">
                    <label>End of day location</label>
                    <input 
                      type="text" 
                      placeholder="Where do you sleep?" 
                      value={dayFormData.endLocation}
                      onChange={(e) => setDayFormData({...dayFormData, endLocation: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Plans for the day</label>
                  <textarea 
                    rows="3" 
                    placeholder="General overview of your plans..."
                    value={dayFormData.plans}
                    onChange={(e) => setDayFormData({...dayFormData, plans: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Attractions</label>
                  <textarea 
                    rows="2" 
                    placeholder="Museums, parks, restaurants..."
                    value={dayFormData.attractions}
                    onChange={(e) => setDayFormData({...dayFormData, attractions: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Comments / Notes</label>
                  <textarea 
                    rows="2" 
                    placeholder="Don't forget train tickets..."
                    value={dayFormData.comments}
                    onChange={(e) => setDayFormData({...dayFormData, comments: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setSelectedDay(null)}>Cancel</button>
                <button className="save-day-btn" onClick={handleDaySave}>Save Day</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
