import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import Intro from './pages/Intro';
import CandyCrush from './pages/CandyCrush';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/menu" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/candy-crush" element={<CandyCrush />} />
      </Routes>
    </Router>
  );
}

export default App;
