import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Pending from './pages/Pending';
import './App.css';

function GlobalCatButton() {
  const navigate = useNavigate();

  return (
    <span
      className="cat-button"
      onClick={() => window.location.href = '/'}
    >
      😼
    </span>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pending" element={<Pending />} />
      </Routes>

      <GlobalCatButton />
    </Router>
  );
}

export default App;
