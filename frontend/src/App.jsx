import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AukcijaDetalji from './pages/AukcijaDetalji';
import KreirajAukciju from './pages/KreirajAukciju';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/aukcija/:id" element={<AukcijaDetalji />} />
            <Route path="/kreiraj-aukciju" element={<KreirajAukciju />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
