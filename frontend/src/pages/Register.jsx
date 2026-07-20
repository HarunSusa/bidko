import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [ime, setIme] = useState('');
  const [email, setEmail] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [greska, setGreska] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setGreska('');
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        ime,
        email,
        lozinka
      });
      // Nakon uspješne registracije, šaljemo korisnika na login
      navigate('/login');
    } catch (err) {
      setGreska(err.response?.data?.poruka || 'Došlo je do greške pri registraciji.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <h2 className="text-3xl font-black text-gray-950 text-center mb-2">Kreirajte račun</h2>
        <p className="text-gray-500 text-center text-sm mb-6">Pridružite se Bidko zajednici i započnite licitiranje.</p>

        {greska && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100 text-center">
            {greska}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Vaše ime</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 transition text-sm"
              placeholder="Adnan"
              value={ime}
              onChange={(e) => setIme(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email adresa</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 transition text-sm"
              placeholder="ime@primjer.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Lozinka</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 transition text-sm"
              placeholder="••••••••"
              value={lozinka}
              onChange={(e) => setLozinka(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition shadow-sm mt-2">
            Registruj se
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Već imate račun?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Prijavite se
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;