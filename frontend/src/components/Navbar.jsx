import React from 'react';

function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-black text-blue-600 tracking-wider">BIDKO<span className="text-amber-500">.</span></span>
          </div>

          {/* Navigacioni linkovi */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-blue-600 font-medium transition">Aukcije</button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition shadow-sm">
              Prijava
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;