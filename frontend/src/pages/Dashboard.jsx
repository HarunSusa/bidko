import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';

function Dashboard() {
  const [mojeAukcije, setMojeAukcije] = useState([]);
  const [ucitava, setUcitava] = useState(true);
  const [obrisanoPoruka, setObrisanoPoruka] = useState('');

  const korisnikPodaci = localStorage.getItem('korisnik');
  const trenutniKorisnik = korisnikPodaci ? JSON.parse(korisnikPodaci) : null;
  const token = localStorage.getItem('token');

  // Funkcija za povlačenje aukcija
  const dohvatiMojeAukcije = async () => {
    try {
      const odgovor = await axios.get('http://localhost:5000/api/aukcije');
      const korisnikId = trenutniKorisnik?._id || trenutniKorisnik?.id;
      
      const filtrirane = odgovor.data.filter(
        (aukcija) => {
          const prodavacId = aukcija.prodavac?._id || aukcija.prodavac?.id || aukcija.prodavac;
          return String(prodavacId) === String(korisnikId);
        }
      );
      
      setMojeAukcije(filtrirane);
    } catch (error) {
      console.error("Greška pri učitavanju korisničkih aukcija:", error);
    } finally {
      setUcitava(false);
    }
  };

  useEffect(() => {
    if (trenutniKorisnik) {
      dohvatiMojeAukcije();
    }
  }, []);

  // Funkcija za brisanje aukcije
  const handleObrisi = async (aukcijaId) => {
    if (!window.confirm("Da li ste sigurni da želite obrisati ovu aukciju?")) {
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Pozivamo tvoj DELETE endpoint
      await axios.delete(`http://localhost:5000/api/aukcije/${aukcijaId}`, config);
      
      setObrisanoPoruka('Aukcija je uspješno obrisana.');
      
      // Automatski uklanjamo obrisanu aukciju iz state-a da se ekran odmah ažurira
      setMojeAukcije(mojeAukcije.filter(aukcija => aukcija._id !== aukcijaId));

      // Skloni poruku nakon 3 sekunde
      setTimeout(() => setObrisanoPoruka(''), 3000);
    } catch (error) {
      console.error("Greška pri brisanju aukcije:", error);
      alert(error.response?.data?.poruka || "Došlo je do greške pri brisanju.");
    }
  };

  if (!trenutniKorisnik) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Morate biti prijavljeni da biste vidjeli dashboard.</h2>
        <Link to="/login" className="text-blue-600 hover:underline mt-4 inline-block">Prijavi se</Link>
      </div>
    );
  }

  if (ucitava) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-950">Moj Dashboard 📊</h1>
          <p className="text-gray-500 text-sm mt-1">Upravljajte aukcijama koje ste postavili na platformu.</p>
        </div>
      </div>

      {obrisanoPoruka && (
        <div className="mb-6 p-3 bg-green-50 text-green-600 border border-green-100 rounded-xl text-sm text-center font-medium animate-fade-in">
          {obrisanoPoruka}
        </div>
      )}

      {mojeAukcije.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-gray-500 font-medium mb-4">Trenutno nemate aktivnih aukcija koje ste vi kreirali.</p>
          <Link 
            to="/kreiraj-aukciju" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-xl text-sm transition shadow-sm inline-block"
          >
            Kreiraj prvu aukciju +
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mojeAukcije.map((aukcija) => (
            <div key={aukcija._id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-48 w-full bg-gray-100 rounded-2xl overflow-hidden mb-4">
                  <img 
                    src={aukcija.slika || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'} 
                    alt={aukcija.naslov} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase">
                  {aukcija.kategorija}
                </span>
                <h3 className="text-lg font-black text-gray-950 mt-2 mb-1 truncate">{aukcija.naslov}</h3>
                
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 my-3">
                  <div>
                    <span className="text-gray-400 text-xs block">Trenutna cijena</span>
                    <span className="font-bold text-gray-950">{aukcija.trenutnaCijena} KM</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">Početna</span>
                    <span className="font-semibold text-gray-600">{aukcija.pocetnaCijena} KM</span>
                  </div>
                </div>

                <CountdownTimer datumIsteka={aukcija.trajanjeDo} />
              </div>

              {/* Akciona dugmad na dnu kartice */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <Link 
                  to={`/aukcija/${aukcija._id}`} 
                  className="flex-1 text-center bg-gray-950 hover:bg-blue-600 text-white font-medium py-2 rounded-xl text-sm transition shadow-sm"
                >
                  Pogledaj
                </Link>
                <button 
                  onClick={() => handleObrisi(aukcija._id)}
                  className="px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-xl text-sm transition border border-red-100"
                >
                  Obriši 🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;