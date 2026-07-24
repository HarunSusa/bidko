import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';

function Home() {
  const [aukcije, setAukcije] = useState([]);
  const [ucitava, setUcitava] = useState(true);
  
  const [pojamPretrage, setPojamPretrage] = useState('');
  const [izabranaKategorija, setIzabranaKategorija] = useState('Sve');
  const [filterTip, setFilterTip] = useState('svi'); // 'svi', 'aukcija', 'fiksno'
  const [poredajPo, setPoredajPo] = useState('najnovije'); // 'najnovije', 'jeftinije', 'skuplje'

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

  // Pomoćna funkcija za dohvaćanje mjerodavne cijene oglasa
  const DajCijenu = (aukcija) => {
    const jeAukcija = !aukcija.tipProdaje || aukcija.tipProdaje === 'aukcija';
    if (jeAukcija) {
      return Number(aukcija.trenutnaCijena || aukcija.pocetnaCijena || 0);
    }
    return Number(aukcija.fiksnaCijena || aukcija.pocetnaCijena || 0);
  };

  // 1. FILTRIRANJE
  const filtriraneAukcije = aukcije.filter((aukcija) => {
    const poklapaNaslov = aukcija.naslov ? aukcija.naslov.toLowerCase().includes(pojamPretrage.toLowerCase()) : true;
    const poklapaKategoriju = izabranaKategorija === 'Sve' || aukcija.kategorija === izabranaKategorija;
    
    const jeFiksno = aukcija.tipProdaje === 'fiksno' || aukcija.tipProdaje === 'fiksna';
    const jeAukcija = aukcija.tipProdaje === 'aukcija' || !aukcija.tipProdaje;

    const poklapaTip = 
      filterTip === 'svi' || 
      (filterTip === 'fiksno' && jeFiksno) || 
      (filterTip === 'aukcija' && jeAukcija);

    return poklapaNaslov && poklapaKategoriju && poklapaTip;
  });

  // 2. SORTIRANJE (Najjeftinije, Najskuplje, Najnovije)
  const sortiraneAukcije = [...filtriraneAukcije].sort((a, b) => {
    if (poredajPo === 'jeftinije') {
      return DajCijenu(a) - DajCijenu(b);
    }
    if (poredajPo === 'skuplje') {
      return DajCijenu(b) - DajCijenu(a);
    }
    // Podrazumijevano 'najnovije' (po _id ili datumu kreiranja)
    return (b._id || '').localeCompare(a._id || '');
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
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            Pronađite unikate na <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Aukciji & Prodaji</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
            Pratite aukcije uživo ili kupujte po fiksnoj cijeni najzanimljivije antikvitete i dragocjenosti.
          </p>
        </div>

        {/* KONTROLNI PANEL ZA PRETRAGU, FILTERE I SORTIRANJE */}
        <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md rounded-2xl p-4 shadow-sm mb-10 space-y-3">
          
          {/* TABOVI ZA TIP PRODAJE */}
          <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <button
              onClick={() => setFilterTip('svi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTip === 'svi'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🌐 Svi oglasi
            </button>
            <button
              onClick={() => setFilterTip('aukcija')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTip === 'aukcija'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ⚡ Samo Aukcije
            </button>
            <button
              onClick={() => setFilterTip('fiksno')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTip === 'fiksno'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🏷️ Fiksna Cijena
            </button>
          </div>

          {/* INPUTI ZA PRETRAGU, KATEGORIJU I SORTIRANJE */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            
            {/* Pretraga po nazivu */}
            <div className="relative sm:col-span-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input 
                type="text" 
                placeholder="Pretraži artikle po naslovu..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs font-medium"
                value={pojamPretrage}
                onChange={(e) => setPojamPretrage(e.target.value)}
              />
            </div>
            
            {/* Filter po kategoriji */}
            <div className="sm:col-span-3">
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-600 text-xs font-bold cursor-pointer"
                value={izabranaKategorija}
                onChange={(e) => setIzabranaKategorija(e.target.value)}
              >
                <option value="Sve">Sve kategorije</option>
                <option value="Antikviteti">Antikviteti</option>
                <option value="Kolekcionarstvo">Kolekcionarstvo</option>
                <option value="Umjetnost">Umjetnost</option>
                <option value="Numizmatika">Numizmatika</option>
                <option value="Nakit">Nakit</option>
                <option value="Knjige">Knjige</option>
                <option value="Audio i video">Audio i video</option>
                <option value="Elektronika">Elektronika</option>
                <option value="Vozila">Vozila</option>
                <option value="Ostalo">Ostalo</option>
              </select>
            </div>

            {/* Sortiranje po cijeni/datumu */}
            <div className="sm:col-span-3">
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-600 text-xs font-bold cursor-pointer"
                value={poredajPo}
                onChange={(e) => setPoredajPo(e.target.value)}
              >
                <option value="najnovije">✨ Najnovije prvo</option>
                <option value="jeftinije">📉 Najjeftinije prvo</option>
                <option value="skuplje">📈 Najskuplje prvo</option>
              </select>
            </div>

          </div>

        </div>

        {/* MREŽA KARTICA */}
        {sortiraneAukcije.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-sm mx-auto shadow-sm">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3 text-base">💨</div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Nema pronađenih artikala</h4>
            <p className="text-slate-400 text-[11px] font-medium mt-1">Prilagodite pojam pretrage ili izabranu kategoriju.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortiraneAukcije.map((aukcija) => {
              const brojPonuda = aukcija.ponude ? aukcija.ponude.length : 0;
              const jeAukcija = !aukcija.tipProdaje || aukcija.tipProdaje === 'aukcija';
              
              const prikazSlika = (aukcija.slike && aukcija.slike.length > 0) 
                ? aukcija.slike[0] 
                : (aukcija.slika || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500');

              return (
                /* CIJELA KARTICA JE LINK ZA DETALJE */
                <Link 
                  key={aukcija._id} 
                  to={`/aukcija/${aukcija._id}`}
                  className="group bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 dark:hover:border-blue-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-4 cursor-pointer hover:-translate-y-1"
                >
                  <div>
                    {/* OKVIR SLIKE */}
                    <div className="h-44 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden mb-4 border border-slate-100 dark:border-slate-800/60 relative">
                      <img 
                        src={prikazSlika} 
                        alt={aukcija.naslov} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                      />
                      {/* TIP PRODAJE BADGE */}
                      <span className={`absolute top-2 right-2 text-[9px] font-black px-2 py-1 rounded-lg backdrop-blur-md uppercase tracking-wider ${
                        jeAukcija 
                          ? 'bg-blue-600/90 text-white' 
                          : 'bg-emerald-600/90 text-white'
                      }`}>
                        {jeAukcija ? '⚡ Aukcija' : '🏷️ Fiksna Cijena'}
                      </span>
                    </div>

                    {/* STATUS, KATEGORIJA I LOKACIJA */}
                    <div className="flex justify-between items-center mb-2 font-semibold">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md uppercase tracking-wide truncate">
                          {aukcija.kategorija}
                        </span>
                        {aukcija.lokacija && (
                          <span className="text-[10px] text-slate-400 truncate flex items-center gap-0.5">
                            📍 {aukcija.lokacija}
                          </span>
                        )}
                      </div>
                      
                      {jeAukcija && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wide shrink-0 ${
                          brojPonuda > 0 
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {brojPonuda > 0 ? `${brojPonuda} pon.` : 'Nova'}
                        </span>
                      )}
                    </div>

                    {/* NASLOV I OPIS */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {aukcija.naslov}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-400 text-xs font-normal line-clamp-2 leading-relaxed mb-4">
                      {aukcija.opis}
                    </p>

                    {/* PRIKAZ CIJENE */}
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60 mb-3">
                      {jeAukcija ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">
                              {brojPonuda > 0 ? 'Trenutna' : 'Početna'}
                            </span>
                            <span className="text-base font-black text-slate-900 dark:text-white">
                              {aukcija.trenutnaCijena || aukcija.pocetnaCijena} <span className="text-xs font-bold text-slate-400">KM</span>
                            </span>
                          </div>
                          {brojPonuda > 0 && (
                            <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
                              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Početna</span>
                              <span className="text-xs font-semibold text-slate-400 block mt-0.5 line-through">
                                {aukcija.pocetnaCijena} KM
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Fiksna cijena</span>
                          <span className="text-base font-black text-emerald-500">
                            {aukcija.fiksnaCijena || aukcija.pocetnaCijena} <span className="text-xs font-bold text-slate-400">KM</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* TAJMER (SAMO ZA AUKCIJE) */}
                    {jeAukcija && aukcija.trajanjeDo && (
                      <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/60 rounded-xl p-2.5">
                        <CountdownTimer datumIsteka={aukcija.trajanjeDo} />
                      </div>
                    )}
                  </div>

                  {/* VIZUELNO DUGME / INDIKATOR AKCIJE */}
                  <div className="mt-4">
                    <div className={`block text-center font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm text-white ${
                      jeAukcija
                        ? 'bg-slate-900 group-hover:bg-blue-600 dark:bg-slate-800 dark:group-hover:bg-blue-600'
                        : 'bg-emerald-600 group-hover:bg-emerald-500'
                    }`}>
                      {jeAukcija ? 'Pogledaj Aukciju' : 'Pogledaj Oglas'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;