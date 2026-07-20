import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const korisnikPodaci = localStorage.getItem('korisnik');
  const korisnik = korisnikPodaci ? JSON.parse(korisnikPodaci) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-black text-blue-600 tracking-wider">BIDKO<span className="text-amber-500">.</span></span>
          </Link>

          {/* Navigacioni linkovi */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition text-sm">
              Aukcije
            </Link>
            
            {token && korisnik ? (
              <div className="flex items-center space-x-4">
                {/* Link 1: Kreiranje aukcije (odvojen) */}
                <Link 
                  to="/kreiraj-aukciju" 
                  className="text-sm font-semibold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition"
                >
                  + Nova Aukcija
                </Link>
                
                {/* Link 2: Dashboard/Profil (odvojen) */}
                <Link 
                  to="/dashboard" 
                  className="text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition"
                >
                  👋 {korisnik.ime}
                </Link>

                {/* Dugme za odjavu */}
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition"
                >
                  Odjava
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl text-sm transition shadow-sm"
              >
                Prijava
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;