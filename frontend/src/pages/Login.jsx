import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [greska, setGreska] = useState('');
  const [ucitava, setUcitava] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setGreska('');
    setUcitava(true);

    try {
      const odgovor = await axios.post('http://localhost:5000/api/korisnici/login', { email, lozinka });
      localStorage.setItem('token', odgovor.data.token);
      localStorage.setItem('korisnik', JSON.stringify(odgovor.data.korisnik));
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setGreska(err.response?.data?.poruka || 'Pogrešan email ili lozinka.');
    } finally {
      setUcitava(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gray-50/50 dark:bg-slate-950 theme-transition">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-black tracking-wider">B</div>
          <h2 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">Dobrodošli nazad</h2>
          <p className="text-gray-400 dark:text-slate-500 text-xs mt-1 font-medium">Unesite podatke za pristup Bidko platformi</p>
        </div>

        {greska && (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs mb-5 border border-red-100 dark:border-red-950/50 text-center font-semibold animate-fade-in">
            ⚠️ {greska}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Lozinka</label>
              <Link to="/zaboravljena-lozinka" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">Zaboravili ste lozinku?</Link>
            </div>
            <input 
              type="password" required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-950/30 text-xs font-medium transition-all"
              placeholder="••••••••"
              value={lozinka}
              onChange={(e) => setLozinka(e.target.value)}
            />
          </div>

          <button 
            type="submit" disabled={ucitava}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/10 text-xs uppercase tracking-widest active:scale-[0.99] flex justify-center items-center mt-2"
          >
            {ucitava ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Prijavi se 🚀'}
          </button>
        </form>

        <p className="text-center text-xs font-medium text-gray-400 dark:text-slate-500 mt-6">
          Nemate korisnički račun? <Link to="/registracija" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Registrujte se</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;