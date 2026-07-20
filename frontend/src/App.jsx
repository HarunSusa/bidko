import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Bidko Aukcije 🔨</h1>
        <p className="text-gray-600">
          Uspješno smo podigli React frontend sa Tailwind CSS-om! Spremni smo za povezivanje sa backendom.
        </p>
        <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition">
          Idemo dalje!
        </button>
      </div>
    </div>
  );
}

export default App;
