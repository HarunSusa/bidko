import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';

function Dashboard() {
  const [mojeAukcije, setMojeAukcije] = useState([]);
  const [aukcijeUkojimaUcestvujem, setAukcijeUkojimaUcestvujem] = useState([]);
  const [ucitava, setUcitava] = useState(true);
  const [obrisanoPoruka, setObrisanoPoruka] = useState('');
  const [aktivniTab, setAktivniTab] = useState('sve'); // 'sve', 'aktivne', 'zavrsene'

  const navigate = useNavigate();
  const korisnikPodaci = localStorage.getItem('korisnik');
  const trenutniKorisnik = korisnikPodaci ? JSON.parse(korisnikPodaci) : null;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || !trenutniKorisnik) {
      navigate('/login');
      return;
    }

    const dohvatiAukcije = async () => {
      try {
        const odgovor = await axios.get('http://localhost:5000/api/aukcije');
        const korisnikId = trenutniKorisnik?._id || trenutniKorisnik?.id;

        // 1. Aukcije koje je korisnik objavio
        const moje = odgovor.data.filter((aukcija) => {
          const prodavacId = aukcija.prodavac?._id || aukcija.prodavac?.id || aukcija.prodavac;
          return String(prodavacId) === String(korisnikId);
        });

        // 2. Aukcije u kojima korisnik učestvuje
        const uUcescu = odgovor.data.filter((aukcija) => {
          const prodavacId = aukcija.prodavac?._id || aukcija.prodavac?.id || aukcija.prodavac;
          const nijeMoja = String(prodavacId) !== String(korisnikId);
          
          const imaMojuPonudu = aukcija.ponude && aukcija.ponude.some((p) => {
            const ponudjacId = p.korisnik?._id || p.korisnik?.id || p.korisnik;
            return String(ponudjacId) === String(korisnikId);
          });

          return nijeMoja && imaMojuPonudu;
        });

        setMojeAukcije(moje);
        setAukcijeUkojimaUcestvujem(uUcescu);
      } catch (error) {
        console.error("Greška pri učitavanju aukcija:", error);
      } finally {
        setUcitava(false);
      }
    };

    dohvatiAukcije();
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

  // Glavna provjera aktivnosti: ako je istekao datum ili je status eksplicitno postavljen na završeno/closed
  const jeAktivna = (aukcija) => {
    if (aukcija.trajanjeDo && new Date(aukcija.trajanjeDo) <= new Date()) {
      return false;
    }
    
    if (aukcija.status) {
      const st = String(aukcija.status).toLowerCase();
      if (st === 'zavrseno' || st === 'završeno' || st === 'closed' || st === 'expired') {
        return false;
      }
    }
    
    return true;
  };

  // Dinamičko generisanje Badgea za status
  const renderStatusBadge = (aukcija) => {
    const aktivna = jeAktivna(aukcija);

    if (aktivna) {
      return (
        <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-md text-[11px] border border-emerald-200/60 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Aktivno
        </span>
      );
    }

    return (
      <span className="bg-gray-100 text-gray-600 font-bold px-2.5 py-1 rounded-md text-[11px] border border-gray-200 inline-flex items-center gap-1">
        Završeno
      </span>
    );
  };

  // Filtriranje mojih aukcija prema tabovima
  const filtriraneAukcije = mojeAukcije.filter(aukcija => {
    if (aktivniTab === 'aktivne') return jeAktivna(aukcija);
    if (aktivniTab === 'zavrsene') return !jeAktivna(aukcija);
    return true;
  });

  const aktivneCount = mojeAukcije.filter(jeAktivna).length;
  const zavrseneCount = mojeAukcije.length - aktivneCount;
  const ukupnaVrijednost = mojeAukcije.reduce((sum, item) => sum + (item.trenutnaCijena || 0), 0);

  if (!trenutniKorisnik) return null;

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* LIJEVI SIDEBAR */}
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
                <span className="text-gray-500 font-medium">Moji Oglasi:</span>
                <span className="font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">{mojeAukcije.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Aktivne Aukcije:</span>
                <span className="font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">{aktivneCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Moje Učešće:</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{aukcijeUkojimaUcestvujem.length}</span>
              </div>
            </div>

            <Link 
              to="/kreiraj-aukciju" 
              className="w-full mt-2 flex items-center justify-center gap-2 bg-[#ff7a00] hover:bg-[#e66e00] text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm"
            >
              <span className="text-base font-black">+</span> Objavite Novu Aukciju
            </Link>
          </div>

          {/* DESNI DIO */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* STATISTIKA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Aktivni Oglasi</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{aktivneCount}</h3>
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
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Aukcije u Kojima Licitiram</p>
                  <h3 className="text-2xl font-black text-blue-600 mt-1">{aukcijeUkojimaUcestvujem.length}</h3>
                </div>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg font-bold">
                  🔨
                </div>
              </div>
            </div>

            {/* TABELA 1: MOJE OBJAVLJENE AUKCIJE */}
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Moje Objavljene Aukcije</h3>
                  <p className="text-[11px] text-gray-400">Upravljanje oglasima koje ste kreirali</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAktivniTab('sve')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      aktivniTab === 'sve' 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Sve ({mojeAukcije.length})
                  </button>
                  <button
                    onClick={() => setAktivniTab('aktivne')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      aktivniTab === 'aktivne' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Aktivne ({aktivneCount})
                  </button>
                  <button
                    onClick={() => setAktivniTab('zavrsene')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      aktivniTab === 'zavrsene' 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Završene ({zavrseneCount})
                  </button>
                </div>
              </div>

              {filtriraneAukcije.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-gray-400 text-xs">Nema objavljenih aukcija u ovoj kategoriji.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase bg-gray-50/30">
                        <th className="py-3 px-6">Artikal</th>
                        <th className="py-3 px-4">Kategorija</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Početna / Trenutna</th>
                        <th className="py-3 px-4">Preostalo Vrijeme</th>
                        <th className="py-3 px-6 text-right">Akcije</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                      {filtriraneAukcije.map((aukcija) => {
                        const aktivna = jeAktivna(aukcija);
                        return (
                          <tr key={aukcija._id} className="hover:bg-gray-50/80 transition-colors">
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
                            <td className="py-4 px-4">
                              <span className="bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-md text-[11px]">
                                {aukcija.kategorija}
                              </span>
                            </td>
                            
                            {/* POPRAVLJEN STATUS BADGE */}
                            <td className="py-4 px-4">
                              {renderStatusBadge(aukcija)}
                            </td>

                            <td className="py-4 px-4">
                              <div>
                                <span className="font-bold text-orange-600 block">{aukcija.trenutnaCijena} KM</span>
                                <span className="text-[10px] text-gray-400 line-through block">{aukcija.pocetnaCijena} KM</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 min-w-[150px]">
                              {aktivna ? (
                                <CountdownTimer datumIsteka={aukcija.trajanjeDo} />
                              ) : (
                                <span className="text-xs text-gray-400 font-semibold">Isteklo</span>
                              )}
                            </td>
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* TABELA 2: AUKCIJE U KOJIMA UČESTVUJEM */}
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900">Aukcije u Kojima Učestvujem</h3>
                <p className="text-[11px] text-gray-400">Pregled oglasa na kojima ste poslali ponudu</p>
              </div>

              {aukcijeUkojimaUcestvujem.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-gray-400 text-xs">Trenutno ne učestvujete u drugim aukcijama.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase bg-gray-50/30">
                        <th className="py-3 px-6">Artikal</th>
                        <th className="py-3 px-4">Status Aukcije</th>
                        <th className="py-3 px-4">Trenutna Cijena</th>
                        <th className="py-3 px-4">Status Ponude</th>
                        <th className="py-3 px-4">Preostalo Vrijeme</th>
                        <th className="py-3 px-6 text-right">Akcija</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                      {aukcijeUkojimaUcestvujem.map((aukcija) => {
                        const aktivna = jeAktivna(aukcija);
                        const korisnikId = trenutniKorisnik?._id || trenutniKorisnik?.id;

                        const mojePonude = aukcija.ponude.filter(p => {
                          const id = p.korisnik?._id || p.korisnik?.id || p.korisnik;
                          return String(id) === String(korisnikId);
                        });
                        const mojaNajvisaPonuda = Math.max(...mojePonude.map(p => p.iznos || 0));

                        const zadnjaPonuda = aukcija.ponude[aukcija.ponude.length - 1];
                        const zadnjiId = zadnjaPonuda?.korisnik?._id || zadnjaPonuda?.korisnik?.id || zadnjaPonuda?.korisnik;
                        const vodim = String(zadnjiId) === String(korisnikId);

                        return (
                          <tr key={aukcija._id} className="hover:bg-gray-50/80 transition-colors">
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
                                    Moja najveća ponuda: <b className="text-gray-700">{mojaNajvisaPonuda} KM</b>
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {renderStatusBadge(aukcija)}
                            </td>
                            <td className="py-4 px-4 font-bold text-gray-900">
                              {aukcija.trenutnaCijena} KM
                            </td>
                            <td className="py-4 px-4">
                              {vodim ? (
                                <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md text-[11px] border border-blue-200">
                                  👑 Najviša ponuda
                                </span>
                              ) : (
                                <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-md text-[11px] border border-amber-200">
                                  ⚠️ Nadmašeni ste
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 min-w-[150px]">
                              {aktivna ? (
                                <CountdownTimer datumIsteka={aukcija.trajanjeDo} />
                              ) : (
                                <span className="text-xs text-gray-400 font-semibold">Isteklo</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <Link 
                                to={`/aukcija/${aukcija._id}`}
                                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                              >
                                {vodim ? 'Pregled' : 'Povećaj Ponudu'}
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
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