import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Registracija() {
  const [korak, setKorak] = useState(1); // 1 = Registracijska forma, 2 = Verifikacija koda
  const [ime, setIme] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [kod, setKod] = useState('');

  const [greska, setGreska] = useState('');
  const [poruka, setPoruka] = useState('');
  const [ucitava, setUcitava] = useState(false);
  const navigate = useNavigate();

  // 1. KORAK: Slanje registracijskih podataka
  const handleRegister = async (e) => {
    e.preventDefault();
    setGreska('');
    setPoruka('');
    setUcitava(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/registracija', { 
        ime, 
        email, 
        telefon, 
        lozinka 
      });
      
      setPoruka(res.data.poruka || 'Kod za verifikaciju je poslan na vaš e-mail.');
      setKorak(2); // Prebacivanje na formu za verifikaciju koda
    } catch (err) {
      setGreska(err.response?.data?.poruka || 'Greška pri registraciji.');
    } finally {
      setUcitava(false);
    }
  };

  // 2. KORAK: Verifikacija poslanog koda sa e-maila
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setGreska('');
    setUcitava(true);

    try {
      await axios.post('http://localhost:5000/api/auth/verifikuj-email', { 
        email, 
        kod 
      });
      
      alert('E-mail je uspješno verifikovan! Sada se možete prijaviti.');
      navigate('/login');
    } catch (err) {
      setGreska(err.response?.data?.poruka || 'Greška pri verifikaciji koda.');
    } finally {
      setUcitava(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gray-50/50 dark:bg-slate-950 theme-transition">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        
        {/* ZAGLAVLJE */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">
            {korak === 1 ? 'Novi račun 🔨' : 'Potvrdite e-mail ✉️'}
          </h2>
          <p className="text-gray-400 dark:text-slate-500 text-xs mt-1 font-medium">
            {korak === 1 
              ? 'Pridružite se platformi i započnite licitiranje' 
              : `Poslali smo verifikacijski kod na ${email}`}
          </p>
        </div>

        {/* NOTIFIKACIJE O GREŠCI ILI USPEHU */}
        {greska && (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs mb-4 border border-red-100 dark:border-red-950/50 text-center font-semibold animate-fade-in">
            ⚠️ {greska}
          </div>
        )}

        {poruka && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl text-xs mb-4 border border-emerald-100 dark:border-emerald-950/50 text-center font-semibold animate-fade-in">
            ✅ {poruka}
          </div>
        )}

        {/* KORAK 1: FORMA ZA UNOS PODATAKA */}
        {korak === 1 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Ime i prezime</label>
              <input 
                type="text" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-950/30 text-xs font-medium transition-all"
                placeholder="Npr. Harun Susa"
                value={ime}
                onChange={(e) => setIme(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">E-pošta</label>
              <input 
                type="email" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-950/30 text-xs font-medium transition-all"
                placeholder="ime@domena.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Broj telefona</label>
              <input 
                type="tel" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-950/30 text-xs font-medium transition-all"
                placeholder="Npr. 061123456"
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Lozinka</label>
              <input 
                type="password" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-950/30 text-xs font-medium transition-all"
                placeholder="Minimalno 6 karaktera"
                value={lozinka}
                onChange={(e) => setLozinka(e.target.value)}
              />
            </div>

            <button 
              type="submit" disabled={ucitava}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/10 text-xs uppercase tracking-widest active:scale-[0.99] flex justify-center items-center mt-2"
            >
              {ucitava ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Registruj se ✨'}
            </button>
          </form>
        )}

        {/* KORAK 2: FORMA ZA UNOS VERIFIKACIJSKOG KODA */}
        {korak === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 text-center">
                Unesite 6-cifreni verifikacijski kod
              </label>
              <input 
                type="text" required maxLength="6"
                className="w-full px-4 py-3 text-center text-xl font-bold tracking-[0.3em] rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-950/30 transition-all"
                placeholder="123456"
                value={kod}
                onChange={(e) => setKod(e.target.value)}
              />
            </div>

            <button 
              type="submit" disabled={ucitava}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/10 text-xs uppercase tracking-widest active:scale-[0.99] flex justify-center items-center mt-2"
            >
              {ucitava ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Potvrdi Kod ✅'}
            </button>

            <button 
              type="button" 
              onClick={() => { setKorak(1); setGreska(''); setPoruka(''); }}
              className="w-full text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-center block mt-3 transition-colors"
            >
              ← Izmijeni podatke / Nazad
            </button>
          </form>
        )}

        <p className="text-center text-xs font-medium text-gray-400 dark:text-slate-500 mt-6">
          Već imate račun? <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Prijavite se</Link>
        </p>

      </div>
    </div>
  );
}

export default Registracija;