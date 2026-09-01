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
  fiksnaCijena: { 
    type: Number, 
    default: null,
    validate: {
      validator: function(val) {
        if (this.tipProdaje === 'fiksno' || this.tipProdaje === 'kombinovano') {
          return val !== null && val > 0;
        }
        return true;
      },
      message: 'Fiksna cijena je obavezna za fiksnu i kombinovanu prodaju.'
    }
  },
  
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
  
  // TAB 1: PONUDE
  ponude: [
    {
      korisnik: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      iznos: { type: Number, required: true },
      vrijemePonude: { type: Date, default: Date.now },
      status: { 
        type: String, 
        enum: ['aktivno', 'ponisteno'], 
        default: 'aktivno' 
      },
      razlogPonistavanja: { 
        type: String, 
        enum: ['Tipfeler greška', 'Prodavač izmijenio opis ili stanje artikla'], 
        default: null 
      },
      vrijemePonistavanja: { type: Date, default: null }
    }
  ],
  
  // TAB 2: DISKUSIJA
  diskusija: [
    {
      korisnik: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      tekst: { type: String, required: true, trim: true },
      vrijemeKomentara: { type: Date, default: Date.now }
    }
  ],
  
  // STATUS & AUTOMATIZACIJA
  status: { 
    type: String, 
    enum: ['aktivno', 'prodato', 'isteklo', 'zavrseno'], 
    default: 'aktivno' 
  },
  pobjednik: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  
  obavjestenjePoslano: { type: Boolean, default: false }
}, { timestamps: true });

// Pre-save hook: Automatsko postavljanje trenutne cijene pri kreiranju
auctionSchema.pre('save', function(next) {
  if (this.isNew && this.tipProdaje !== 'fiksno') {
    if (!this.trenutnaCijena || this.trenutnaCijena === 0) {
      this.trenutnaCijena = this.pocetnaCijena;
    }
  }
  next();
});

// Indeksi za optimizaciju upita
auctionSchema.index({ status: 1, trajanjeDo: 1 });
auctionSchema.index({ kategorija: 1, status: 1 });
auctionSchema.index({ prodavac: 1 });

const Auction = mongoose.model('Auction', auctionSchema);

export default Auction;