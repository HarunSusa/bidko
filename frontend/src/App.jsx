import React from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Prikazujemo Navbar */}
      <Navbar />
      
      {/* Glavni sadržaj - Home stranica */}
      <main className="flex-grow">
        <Home />
      </main>
    </div>
  );
}

export default App;
