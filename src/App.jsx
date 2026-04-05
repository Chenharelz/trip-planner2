import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ItineraryPage from './pages/ItineraryPage';
import './App.css';

function App() {
  return (
    <Router basename="/trip-planner2/">
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/new-trip" element={<LandingPage />} />
            <Route path="/itinerary/:tripId" element={<ItineraryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
