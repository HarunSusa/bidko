import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import CountdownTimer from '../components/CountdownTimer';

function AukcijaDetalji() {
  const { id } = useParams();
  const [aukcija, setAukcije] = useState(null);
  const [ucitava, setUcitava] = useState(true);
  const [iznosPonude, setIznosPonude] = useState('');
  const [poruka, setPoruka] = useState({ tip: '', tekst: '' });

  // Stanje za indeks trenutno aktivne slike i modal
  const [trenutnaSlikaIndex, setTrenutnaSlikaIndex] = useState(0);
  const [otvorenaSlika, setOtvorenaSlika] = useState(false);

  const token = localStorage.getItem('token');

  const dohvatiAukciju = async () => {
    try {
      const odgovor = await axios.get(`http://localhost:5000/api/aukcije/${id}`);
      setAukcije(odgovor.data);
    } catch (error) {
      console.error("Greška pri učitavanju artikla:", error);
    } finally {
      setUcitava(false);
    }
  };

  useEffect(() => {
    dohvatiAukciju();
  }, [id]);

  // Lista slika ili podrazumijevana slika ako nema niti jedne
  const listaSlika = (aukcija?.slike && aukcija.slike.length > 0)
    ? aukcija.slike
    : [aukcija?.slika || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'];

  // Funkcije za prebacivanje slika
  const sljedecaSlika = (e) => {
    if (e) e.stopPropagation();
    setTrenutnaSlikaIndex((prev) => (prev + 1) % listaSlika.length);
  };

  const prethodnaSlika = (e) => {
    if (e) e.stopPropagation();
    setTrenutnaSlikaIndex((prev) => (prev - 1 + listaSlika.length) % listaSlika.length);
  };

  // Navigacija preko tastature (ESC, Strelica Lijevo, Strelica Desno)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!otvorenaSlika) return;

      if (e.key === 'Escape') {
        setOtvorenaSlika(false);
      } else if (e.key === 'ArrowRight') {
        sljedecaSlika();
      } else if (e.key === 'ArrowLeft') {
        prethodnaSlika();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [otvorenaSlika, listaSlika.length]);

  const handleLicitiraj = async (e) => {
    e.preventDefault();
    setPoruka({ tip: '', tekst: '' });

    if (!iznosPonude || Number(iznosPonude) <= aukcija.trenutnaCijena) {
      setPoruka({ tip: 'greska', tekst: `Ponuda mora biti veća od trenutne cijene (${aukcija.trenutnaCijena} KM).` });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.post(
        `http://localhost:5000/api/aukcije/${id}/ponuda`,
        { iznos: Number(iznosPonude) },
        config
      );

      setPoruka({ tip: 'uspjeh', tekst: '🚀 Uspješno ste postavili ponudu! Trenutno vodite.' });
      setIznosPonude('');
      dohvatiAukciju();
    } catch (error) {
      setPoruka({ 
        tip: 'greska', 
        tekst: error.response?.data?.poruka || 'Došlo je do greške pri slanju ponude.' 
      });
    }
  };

  if (ucitava) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-50 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!aukcija) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center bg-white border border-gray-100 rounded-3xl shadow-sm my-12">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔍</div>
        <h2 className="text-xl font-bold text-gray-950">Artikal nije pronađen</h2>
        <p className="text-gray-500 text-sm mt-1 mb-6">Moguće je da je artikl uklonjen ili je link neispravan.</p>
        <Link to="/" className="inline-block w-full bg-gray-950 hover:bg-gray-800 text-white font-medium py-3 rounded-xl text-sm transition shadow-sm">
          Povratak na početnu
        </Link>
      </div>
    );
  }

  const jeAukcija = !aukcija.tipProdaje || aukcija.tipProdaje === 'aukcija';

  const sortiranePonude = aukcija.ponude 
    ? [...aukcija.ponude].reverse() 
    : [];

  const aktivnaSlikaUrl = listaSlika[trenutnaSlikaIndex];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Dugme za povratak */}
      <Link to="/" className="group text-sm font-semibold text-gray-500 hover:text-blue-600 transition-all inline-flex items-center mb-8 gap-2">
        <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Nazad na sve oglase
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-50">
        
        {/* LIJEVA STRANA: Prikaz slika sa thumbnaillovima */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* GLAVNA SLIKA */}
          <div 
            onClick={() => setOtvorenaSlika(true)}
            className="group relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 h-80 sm:h-[440px] shadow-inner cursor-zoom-in"
          >
            <img 
              src={aktivnaSlikaUrl} 
              alt={aukcija.naslov} 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            
            {/* Oznake kategorije i tipa prodaje */}
            <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
              <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-gray-900 shadow-sm uppercase tracking-wider">
                📦 {aukcija.kategorija}
              </span>
              <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-sm uppercase tracking-wider ${
                jeAukcija ? 'bg-blue-600' : 'bg-emerald-600'
              }`}>
                {jeAukcija ? '⚡ Aukcija' : '🏷️ Fiksna Cijena'}
              </span>
            </div>

            {/* Dugmad za brzu navigaciju na glavnoj slici (prikazuju se ako ima više slika) */}
            {listaSlika.length > 1 && (
              <>
                <button
                  onClick={prethodnaSlika}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center backdrop-blur-sm transition-all opacity-80 hover:opacity-100"
                >
                  ❮
                </button>
                <button
                  onClick={sljedecaSlika}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center backdrop-blur-sm transition-all opacity-80 hover:opacity-100"
                >
                  ❯
                </button>
              </>
            )}

            {/* Indikator za uvećanje slike */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
              🔍 Klikni za uvećanje
            </div>
          </div>

          {/* MALE SLIČICE (THUMBNAILS) — PRIKAZUJU SE AKO IMA VIŠE SLIKA */}
          {listaSlika.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {listaSlika.map((s, index) => (
                <button
                  key={index}
                  onClick={() => setTrenutnaSlikaIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    index === trenutnaSlikaIndex 
                      ? 'border-blue-600 scale-105 shadow-md' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={s} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* DESNA STRANA: Detalji */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight leading-none mb-3">
              {aukcija.naslov}
            </h1>
            
            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
              {aukcija.opis}
            </p>
            
            {/* TAJMER SEKCIJA — PRIKAZUJE SE SAMO ZA AUKCIJE */}
            {jeAukcija && aukcija.trajanjeDo && (
              <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-50/70">
                <span className="text-xs font-bold text-blue-700 block mb-1 uppercase tracking-wide">Preostalo vrijeme:</span>
                <CountdownTimer datumIsteka={aukcija.trajanjeDo} />
              </div>
            )}
            
            {/* BOX SA CIJENAMA */}
            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 shadow-sm">
              {jeAukcija ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-r border-gray-200/60 pr-2">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Trenutna cijena</p>
                    <p className="text-3xl font-black text-blue-600 font-mono">{aukcija.trenutnaCijena || aukcija.pocetnaCijena} <span className="text-lg font-bold">KM</span></p>
                  </div>
                  <div className="pl-2">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Početna cijena</p>
                    <p className="text-xl font-extrabold text-gray-700 font-mono mt-1">{aukcija.pocetnaCijena} <span className="text-sm font-bold">KM</span></p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Fiksna prodajna cijena</p>
                  <p className="text-3xl font-black text-emerald-600 font-mono">
                    {aukcija.fiksnaCijena || aukcija.pocetnaCijena} <span className="text-lg font-bold">KM</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* HISTORIJAT PONUDA — PRIKAZUJE SE SAMO ZA AUKCIJE */}
          {jeAukcija && (
            <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📊</span> Historijat ponuda
                </h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {sortiranePonude.length} ponuda
                </span>
              </div>

              {sortiranePonude.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3 italic">Još uvijek nema postavljenih ponuda. Budi prvi!</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {sortiranePonude.map((ponuda, index) => {
                    const imeKorisnika = ponuda.korisnik?.ime || ponuda.korisnik?.korisnickoIme || ponuda.korisnik?.email || 'Korisnik';
                    const jeNajveca = index === 0;

                    return (
                      <div 
                        key={ponuda._id || index} 
                        className={`flex justify-between items-center p-2.5 rounded-xl border text-xs transition-all ${
                          jeNajveca 
                            ? 'bg-blue-50/80 border-blue-200/80 font-bold text-blue-950 shadow-sm' 
                            : 'bg-white border-gray-100 text-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                            jeNajveca ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {jeNajveca ? '👑' : `#${sortiranePonude.length - index}`}
                          </span>
                          <span className="font-semibold truncate max-w-[120px] sm:max-w-[160px]">
                            {imeKorisnika}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-right">
                          <span className={jeNajveca ? 'text-blue-600 text-sm' : 'text-gray-800'}>
                            {ponuda.iznos} KM
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* AKCIJA KORISNIKA */}
          <div className="border-t border-gray-100 pt-4">
            {jeAukcija ? (
              token ? (
                <form onSubmit={handleLicitiraj} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vaša ponuda (KM)</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-grow">
                        <input 
                          type="number" 
                          required
                          min={(aukcija.trenutnaCijena || aukcija.pocetnaCijena) + 1}
                          className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-sm transition-all font-bold text-gray-900 font-mono shadow-sm"
                          placeholder={`Min. ${(aukcija.trenutnaCijena || aukcija.pocetnaCijena) + 1}`}
                          value={iznosPonude}
                          onChange={(e) => setIznosPonude(e.target.value)}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">KM</div>
                      </div>
                      <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-[0_4px_14px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)] whitespace-nowrap"
                      >
                        Ponudi Cijenu 🔨
                      </button>
                    </div>
                  </div>

                  {poruka.tekst && (
                    <div className={`p-4 rounded-xl text-sm text-center font-semibold border animate-fade-in transition-all ${
                      poruka.tip === 'uspjeh' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-50' 
                        : 'bg-rose-50 text-rose-700 border-rose-100 shadow-sm shadow-rose-50'
                    }`}>
                      {poruka.tekst}
                    </div>
                  )}
                </form>
              ) : (
                <div className="bg-amber-50/60 border border-amber-100/70 p-5 rounded-2xl text-center backdrop-blur-sm">
                  <p className="text-amber-800 text-sm mb-3 font-semibold">🔒 Morate biti prijavljeni da biste licitirali na ovoj aukciji.</p>
                  <Link to="/login" className="inline-block bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm">
                    Prijavi se odmah
                  </Link>
                </div>
              )
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={() => alert('Kupovina je u obradi!')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <span>🛒</span> Kupi odmah po fiksnoj cijeni
                </button>
                <p className="text-[11px] text-gray-400 text-center font-medium">
                  Artikal se prodaje po fiksnoj cijeni i nema opciju licitiranja.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MODAL / LIGHTBOX ZA PRIKAZ UVEĆANE SLIKE SA STRELICAMA */}
      {otvorenaSlika && (
        <div 
          onClick={() => setOtvorenaSlika(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in cursor-zoom-out select-none"
        >
          {/* Dugme za zatvaranje */}
          <button 
            onClick={() => setOtvorenaSlika(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl transition-all z-10"
            title="Zatvori (Esc)"
          >
            ✕
          </button>

          {/* Lijevo dugme u modalu */}
          {listaSlika.length > 1 && (
            <button
              onClick={prethodnaSlika}
              className="absolute left-4 sm:left-8 text-white bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center text-2xl transition-all z-10"
              title="Prethodna slika (Lijeva strelica)"
            >
              ❮
            </button>
          )}

          {/* Kontejner slike */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl cursor-default flex flex-col items-center"
          >
            <img 
              src={aktivnaSlikaUrl} 
              alt={aukcija.naslov} 
              className="w-full h-full object-contain max-h-[80vh] rounded-2xl shadow-2xl"
            />
            <div className="flex items-center justify-between w-full mt-3 px-2">
              <p className="text-xs text-slate-400 font-medium truncate">
                {aukcija.naslov}
              </p>
              {listaSlika.length > 1 && (
                <p className="text-xs text-blue-400 font-mono font-bold">
                  {trenutnaSlikaIndex + 1} / {listaSlika.length}
                </p>
              )}
            </div>
          </div>

          {/* Desno dugme u modalu */}
          {listaSlika.length > 1 && (
            <button
              onClick={sljedecaSlika}
              className="absolute right-4 sm:right-8 text-white bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center text-2xl transition-all z-10"
              title="Sljedeća slika (Desna strelica)"
            >
              ❯
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AukcijaDetalji;