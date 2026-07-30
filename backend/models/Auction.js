import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
  prodavac: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  naslov: { type: String, required: true, trim: true },
  opis: { type: String, required: true },
  
  // DODANO: Lokacija (bila je izostavljena pa se nije snimala u bazu)
  lokacija: { type: String, default: '' },

  slike: [{ type: String }], // Niz linkova do slika proizvoda
  kategorija: { type: String, required: true },
  
  // TIP PRODAJE & CIJENE
  tipProdaje: { 
    type: String, 
    enum: ['aukcija', 'fiksno', 'kombinovano'], 
    default: 'aukcija' 
  },
  pocetnaCijena: { type: Number, default: 0, min: 0 }, // Koristi se za aukciju
  trenutnaCijena: { type: Number, default: 0, min: 0 }, // Najviša ponuda u datom trenu
  fiksnaCijena: { type: Number, default: null }, // "Kupi odmah" cijena (opcionalno)
  
  // VREMENSKI ROK (Za aukcije)
  trajanjeDo: { 
    type: Date, 
    required: function() { return this.tipProdaje !== 'fiksno'; } 
  }, 

  // DOSTAVA
  dostava: {
    rok: { type: String, default: '1-3 dana' },
    trosak: { type: String, enum: ['kupac', 'prodavac'], default: 'kupac' },
    licnoPreuzimanje: { type: Boolean, default: false },
    gradPreuzimanja: { type: String, default: '' }
  },

  // ISPRAVLJENO: Pravilna Mongoose sintaksa za niz stringova sa default vrijednošću
  naciniPlacanja: {
    type: [String],
    enum: ['gotovina', 'ziro_racun', 'paypal', 'crypto'],
    default: ['gotovina']
  },
  
  // TAB 1: ZVANIČNE PONUDE (Samo brojevi/licitacije)
  ponude: [
    {
      korisnik: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      iznos: { type: Number, required: true },
      vrijemePonude: { type: Date, default: Date.now }
    }
  ],
  
  // TAB 2: OPŠTA DISKUSIJA (Pitanja i odgovori)
  diskusija: [
    {
      korisnik: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      tekst: { type: String, required: true, trim: true },
      vrijemeKomentara: { type: Date, default: Date.now }
    }
  ],
  
  // STATUS ARTIKLA
  status: { 
    type: String, 
    enum: ['aktivno', 'prodato', 'isteklo'], 
    default: 'aktivno' 
  },
  pobjednik: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // Kupac
}, { timestamps: true });

// Indeksi za brže pretraživanje i filtriranje u bazi
auctionSchema.index({ status: 1, trajanjeDo: 1 });
auctionSchema.index({ kategorija: 1, status: 1 });
auctionSchema.index({ prodavac: 1 });

const Auction = mongoose.model('Auction', auctionSchema);
export default Auction;