import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Registracija() {
  const [ime, setIme] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState(''); // <-- 1. Dodano stanje za telefon
  const [lozinka, setLozinka] = useState('');
  const [greska, setGreska] = useState('');
  const [ucitava, setUcitava] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setGreska('');
    setUcitava(true);

    try {
      await axios.post('http://localhost:5000/api/auth/registracija', { ime, email, telefon, lozinka });
      navigate('/login');
    } catch (err) {
      setGreska(err.response?.data?.poruka || 'Greška pri registraciji.');
    } finally {
      setUcitava(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gray-50/50 dark:bg-slate-950 theme-transition">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">Novi račun 🔨</h2>
          <p className="text-gray-400 dark:text-slate-500 text-xs mt-1 font-medium">Pridružite se platformi i započnite licitiranje</p>
        </div>

        {greska && (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs mb-4 border border-red-100 dark:border-red-950/50 text-center font-semibold">
            ⚠️ {greska}
          </div>
        )}

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

          {/* 2. Dodano input polje za telefon */}
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

        <p className="text-center text-xs font-medium text-gray-400 dark:text-slate-500 mt-6">
          Već imate račun? <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Prijavite se</Link>
        </p>
      </div>
    </div>
  );
}

export default Registracija;