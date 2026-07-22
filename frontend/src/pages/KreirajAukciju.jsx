import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function KreirajAukciju() {
  const [naslov, setNaslov] = useState('');
  const [opis, setOpis] = useState('');
  const [pocetnaCijena, setPocetnaCijena] = useState('');
  const [kategorija, setKategorija] = useState('Elektronika');
  const [slika, setSlika] = useState('');
  const [greska, setGreska] = useState('');
  const [ucitava, setUcitava] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGreska('');
    setUcitava(true);

    const buduciDatum = new Date();
    buduciDatum.setDate(buduciDatum.getDate() + 7);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const novaAukcija = {
        naslov,
        opis,
        pocetnaCijena: Number(pocetnaCijena),
        kategorija,
        slika: slika || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        trajanjeDo: buduciDatum.toISOString()
      };

      await axios.post('http://localhost:5000/api/aukcije', novaAukcija, config);
      navigate('/');
    } catch (err) {
      setGreska(err.response?.data?.poruka || 'Došlo je do greške pri kreiranju aukcije.');
    } finally {
      setUcitava(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 sm:py-16 relative overflow-hidden theme-transition">
      
      {/* AMBIJENTALNO SVJETLO U POZADINI */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[180px] rounded-full pointer-events-none"></div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-slate-800/80 shadow-2xl">
          
          {/* ZAGLAVLJE FORME */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Nova Aukcija
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mx-auto">
              Unesite detalje o artiklu kako biste pokrenuli novu licitaciju.
            </p>
          </div>

          {/* OBAVJEŠTENJE O GREŠCI */}
          {greska && (
            <div className="bg-rose-500/10 text-rose-400 px-4 py-3 rounded-2xl text-xs border border-rose-500/20 text-center font-semibold mb-6 flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>{greska}</span>
            </div>
          )}

          {/* FORMA */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* NASLOV */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                Naslov artikla
              </label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-medium"
                placeholder="Npr. iPhone 15 Pro Max 256GB"
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
                placeholder="Detaljno opišite stanje artikla, garanciju, lokaciju ili uslove preuzimanja..."
                value={opis}
                onChange={(e) => setOpis(e.target.value)}
              />
            </div>

            {/* POČETNA CIJENA I KATEGORIJA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Početna cijena (KM)
                </label>
                <input 
                  type="number" 
                  required
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-bold font-mono"
                  placeholder="0"
                  value={pocetnaCijena}
                  onChange={(e) => setPocetnaCijena(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Kategorija
                </label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-bold cursor-pointer"
                  value={kategorija}
                  onChange={(e) => setKategorija(e.target.value)}
                
                >
                  <option value="Kolekcionarstvo">Kolekcionarstvo</option>
                  <option value="Antikviteti">Antikviteti</option>
                  <option value="Umjetnine">Umjetnine</option>
                  <option value="Elektronika">Elektronika</option>
                  <option value="Vozila">Vozila</option>
                  <option value="Moda">Moda</option>
                  <option value="Nekretnine">Nekretnine</option>
                  <option value="Ostalo">Ostalo</option>
                </select>
              </div>
            </div>

            {/* URL SLIKE */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                URL Slike artikla
              </label>
              <input 
                type="url" 
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-medium"
                placeholder="https://images.unsplash.com/..."
                value={slika}
                onChange={(e) => setSlika(e.target.value)}
              />
            </div>

            {/* PREGLED SLIKE (LIVE PREVIEW) */}
            {slika && (
              <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex items-center gap-3">
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
                    Pregled slike
                  </span>
                  <p className="text-xs text-slate-400 font-medium truncate mt-1">{slika}</p>
                </div>
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
                  'Objavi Aukciju'
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