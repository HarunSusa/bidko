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

    // Automatski postavljamo rok trajanja aukcije na 7 dana od trenutka kreiranja
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
      
      // Vraćamo korisnika na početnu stranicu nakon uspješnog kreiranja
      navigate('/');
    } catch (err) {
      setGreska(err.response?.data?.poruka || 'Došlo je do greške pri kreiranju aukcije.');
    } finally {
      setUcitava(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-black text-gray-950 text-center mb-2">Nova Aukcija 🔨</h2>
        <p className="text-gray-500 text-center text-sm mb-6">Unesite detalje o artiklu koji želite staviti na licitaciju.</p>

        {greska && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100 text-center">
            {greska}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Naslov artikla</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 transition text-sm"
              placeholder="Npr. iPhone 15 Pro Max 256GB"
              value={naslov}
              onChange={(e) => setNaslov(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Opis artikla</label>
            <textarea 
              required
              rows="4"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 transition text-sm resize-none"
              placeholder="Detaljno opišite stanje artikla, šta dolazi uz njega..."
              value={opis}
              onChange={(e) => setOpis(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Početna cijena (KM)</label>
              <input 
                type="number" 
                required
                min="1"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 transition text-sm font-semibold"
                placeholder="0"
                value={pocetnaCijena}
                onChange={(e) => setPocetnaCijena(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kategorija</label>
              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 transition text-sm bg-white"
                value={kategorija}
                onChange={(e) => setKategorija(e.target.value)}
              >
                <option value="Elektronika">Elektronika</option>
                <option value="Vozila">Vozila</option>
                <option value="Moda">Moda</option>
                <option value="Nekretnine">Nekretnine</option>
                <option value="Ostalo">Ostalo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Link slike (URL)</label>
            <input 
              type="url" 
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 transition text-sm"
              placeholder="https://images.unsplash.com/..."
              value={slika}
              onChange={(e) => setSlika(e.target.value)}
            />
            <p className="text-gray-400 text-xs mt-1">Ostavite prazno za zadani vizual artikla.</p>
          </div>

          <button 
            type="submit" 
            disabled={ucitava}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-xl transition shadow-sm mt-4 flex justify-center items-center"
          >
            {ucitava ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Objavi Aukciju 🚀'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default KreirajAukciju;