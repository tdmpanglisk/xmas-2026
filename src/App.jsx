import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { RSVPForm } from './components/RSVPForm';
import { PotluckMenu } from './components/PotluckMenu';
import { AdminView } from './components/AdminView';
import { initEmailJS } from './utils/emailService';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    initEmailJS();
  }, []);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/rsvp" element={<RSVPForm />} />
          <Route path="/menu" element={<PotluckMenu />} />
          <Route path="/admin" element={<AdminView />} />
        </Routes>
      </main>
    </Router>
  );
}


export default App;
