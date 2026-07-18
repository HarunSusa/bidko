import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
  prodavac: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  naslov: { type: String, required: true },
  opis: { type: String, required: true },
  slike: [{ type: String }], // Niz linkova do slika proizvoda
  kategorija: { type: String, required: true },
  
  // TIP PRODAJE & CIJENE
  tipProdaje: { 
    type: String, 
    enum: ['aukcija', 'fiksno', 'kombinovano'], 
    default: 'aukcija' 
  },
  pocetnaCijena: { type: Number, default: 0 }, // Koristi se za aukciju
  trenutnaCijena: { type: Number, default: 0 }, // Najviša ponuda u datom trenu
  fiksnaCijena: { type: Number, default: null }, // "Kupi odmah" cijena (opcionalno)
  
  // VREMENSKI ROK (Za aukcije)
  trajanjeDo: { type: Date, required: function() { return this.tipProdaje !== 'fiksno'; } }, 
  
  // TAB 1: ZVANIČNE PONUDE (Samo brojevi/licitacije)
  ponude: [
    {
      korisnik: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      iznos: { type: Number, required: true },
      vrijemePonude: { type: Date, default: Date.now }
    }
  ],
  
  // TAB 2: OPŠTA DISKUSIJA (Pitanja i odgovori)
  diskusija: [
    {
      korisnik: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      tekst: { type: String, required: true },
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

const Auction = mongoose.model('Auction', auctionSchema);
export default Auction;