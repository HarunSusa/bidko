import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';

function Home() {
  const [aukcije, setAukcije] = useState([]);
  const [ucitava, setUcitava] = useState(true);
  
  const [pojamPretrage, setPojamPretrage] = useState('');
  const [izabranaKategorija, setIzabranaKategorija] = useState('Sve');

  useEffect(() => {
    const dohvatiAukcije = async () => {
      try {
        const odgovor = await axios.get('http://localhost:5000/api/aukcije');
        setAukcije(odgovor.data);
      } catch (error) {
        console.error("Greška pri učitavanju aukcija:", error);
      } finally {
        setUcitava(false);
      }
    };
    dohvatiAukcije();
  }, []);

  const filtriraneAukcije = aukcije.filter((aukcija) => {
    const poklapaNaslov = aukcija.naslov.toLowerCase().includes(pojamPretrage.toLowerCase());
    const poklapaKategoriju = izabranaKategorija === 'Sve' || aukcija.kategorija === izabranaKategorija;
    return poklapaNaslov && poklapaKategoriju;
  });

  if (ucitava) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Hero sekcija */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
          Pronađite najbolje artikle na <span className="text-blue-600">Licitaciji</span> 🔨
        </h1>
        <p className="text-gray-500 text-sm sm:text-base mt-3 max-w-xl mx-auto">
          Ponudite cijenu, pratite preostalo vrijeme uživo i osvojite željene proizvode po vašoj cijeni.
        </p>
      </div>

      {/* Traka sa Pretragom i Filtriranjem */}
      <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm mb-10 flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <input 
            type="text" 
            placeholder="Pretraži aukcije po naslovu..." 
            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-600 transition text-sm font-medium"
            value={pojamPretrage}
            onChange={(e) => setPojamPretrage(e.target.value)}
          />
        </div>
        
        <div className="sm:w-64">
          <select
            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-600 transition text-sm font-semibold bg-white"
            value={izabranaKategorija}
            onChange={(e) => setIzabranaKategorija(e.target.value)}
          >
            <option value="Sve">Sve Kategorije</option>
            <option value="Elektronika">Elektronika</option>
            <option value="Vozila">Vozila</option>
            <option value="Moda">Moda</option>
            <option value="Nekretnine">Nekretnine</option>
            <option value="Ostalo">Ostalo</option>
          </select>
        </div>
      </div>

      {/* Mreža sa filtriranim aukcijama */}
      {filtriraneAukcije.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 font-medium">Nema pronađenih aukcija za unijete kriterije.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtriraneAukcije.map((aukcija) => {
            // Računamo broj ponuda za trenutnu aukciju
            const brojPonuda = aukcija.ponude ? aukcija.ponude.length : 0;

            return (
              <div key={aukcija._id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between p-5">
                <div>
                  {/* Slika */}
                  <div className="h-52 bg-gray-100 rounded-2xl overflow-hidden mb-4">
                    <img 
                      src={aukcija.slika || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'} 
                      alt={aukcija.naslov} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Red sa Kategorijom i Brojem Ponuda - Čisti Flex bez preklapanja */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase">
                      {aukcija.kategorija}
                    </span>
                    
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm transition-colors ${
                      brojPonuda > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {brojPonuda > 0 ? `🔥 ${brojPonuda} ${brojPonuda === 1 ? 'ponuda' : 'ponude'}` : 'Nova aukcija ⚡'}
                    </span>
                  </div>

                  {/* Naslov i Opis */}
                  <h3 className="text-xl font-black text-gray-950 mb-1 truncate">{aukcija.naslov}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4">{aukcija.opis}</p>

                  {/* Cijene */}
                  <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex justify-between items-center mb-4">
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                        {brojPonuda > 0 ? 'Trenutna cijena' : 'Početna cijena'}
                      </span>
                      <span className="text-lg font-black text-gray-950">{aukcija.trenutnaCijena} KM</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">Originalna</span>
                      <span className="text-sm font-bold text-gray-500">{aukcija.pocetnaCijena} KM</span>
                    </div>
                  </div>

                  {/* Odbrojavanje */}
                  <CountdownTimer datumIsteka={aukcija.trajanjeDo} />
                </div>

                {/* Dugme za akciju */}
                <div className="mt-5">
                  <Link 
                    to={`/aukcija/${aukcija._id}`} 
                    className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm transition shadow-sm"
                  >
                    Pogledaj Detalje 🔨
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Home;