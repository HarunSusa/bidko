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
  
  // Stanje za sliku (Base64 ili URL)
  const [slika, setSlika] = useState('');
  const [izvorSlike, setIzvorSlike] = useState('fajl'); // 'fajl' ili 'url'
  
  const [greska, setGreska] = useState('');
  const [ucitava, setUcitava] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Funkcija za čitanje fajla sa računara/telefona
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Provjera veličine fajla (opcionalno: npr. do 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setGreska('Slika je prevelika. Izaberite sliku manju od 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSlika(reader.result); // Sprema fajl kao Base64 string
        setGreska('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGreska('');
    setUcitava(true);

    const buduciDatum = new Date();
    buduciDatum.setDate(buduciDatum.getDate() + Number(trajanjeDana));

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const urlSlike = slika || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';

      const noviOglas = {
        tipProdaje,
        naslov,
        opis,
        kategorija,
        lokacija,
        slike: [urlSlike],
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
              Unesite detalje o artiklu i izaberite način prodaje.
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

            {/* SLIKA (UČITAVANJE ILI LINK) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Slika artikla
                </label>
                {/* Prebacivanje između uvoza fajla i Unosa URL-a */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setIzvorSlike('fajl'); setSlika(''); }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                      izvorSlike === 'fajl' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'text-slate-500'
                    }`}
                  >
                    📱 Prenesi sa uređaja
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIzvorSlike('url'); setSlika(''); }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                      izvorSlike === 'url' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'text-slate-500'
                    }`}
                  >
                    🔗 Web URL
                  </button>
                </div>
              </div>

              {izvorSlike === 'fajl' ? (
                /* INPUT ZA FAJL (RAČUNAR / TELEFON) */
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-950/50 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📁</span>
                    <p className="text-xs text-slate-400 font-medium">
                      <span className="font-bold text-blue-400">Kliknite za odabir</span> ili prevucite sliku
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">PNG, JPG, WEBP (Max 5MB)</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </label>
              ) : (
                /* INPUT ZA URL */
                <input 
                  type="url" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-medium"
                  placeholder="https://images.unsplash.com/..."
                  value={slika}
                  onChange={(e) => setSlika(e.target.value)}
                />
              )}
            </div>

            {/* PREGLED SLIKE (LIVE PREVIEW) */}
            {slika && (
              <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 flex-shrink-0">
                    <img 
                      src={slika} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => (e.target.style.display = 'none')} 
                    />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Učitana slika
                    </span>
                    <p className="text-xs text-slate-400 font-medium truncate mt-1">
                      {izvorSlike === 'fajl' ? 'Slika sa uređaja spremljena' : slika}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSlika('')}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 px-3 py-1 bg-rose-500/10 rounded-lg border border-rose-500/20"
                >
                  Ukloni
                </button>
              </div>
            )}

            {/* DUGME ZA SLANJE */}
            <div className="pt-2">
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