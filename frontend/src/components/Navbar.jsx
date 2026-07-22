import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, LayoutDashboard, LogOut } from 'lucide-react';

// Dodaj u index.html (u <head>), za font logotipa:
// <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,700;1,900&display=swap" />

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const korisnikPodaci = localStorage.getItem('korisnik');
  const korisnik = korisnikPodaci ? JSON.parse(korisnikPodaci) : null;

  const inicijali = korisnik?.ime
    ? korisnik.ime.split(' ').map((d) => d[0]).join('').slice(0, 2).toUpperCase()
    : 'BK';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="relative bg-[#0B0D10]/95 backdrop-blur-xl sticky top-0 z-50 shadow-[0_1px_0_0_rgba(212,175,55,0.15)]">
      {/* suptilna zlatna linija na dnu */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between h-20 items-center">

          {/* LOGO */}
          <Link to="/" className="flex-shrink-0 flex items-center group">
            <span
              className="text-[26px] leading-none font-black italic text-[#F3F1EA] tracking-tight group-hover:text-[#E9C25A] transition-colors duration-300"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Bidko<span className="text-[#D4AF37] not-italic">.</span>
            </span>
          </Link>

          {/* MENI */}
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="flex items-center justify-center text-[#9A9CA6] hover:text-[#F3F1EA] font-semibold text-[11px] uppercase tracking-[0.2em]
                         px-4 py-2.5 rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#D4AF37]/30 transition-all"
            >
              Aukcije
            </Link>

            {token && korisnik ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/kreiraj-aukciju"
                  className="group flex items-center gap-2 text-[11px] font-bold text-[#0B0D10] bg-gradient-to-b from-[#E9C25A] to-[#C89A2E] hover:from-[#F0CE72] hover:to-[#D4AF37] px-4 py-2.5 rounded-md transition-all uppercase tracking-[0.15em] active:scale-[0.97]"
                >
                  <Gavel
                    size={13}
                    strokeWidth={2.5}
                    className="transition-transform duration-200 group-hover:-rotate-[24deg] group-active:rotate-0"
                  />
                  Nova aukcija
                </Link>

                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#D4AF37]/30 transition-all"
                >
                  <span className="relative flex items-center justify-center w-7 h-7 rounded-md bg-[#1B1F27] border border-[#D4AF37]/25 text-[10px] font-bold text-[#E9C25A]">
                    {inicijali}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0B0D10]" />
                  </span>
                  <span className="text-[12px] font-semibold text-[#D9DAE0] max-w-[100px] truncate">
                    {korisnik.ime || 'Profil'}
                  </span>
                  <LayoutDashboard size={13} className="text-[#6B6D76]" />
                </Link>

                <button
                  onClick={handleLogout}
                  aria-label="Odjava"
                  className="flex items-center justify-center w-10 h-10 rounded-md border border-white/10 bg-white/[0.03] text-[#6B6D76] hover:text-[#E8677B] hover:border-[#E8677B]/30 hover:bg-[#E8677B]/10 transition-all"
                >
                  <LogOut size={15} strokeWidth={2.2} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center text-[11px] font-bold text-[#0B0D10] bg-[#F3F1EA] hover:bg-[#E9C25A] px-6 py-2.5 rounded-md transition-all uppercase tracking-[0.2em] active:scale-[0.97]"
              >
                Prijava
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;