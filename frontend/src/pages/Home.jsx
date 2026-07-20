import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Home() {
  const [aukcije, setAukcije] = useState([]);
  const [ucitava, setUcitava] = useState(true);

  useEffect(() => {
    const povuciAukcije = async () => {
      try {
        // Pozivamo tvoj backend API za preuzimanje aukcija
        const odgovor = await axios.get('http://localhost:5000/api/aukcije');
        setAukcije(odgovor.data);
      } catch (error) {
        console.error("Greška pri učitavanju aukcija:", error);
      } finally {
        setUcitava(false);
      }
    };

    povuciAukcije();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Aktivne Aukcije 🔨</h1>
        <p className="mt-2 text-gray-600">Pronađite sjajne artikle i ponudite svoju cijenu na vrijeme.</p>
      </div>

      {ucitava ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : aukcije.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">Trenutno nema aktivnih aukcija. Budite prvi koji će kreirati jednu!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {aukcije.map((aukcija) => (
            <div key={aukcija._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
              {/* Slika */}
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img 
                  src={aukcija.slika || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'} 
                  alt={aukcija.naslov}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Detalji */}
              <div className="p-5">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 mb-2">
                  {aukcija.kategorija}
                </span>
                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-blue-600 transition">
                  {aukcija.naslov}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                  {aukcija.opis}
                </p>

                <div className="flex justify-between items-end pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-gray-400 text-xs">Trenutna cijena</p>
                    <p className="text-xl font-black text-gray-900">{aukcija.trenutnaCijena} KM</p>
                  </div>
                  <button className="bg-gray-900 hover:bg-blue-600 text-white font-medium py-2 px-3.5 rounded-xl text-sm transition shadow-sm">
                    Pogledaj
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;