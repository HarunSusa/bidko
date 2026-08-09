import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  ime: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  lozinka: { type: String, required: true },
  telefon: { type: String, required: true, unique: true },
  isAdmin: { type: Boolean, default: false },
  
  // VERIFIKACIJA RAČUNA (E-mail)
  isVerifikovan: { type: Boolean, default: false },
  verifikacijskiKod: { type: String, default: null },
  kodIstice: { type: Date, default: null },
  
  // SISTEM REPUTACIJE
  kazneniPoeni: { type: Number, default: 0 }, // Ako stigne do 3 -> BAN
  isBanovan: { type: Boolean, default: false },
  
  datumRegistracije: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;