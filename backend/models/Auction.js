import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
  prodavac: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  naslov: { type: String, required: true, trim: true },
  opis: { type: String, required: true },
  
  lokacija: { type: String, default: '' },
  slike: [{ type: String }],
  kategorija: { type: String, required: true },
  
  // TIP PRODAJE & CIJENE
  tipProdaje: { 
    type: String, 
    enum: ['aukcija', 'fiksno', 'kombinovano'], 
    default: 'aukcija' 
  },
  pocetnaCijena: { type: Number, default: 0, min: 0 },
  trenutnaCijena: { type: Number, default: 0, min: 0 },
  fiksnaCijena: { type: Number, default: null },
  
  // VREMENSKI ROK
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

  naciniPlacanja: {
    type: [String],
    enum: ['gotovina', 'ziro_racun', 'paypal', 'crypto'],
    default: ['gotovina']
  },
  
  // TAB 1: ZVANIČNE PONUDE
  ponude: [
    {
      korisnik: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      iznos: { type: Number, required: true },
      vrijemePonude: { type: Date, default: Date.now }
    }
  ],
  
  // TAB 2: OPŠTA DISKUSIJA
  diskusija: [
    {
      korisnik: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      tekst: { type: String, required: true, trim: true },
      vrijemeKomentara: { type: Date, default: Date.now }
    }
  ],
  
  // STATUS ARTIKLA & AUTOMATIZACIJA
  status: { 
    type: String, 
    enum: ['aktivno', 'prodato', 'isteklo', 'zavrseno'], 
    default: 'aktivno' 
  },
  pobjednik: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  
  // NOVO: Polje za praćenje poslanih e-mail obavještenja
  obavjestenjePoslano: { type: Boolean, default: false }
}, { timestamps: true });

// Indeksi za brže pretraživanje u bazi
auctionSchema.index({ status: 1, trajanjeDo: 1 });
auctionSchema.index({ kategorija: 1, status: 1 });
auctionSchema.index({ prodavac: 1 });

const Auction = mongoose.model('Auction', auctionSchema);

export default Auction;