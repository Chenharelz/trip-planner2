import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlane, FaCalendarAlt, FaUserFriends, FaWallet, FaArrowRight } from 'react-icons/fa';
import './LandingPage.css';

const questions = [
  {
    id: 'destination',
    title: 'Where do you want to go?',
    icon: <FaPlane />,
    type: 'text',
    placeholder: 'e.g. Tokyo, Japan'
  },
  {
    id: 'dates',
    title: 'When are you going?',
    icon: <FaCalendarAlt />,
    type: 'dateRange',
  },
  {
    id: 'companions',
    title: 'Who is traveling?',
    icon: <FaUserFriends />,
    type: 'options',
    options: ['Solo', 'Couple', 'Family', 'Friends']
  },
  {
    id: 'style',
    title: 'What is your travel style?',
    icon: <FaWallet />,
    type: 'options',
    options: ['Budget', 'Comfort', 'Luxury']
  }
];

export default function LandingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    companions: '',
    style: ''
  });
  
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Save data to list of trips and navigate to home
      const newTrip = { id: Date.now(), ...formData };
      const existingTrips = JSON.parse(localStorage.getItem('trips') || '[]');
      localStorage.setItem('trips', JSON.stringify([...existingTrips, newTrip]));
      navigate('/');
    }
  };

  const currentQ = questions[currentStep];

  const canProceed = () => {
    if (currentQ.id === 'destination') return formData.destination.length > 2;
    if (currentQ.id === 'dates') return formData.startDate && formData.endDate;
    if (currentQ.id === 'companions') return formData.companions !== '';
    if (currentQ.id === 'style') return formData.style !== '';
    return true;
  };

  return (
    <div className="landing-wrapper">
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="hero-title">Plan Your Ultimate Trip</h1>
        <p className="hero-subtitle">Let the journey begin with a few simple questions.</p>
      </motion.div>

      <motion.div 
        className="glass-panel form-panel"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="question-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              className="question-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="question-header">
                <span className="question-icon">{currentQ.icon}</span>
                <h2>{currentQ.title}</h2>
              </div>

              <div className="input-area">
                {currentQ.type === 'text' && (
                  <input
                    type="text"
                    className="styled-input"
                    placeholder={currentQ.placeholder}
                    value={formData[currentQ.id]}
                    onChange={(e) => setFormData({ ...formData, [currentQ.id]: e.target.value })}
                    onKeyDown={(e) => { if(e.key === 'Enter' && canProceed()) handleNext() }}
                    autoFocus
                  />
                )}

                {currentQ.type === 'dateRange' && (
                  <div className="date-inputs">
                    <div className="date-field">
                      <label>From</label>
                      <input
                        type="date"
                        className="styled-input"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="date-field">
                      <label>To</label>
                      <input
                        type="date"
                        className="styled-input"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {currentQ.type === 'options' && (
                  <div className="options-grid">
                    {currentQ.options.map(opt => (
                      <button
                        key={opt}
                        className={`option-btn ${formData[currentQ.id] === opt ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, [currentQ.id]: opt })}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="navigation-buttons">
                {currentStep > 0 && (
                  <button className="back-btn" onClick={() => setCurrentStep(prev => prev - 1)}>
                    Back
                  </button>
                )}
                <button 
                  className={`next-btn ${!canProceed() ? 'disabled' : ''}`}
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  {currentStep === questions.length - 1 ? 'Finish & Build' : 'Next'} <FaArrowRight />
                </button>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
