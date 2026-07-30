import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function KreirajAukciju() {
  const [tipProdaje, setTipProdaje] = useState('aukcija'); 
  const [naslov, setNaslov] = useState('');
  const [opis, setOpis] = useState('');
  const [cijena, setCijena] = useState('');
  const [kategorija, setKategorija] = useState('Antikviteti');
  const [lokacija, setLokacija] = useState('');
  const [trajanjeDana, setTrajanjeDana] = useState('7');
  
  // Stanje za VIŠE slika (niz Base64 stringova ili URL-ova)
  const [slike, setSlike] = useState([]);
  const [urlUnos, setUrlUnos] = useState('');
  const [izvorSlike, setIzvorSlike] = useState('fajl'); // 'fajl' ili 'url'

  // Novo dodana stanja za Dostavu i Plaćanje
  const [rokDostave, setRokDostave] = useState('1-3 dana');
  const [trosakDostave, setTrosakDostave] = useState('kupac'); // 'kupac' ili 'prodavac'
  const [licnoPreuzimanje, setLicnoPreuzimanje] = useState(false);
  const [gradPreuzimanja, setGradPreuzimanja] = useState('');
  const [naciniPlacanja, setNaciniPlacanja] = useState(['gotovina']);
  
  const [greska, setGreska] = useState('');
  const [ucitava, setUcitava] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Funkcija za hendlanje višestrukog odabira načina plaćanja
  const handlePlacanjeChange = (id) => {
    setNaciniPlacanja(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Funkcija za dodavanje više fajlova sa uređaja odjednom
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Provjera veličine fajlova (max 5MB po slici)
    const preveliki = files.some(file => file.size > 5 * 1024 * 1024);
    if (preveliki) {
      setGreska('Jedna ili više slika prelaze 5MB. Odaberite manje slike.');
      return;
    }

    setGreska('');
    
    // Čitanje svih odabranih fajlova
    const ucitaniPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(ucitaniPromises).then(noveSlikeBase64 => {
      setSlike(prev => [...prev, ...noveSlikeBase64]);
    });

    // Resetuj input vrijednost kako bi mogao ponovo učitati isti fajl po potrebi
    e.target.value = '';
  };

  // Funkcija za ručno dodavanje slike putem URL-a
  const handleDodajUrl = () => {
    if (!urlUnos.trim()) return;
    setSlike(prev => [...prev, urlUnos.trim()]);
    setUrlUnos('');
  };

  // Uklanjanje pojedinačne slike iz niza
  const handleUkloniSliku = (indexZaUklanjanje) => {
    setSlike(prev => prev.filter((_, index) => index !== indexZaUklanjanje));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGreska('');

    if (naciniPlacanja.length === 0) {
      setGreska('Molimo odaberite bar jedan način plaćanja.');
      return;
    }

    setUcitava(true);

    const buduciDatum = new Date();
    buduciDatum.setDate(buduciDatum.getDate() + Number(trajanjeDana));

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Ako korisnik nije učitao nijednu sliku, koristi se podrazumijevana slika
      const finalneSlike = slike.length > 0 
        ? slike 
        : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'];

      const noviOglas = {
        tipProdaje,
        naslov,
        opis,
        kategorija,
        lokacija,
        slike: finalneSlike,
        // Dodani novi detalji o dostavi i plaćanju u payload:
        dostava: {
          rok: rokDostave,
          trosak: trosakDostave,
          licnoPreuzimanje,
          gradPreuzimanja: licnoPreuzimanje ? gradPreuzimanja : ''
        },
        naciniPlacanja,
        ...(tipProdaje === 'aukcija' ? {
          pocetnaCijena: Number(cijena),
          trenutnaCijena: Number(cijena),
          trajanjeDo: buduciDatum.toISOString()
        } : {
          fiksnaCijena: Number(cijena),
          pocetnaCijena: Number(cijena)
        })
      };

      await axios.post('http://localhost:5000/api/aukcije', noviOglas, config);
      navigate('/');
    } catch (err) {
      setGreska(err.response?.data?.poruka || 'Došlo je do greške pri kreiranju oglasa.');
    } finally {
      setUcitava(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 sm:py-16 relative overflow-hidden theme-transition">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[180px] rounded-full pointer-events-none"></div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-slate-800/80 shadow-2xl">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              {tipProdaje === 'aukcija' ? 'Nova Aukcija' : 'Novi Oglas sa Fiksnom Cijenom'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mx-auto">
              Unesite detalje o artiklu, dostavi i dodajte slike.
            </p>
          </div>

          {greska && (
            <div className="bg-rose-500/10 text-rose-400 px-4 py-3 rounded-2xl text-xs border border-rose-500/20 text-center font-semibold mb-6 flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>{greska}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* ODABIR TIPA PRODAJE */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                Tip prodaje
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTipProdaje('aukcija')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    tipProdaje === 'aukcija'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Aukcija (Licitacija)
                </button>
                <button
                  type="button"
                  onClick={() => setTipProdaje('fiksno')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    tipProdaje === 'fiksno'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🏷️ Fiksna Cijena
                </button>
              </div>
            </div>

            {/* NASLOV */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                Naslov artikla
              </label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-medium"
                placeholder="Npr. Stari džepni sat iz 1920. godine"
                value={naslov}
                onChange={(e) => setNaslov(e.target.value)}
              />
            </div>

            {/* OPIS */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                Opis artikla
              </label>
              <textarea 
                required
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-medium resize-none leading-relaxed"
                placeholder="Detaljno opišite stanje artikla, porijeklo, očuvanost i uslove slanja..."
                value={opis}
                onChange={(e) => setOpis(e.target.value)}
              />
            </div>

            {/* CIJENA I TRAJANJE */}
            <div className={`grid grid-cols-1 ${tipProdaje === 'aukcija' ? 'sm:grid-cols-2' : ''} gap-4`}>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  {tipProdaje === 'aukcija' ? 'Početna cijena (KM)' : 'Fiksna cijena (KM)'}
                </label>
                <input 
                  type="number" 
                  required
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-bold font-mono"
                  placeholder="0"
                  value={cijena}
                  onChange={(e) => setCijena(e.target.value)}
                />
              </div>

              {tipProdaje === 'aukcija' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    Trajanje aukcije
                  </label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-bold cursor-pointer"
                    value={trajanjeDana}
                    onChange={(e) => setTrajanjeDana(e.target.value)}
                  >
                    <option value="3">3 Dana</option>
                    <option value="5">5 Dana</option>
                    <option value="7">7 Dana</option>
                    <option value="10">10 Dana</option>
                    <option value="14">14 Dana</option>
                    <option value="30">30 Dana</option>
                  </select>
                </div>
              )}
            </div>

            {/* KATEGORIJA I LOKACIJA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Kategorija
                </label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-bold cursor-pointer"
                  value={kategorija}
                  onChange={(e) => setKategorija(e.target.value)}
                >
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

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Lokacija / Mjesto
                </label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-medium"
                  placeholder="Npr. Sarajevo, Banja Luka..."
                  value={lokacija}
                  onChange={(e) => setLokacija(e.target.value)}
                />
              </div>
            </div>

            {/* SEKCIJA ZA SLIKE */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Slike artikla ({slike.length})
                </label>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIzvorSlike('fajl')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                      izvorSlike === 'fajl' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'text-slate-500'
                    }`}
                  >
                    📱 Sa uređaja
                  </button>
                  <button
                    type="button"
                    onClick={() => setIzvorSlike('url')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                      izvorSlike === 'url' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'text-slate-500'
                    }`}
                  >
                    🔗 Web URL
                  </button>
                </div>
              </div>

              {izvorSlike === 'fajl' ? (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-950/50 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-4 pb-5">
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🖼️</span>
                    <p className="text-xs text-slate-400 font-medium">
                      <span className="font-bold text-blue-400">Kliknite za odabir više slika</span> ili ih prevucite
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">PNG, JPG, WEBP (Moguće odabrati više slika)</p>
                  </div>
                  <input 
                    type="file" 
                    multiple
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </label>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    className="flex-grow px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-medium"
                    placeholder="https://images.unsplash.com/..."
                    value={urlUnos}
                    onChange={(e) => setUrlUnos(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleDodajUrl}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 rounded-xl transition-all"
                  >
                    Dodaj
                  </button>
                </div>
              )}
            </div>

            {/* PREGLED SVIH UČITANIH SLIKA */}
            {slike.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Učitane slike (Prva slika će biti glavna):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                  {slike.map((s, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                      <img 
                        src={s} 
                        alt={`Slika ${index + 1}`} 
                        className="w-full h-full object-cover" 
                        onError={(e) => (e.target.style.display = 'none')} 
                      />
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-blue-600 text-[8px] font-bold px-1.5 py-0.5 rounded text-white shadow">
                          Glavna
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleUkloniSliku(index)}
                        className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        title="Ukloni sliku"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEKCIJA: DOSTAVA I PLAĆANJE */}
            <div className="border-t border-slate-800 pt-6 mt-6 space-y-5">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-wider">
                🚚 Dostava i Plaćanje
              </h3>

              {/* ROK DOSTAVE & TROŠKOVI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    Rok dostave
                  </label>
                  <select 
                    value={rokDostave}
                    onChange={(e) => setRokDostave(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 focus:outline-none focus:border-blue-500 text-xs font-bold cursor-pointer"
                  >
                    <option value="1-3 dana">1 - 3 radna dana</option>
                    <option value="3-5 dana">3 - 5 radnih dana</option>
                    <option value="5-10 dana">5 - 10 radnih dana</option>
                    <option value="10+ dana">Više od 10 dana (po narudžbi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    Troškove dostave snosi
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setTrosakDostave('kupac')}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        trosakDostave === 'kupac' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Kupac
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrosakDostave('prodavac')}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        trosakDostave === 'prodavac' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Prodavac (Besplatno)
                    </button>
                  </div>
                </div>
              </div>

              {/* LIČNO PREUZIMANJE */}
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={licnoPreuzimanje}
                    onChange={(e) => setLicnoPreuzimanje(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-xs font-bold text-slate-200">Moguće lično preuzimanje</span>
                </label>

                {licnoPreuzimanje && (
                  <input 
                    type="text"
                    placeholder="Navedite grad/lokaciju za preuzimanje (npr. Sarajevo - Otoka)"
                    value={gradPreuzimanja}
                    onChange={(e) => setGradPreuzimanja(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>

              {/* NAČIN PLAĆANJA */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Prihvaćeni načini plaćanja (Odaberite bar jedan)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'gotovina', label: '💵 Gotovina / Pouzećem' },
                    { id: 'ziro_racun', label: '💳 Žiro račun / Banka' },
                    { id: 'paypal', label: '🅿️ PayPal' },
                    { id: 'crypto', label: '₿ Kripto' }
                  ].map((metoda) => (
                    <label 
                      key={metoda.id}
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                        naciniPlacanja.includes(metoda.id)
                          ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={naciniPlacanja.includes(metoda.id)}
                        onChange={() => handlePlacanjeChange(metoda.id)}
                        className="hidden" 
                      />
                      <span>{metoda.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* DUGME ZA SLANJE (Prebačeno na kraj forme) */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={ucitava}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-600/10 active:scale-[0.99] uppercase tracking-wider text-xs flex justify-center items-center"
              >
                {ucitava ? (
                  <div className="w-5 h-5 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
                  </div>
                ) : (
                  tipProdaje === 'aukcija' ? 'Objavi Aukciju' : 'Objavi Oglas'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default KreirajAukciju;