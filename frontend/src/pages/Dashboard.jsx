import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';

function Dashboard() {
  const [mojeAukcije, setMojeAukcije] = useState([]);
  const [ucitava, setUcitava] = useState(true);
  const [obrisanoPoruka, setObrisanoPoruka] = useState('');

  const navigate = useNavigate();
  const korisnikPodaci = localStorage.getItem('korisnik');
  const trenutniKorisnik = korisnikPodaci ? JSON.parse(korisnikPodaci) : null;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || !trenutniKorisnik) {
      navigate('/login');
      return;
    }

    const dohvatiMojeAukcije = async () => {
      try {
        const odgovor = await axios.get('http://localhost:5000/api/aukcije');
        const korisnikId = trenutniKorisnik?._id || trenutniKorisnik?.id;
        
        const filtrirane = odgovor.data.filter(
          (aukcija) => {
            const prodavacId = aukcija.prodavac?._id || aukcija.prodavac?.id || aukcija.prodavac;
            return String(prodavacId) === String(korisnikId);
          }
        );
        
        setMojeAukcije(filtrirane);
      } catch (error) {
        console.error("Greška pri učitavanju korisničkih aukcija:", error);
      } finally {
        setUcitava(false);
      }
    };

    dohvatiMojeAukcije();
  }, [token, trenutniKorisnik, navigate]);

  const handleObrisi = async (aukcijaId) => {
    if (!window.confirm("Da li ste sigurni da želite obrisati ovu aukciju?")) {
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.delete(`http://localhost:5000/api/aukcije/${aukcijaId}`, config);
      
      setObrisanoPoruka('🚀 Aukcija je uspješno uklonjena sa platforme.');
      setMojeAukcije(mojeAukcije.filter(aukcija => aukcija._id !== aukcijaId));

      setTimeout(() => setObrisanoPoruka(''), 3000);
    } catch (error) {
      console.error("Greška pri brisanju aukcija:", error);
      alert(error.response?.data?.poruka || "Došlo je do greške pri brisanju.");
    }
  };

  const ukupnaVrijednost = mojeAukcije.reduce((sum, item) => sum + (item.trenutnaCijena || 0), 0);
  const ukupnoPonuda = mojeAukcije.reduce((sum, item) => sum + (item.ponude ? item.ponude.length : 0), 0);

  if (!trenutniKorisnik) {
    return null;
  }

  if (ucitava) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* NOTIFIKACIJA O BRISANJU */}
        {obrisanoPoruka && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-sm font-semibold shadow-sm animate-fade-in flex items-center justify-between">
            <span>{obrisanoPoruka}</span>
            <button onClick={() => setObrisanoPoruka('')} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
          </div>
        )}

        {/* GLAVNA DESKTOP GRID STRUKTURA (Sidebar + Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* LIJEVI SIDEBAR: PROFIL I BRZE AKCIJE */}
          <div className="lg:col-span-1 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm sticky top-24">
            <div className="text-center pb-6 border-b border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-full flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-md shadow-orange-500/20">
                {trenutniKorisnik.ime ? trenutniKorisnik.ime.charAt(0).toUpperCase() : 'U'}
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {trenutniKorisnik.ime || 'Korisnik'}
              </h2>
              <p className="text-xs text-gray-400 font-medium">{trenutniKorisnik.email}</p>
            </div>

            <div className="py-5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Uloga:</span>
                <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">Prodavač</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Ukupno Oglasa:</span>
                <span className="font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">{mojeAukcije.length}</span>
              </div>
            </div>

            <Link 
              to="/kreiraj-aukciju" 
              className="w-full mt-2 flex items-center justify-center gap-2 bg-[#ff7a00] hover:bg-[#e66e00] text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm"
            >
              <span className="text-base font-black">+</span> Objavite Novu Aukciju
            </Link>
          </div>

          {/* DESNI DIO: STATISTIKA I TABELA AUKCIJA */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* STATISTIČKE KARTICE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Aktivni Oglasi</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{mojeAukcije.length}</h3>
                </div>
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-lg font-bold">
                  📦
                </div>
              </div>

              <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ukupna Vrijednost</p>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">{ukupnaVrijednost} <span className="text-xs font-bold text-gray-500">KM</span></h3>
                </div>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-lg font-bold">
                  💰
                </div>
              </div>

              <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Primljene Ponude</p>
                  <h3 className="text-2xl font-black text-blue-600 mt-1">{ukupnoPonuda}</h3>
                </div>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg font-bold">
                  🔨
                </div>
              </div>
            </div>

            {/* UPRAVLJANJE AUKCIJAMA */}
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Moje Aktivne Aukcije</h3>
                <span className="text-xs font-medium text-gray-500">Prikazano: {mojeAukcije.length}</span>
              </div>

              {mojeAukcije.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    💨
                  </div>
                  <h4 className="text-base font-bold text-gray-900">Nemate aktivnih aukcija</h4>
                  <p className="text-gray-400 text-xs mt-1 mb-6">Trenutno nemate objavljenih artikala za prodaju.</p>
                  <Link 
                    to="/kreiraj-aukciju" 
                    className="inline-block bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors"
                  >
                    Kreiraj Prvu Aukciju
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase bg-gray-50/30">
                        <th className="py-3 px-6">Artikal</th>
                        <th className="py-3 px-4">Kategorija</th>
                        <th className="py-3 px-4">Početna / Trenutna</th>
                        <th className="py-3 px-4">Preostalo Vrijeme</th>
                        <th className="py-3 px-6 text-right">Akcije</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                      {mojeAukcije.map((aukcija) => (
                        <tr key={aukcija._id} className="hover:bg-gray-50/80 transition-colors">
                          
                          {/* SLIKA I NASLOV */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img 
                                src={aukcija.slika || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'} 
                                alt={aukcija.naslov} 
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                              />
                              <div>
                                <Link 
                                  to={`/aukcija/${aukcija._id}`} 
                                  className="font-bold text-gray-900 hover:text-orange-600 transition-colors line-clamp-1"
                                >
                                  {aukcija.naslov}
                                </Link>
                                <span className="text-[10px] text-gray-400 block mt-0.5">
                                  {aukcija.ponude ? aukcija.ponude.length : 0} ponuda
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* KATEGORIJA */}
                          <td className="py-4 px-4">
                            <span className="bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-md text-[11px]">
                              {aukcija.kategorija}
                            </span>
                          </td>

                          {/* CIJENE */}
                          <td className="py-4 px-4">
                            <div>
                              <span className="font-bold text-orange-600 block">{aukcija.trenutnaCijena} KM</span>
                              <span className="text-[10px] text-gray-400 line-through block">{aukcija.pocetnaCijena} KM</span>
                            </div>
                          </td>

                          {/* PREOSTALO VRIJEME */}
                          <td className="py-4 px-4 min-w-[150px]">
                            <CountdownTimer datumIsteka={aukcija.trajanjeDo} />
                          </td>

                          {/* AKCIJE */}
                          <td className="py-4 px-6 text-right space-x-2">
                            <Link 
                              to={`/aukcija/${aukcija._id}`}
                              className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                            >
                              Pregled
                            </Link>
                            <button 
                              onClick={() => handleObrisi(aukcija._id)}
                              className="inline-block bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors border border-rose-100"
                              title="Obriši"
                            >
                              Obriši
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;