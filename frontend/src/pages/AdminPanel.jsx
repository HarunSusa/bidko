import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Trash2, User, Mail, Phone, AlertCircle } from 'lucide-react';

function AdminPanel() {
  const [korisnici, setKorisnici] = useState([]);
  const [poruka, setPoruka] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    dohvatiKorisnike();
  }, []);

  const dohvatiKorisnike = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('http://localhost:5000/api/admin/korisnici', config);
      setKorisnici(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleObrisiKorisnika = async (id) => {
    if (!window.confirm("Da li ste sigurni da želite obrisati ovog korisnika i sve njegove aukcije?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/admin/korisnici/${id}`, config);
      setPoruka('Korisnik uspješno uklonjen.');
      setKorisnici(korisnici.filter(k => k._id !== id));
      
      setTimeout(() => setPoruka(''), 4000);
    } catch (err) {
      alert('Greška pri brisanju korisnika.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F3F1EA] p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* NASLOV I ZAGLAVLJE */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <h1 className="text-3xl font-black italic tracking-tight text-[#F3F1EA] flex items-center gap-3" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              <Shield className="text-[#D4AF37]" size={30} />
              Admin Panel
            </h1>
            <p className="text-sm text-[#9A9CA6] mt-1">Upravljanje registrovanim korisnicima i nalozima</p>
          </div>
          <span className="text-xs font-bold text-[#E9C25A] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3.5 py-1.5 rounded-full uppercase tracking-widest">
            Ukupno: {korisnici.length}
          </span>
        </div>

        {/* NOTIFIKACIJA */}
        {poruka && (
          <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium">
            <AlertCircle size={18} />
            {poruka}
          </div>
        )}

        {/* TABELA KORISNIKA */}
        <div className="bg-[#14171D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1B1F27] border-b border-white/10 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                  <th className="p-5">Korisnik</th>
                  <th className="p-5">E-mail adresa</th>
                  <th className="p-5">Telefon</th>
                  <th className="p-5">Uloga</th>
                  <th className="p-5 text-right">Akcija</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm font-medium">
                {korisnici.map((k) => (
                  <tr key={k._id} className="hover:bg-white/[0.02] transition-colors">
                    
                    {/* IME */}
                    <td className="p-5 text-[#F3F1EA] font-semibold">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#E9C25A] font-bold text-xs">
                          {k.ime ? k.ime.charAt(0).toUpperCase() : 'U'}
                        </div>
                        {k.ime}
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="p-5 text-[#D9DAE0]">
                      <div className="flex items-center gap-2">
                        <Mail size={15} className="text-[#6B6D76]" />
                        {k.email}
                      </div>
                    </td>

                    {/* TELEFON */}
                    <td className="p-5 text-[#9A9CA6]">
                      <div className="flex items-center gap-2">
                        <Phone size={15} className="text-[#6B6D76]" />
                        {k.telefon || 'Nije uneseno'}
                      </div>
                    </td>

                    {/* ULOGA */}
                    <td className="p-5">
                      {k.isAdmin ? (
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          Admin
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          Korisnik
                        </span>
                      )}
                    </td>

                    {/* DUGME BRISANJE */}
                    <td className="p-5 text-right">
                      {!k.isAdmin ? (
                        <button
                          onClick={() => handleObrisiKorisnika(k._id)}
                          className="inline-flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/60 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all active:scale-95"
                        >
                          <Trash2 size={14} />
                          Obriši
                        </button>
                      ) : (
                        <span className="text-xs text-[#6B6D76] italic">Zaštićen</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminPanel;