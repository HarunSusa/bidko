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

  const token = localStorage.getItem('token');

  // Funkcija za povlačenje detalja aukcije
  const dohvatiAukciju = async () => {
    try {
      const odgovor = await axios.get(`http://localhost:5000/api/aukcije/${id}`);
      setAukcije(odgovor.data);
    } catch (error) {
      console.error("Greška pri učitavanju aukcije:", error);
    } finally {
      setUcitava(false);
    }
  };

  useEffect(() => {
    dohvatiAukciju();
  }, [id]);

  // Slanje nove ponude (Licitiranje)
  const handleLicitiraj = async (e) => {
    e.preventDefault();
    setPoruka({ tip: '', tekst: '' });

    // JS provjera vrijednosti prije slanja na backend
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

      // USKLAĐENO SA BACKENDOM: Promijenjeno sa /licitiraj na /ponuda
      const odgovor = await axios.post(
        `http://localhost:5000/api/aukcije/${id}/ponuda`,
        { iznos: Number(iznosPonude) },
        config
      );

      setPoruka({ tip: 'uspjeh', tekst: 'Uspješno ste postavili ponudu! Trenutno vodite.' });
      setIznosPonude('');
      dohvatiAukciju(); // Ponovo povuci podatke sa backenda da se osvježi cijena na ekranu
    } catch (error) {
      setPoruka({ 
        tip: 'greska', 
        tekst: error.response?.data?.poruka || 'Došlo je do greške pri slanju ponude.' 
      });
    }
  };

  if (ucitava) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!aukcija) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Aukcija nije pronađena.</h2>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Povratak na početnu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition inline-flex items-center mb-6">
        ← Nazad na sve aukcije
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
        {/* Lijeva strana: Slika */}
        <div className="rounded-2xl overflow-hidden bg-gray-100 h-80 md:h-[400px]">
          <img 
            src={aukcija.slika || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'} 
            alt={aukcija.naslov} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Desna strana: Detalji i Licitacija */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 mb-3">
              {aukcija.kategorija}
            </span>
            <h1 className="text-3xl font-black text-gray-950 mb-2">{aukcija.naslov}</h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{aukcija.opis}</p>
            <div className="mb-6">
                <CountdownTimer datumIsteka={aukcija.trajanjeDo} />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-xs font-medium">Trenutna cijena</p>
                <p className="text-2xl font-black text-gray-950">{aukcija.trenutnaCijena} KM</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium">Početna cijena</p>
                <p className="text-lg font-bold text-gray-600">{aukcija.pocetnaCijena} KM</p>
              </div>
            </div>
          </div>

          {/* Sekcija za licitiranje */}
          <div className="border-t border-gray-100 pt-6">
            {token ? (
              <form onSubmit={handleLicitiraj} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vaša ponuda (KM)</label>
                  <div className="flex gap-3">
                    <input 
                      type="number" 
                      required
                      min={aukcija.trenutnaCijena + 1}
                      className="flex-grow px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 text-sm transition font-semibold"
                      placeholder={`Unesite više od ${aukcija.trenutnaCijena}`}
                      value={iznosPonude}
                      onChange={(e) => setIznosPonude(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition shadow-sm whitespace-nowrap">
                      Ponudi Cijenu 🔨
                    </button>
                  </div>
                </div>

                {poruka.tekst && (
                  <div className={`p-3 rounded-xl text-sm text-center border ${
                    poruka.tip === 'uspjeh' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {poruka.tekst}
                  </div>
                )}
              </form>
            ) : (
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
                <p className="text-amber-800 text-sm mb-2 font-medium">Morate biti prijavljeni da biste licitirali.</p>
                <Link to="/login" className="inline-block bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition">
                  Prijavi se odmah
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AukcijaDetalji;