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
      <div className="flex justify-center items-center h-[70vh] bg-slate-50/50 dark:bg-slate-950 theme-transition">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-slate-800 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 relative overflow-hidden theme-transition">
      
      {/* AMBIJENTALNA POZADINA */}
      <div className="absolute top-0 left-1/3 w-[700px] h-[700px] bg-blue-600/5 dark:bg-blue-500/10 blur-[180px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        
        {/* HERO SEKCIJA */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            Pronađite artikle na <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Licitaciji</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
            Pratite aukcije uživo, ponudite iznos i osigurajte željene artikle po vašim uslovima.
          </p>
        </div>

        {/* KONTROLNI PANEL ZA PRETRAGU I FILTERE */}
        <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md rounded-2xl p-3 shadow-sm mb-10 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full flex-grow">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            <input 
              type="text" 
              placeholder="Pretraži aukcije po naslovu..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs font-medium"
              value={pojamPretrage}
              onChange={(e) => setPojamPretrage(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-56">
            <select
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-600 text-xs font-bold cursor-pointer"
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

        {/* MREŽA KARTICA (OPTIMIZOVANO ZA DESKTOP: 3 do 4 KOLONE) */}
        {filtriraneAukcije.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-sm mx-auto shadow-sm">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3 text-base">💨</div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Nema pronađenih artikala</h4>
            <p className="text-slate-400 text-[11px] font-medium mt-1">Prilagodite pojam pretrage ili izabranu kategoriju.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtriraneAukcije.map((aukcija) => {
              const brojPonuda = aukcija.ponude ? aukcija.ponude.length : 0;

              return (
                <div 
                  key={aukcija._id} 
                  className="group bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/30 dark:hover:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between p-4"
                >
                  <div>
                    {/* OKVIR SLIKE - MINIMALISTIČKI PREDLOŽAK */}
                    <div className="h-44 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden mb-4 border border-slate-100 dark:border-slate-800/60 relative">
                      <img 
                        src={aukcija.slika || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'} 
                        alt={aukcija.naslov} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                      />
                    </div>

                    {/* STATUS I KATEGORIJA */}
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md uppercase tracking-wide">
                        {aukcija.kategorija}
                      </span>
                      
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                        brojPonuda > 0 
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {brojPonuda > 0 ? `${brojPonuda} ${brojPonuda === 1 ? 'ponuda' : 'ponude'}` : 'Nova'}
                      </span>
                    </div>

                    {/* NASLOV I OPIS */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {aukcija.naslov}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-400 text-xs font-normal line-clamp-2 leading-relaxed mb-4">
                      {aukcija.opis}
                    </p>

                    {/* PRIKAZ CIJENE */}
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60 grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">
                          {brojPonuda > 0 ? 'Trenutna' : 'Početna'}
                        </span>
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {aukcija.trenutnaCijena} <span className="text-xs font-bold text-slate-400">KM</span>
                        </span>
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Početna</span>
                        <span className="text-xs font-semibold text-slate-400 block mt-0.5 line-through">
                          {aukcija.pocetnaCijena} KM
                        </span>
                      </div>
                    </div>

                    {/* TAJMER */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/60 rounded-xl p-2.5">
                      <CountdownTimer datumIsteka={aukcija.trajanjeDo} />
                    </div>
                  </div>

                  {/* DUGME */}
                  <div className="mt-4">
                    <Link 
                      to={`/aukcija/${aukcija._id}`} 
                      className="block text-center bg-slate-900 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                    >
                      Pogledaj Aukciju
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;