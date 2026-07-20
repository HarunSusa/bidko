import React, { useState, useEffect } from 'react';

function CountdownTimer({ datumIsteka }) {
  const izracunajPreostaloVrijeme = () => {
    const razlika = +new Date(datumIsteka) - +new Date();
    let preostalo = {};

    if (razlika > 0) {
      preostalo = {
        dani: Math.floor(razlika / (1000 * 60 * 60 * 24)),
        sati: Math.floor((razlika / (1000 * 60 * 60)) % 24),
        minute: Math.floor((razlika / 1000 / 60) % 60),
        sekunde: Math.floor((razlika / 1000) % 60),
      };
    }
    return preostalo;
  };

  const [vrijeme, setVrijeme] = useState(izracunajPreostaloVrijeme());

  useEffect(() => {
    const tajmer = setInterval(() => {
      setVrijeme(izracunajPreostaloVrijeme());
    }, 1000);

    return () => clearInterval(tajmer);
  }, [datumIsteka]);

  const formatirajBroj = (broj) => String(broj).padStart(2, '0');

  // Ako je aukcija istekla
  if (Object.keys(vrijeme).length === 0) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
        🔴 Aukcija je završena
      </span>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-amber-50 border border-amber-100 p-3 rounded-xl mt-3">
      <span className="text-amber-800 text-xs font-semibold uppercase tracking-wider">Ističe za:</span>
      <div className="flex space-x-1 font-mono text-sm font-bold text-amber-950">
        {vrijeme.dani > 0 && <span>{vrijeme.dani}d</span>}
        <span>{formatirajBroj(vrijeme.sati)}h</span>
        <span>:</span>
        <span>{formatirajBroj(vrijeme.minute)}m</span>
        <span>:</span>
        <span className="text-amber-600 animate-pulse">{formatirajBroj(vrijeme.sekunde)}s</span>
      </div>
    </div>
  );
}

export default CountdownTimer;