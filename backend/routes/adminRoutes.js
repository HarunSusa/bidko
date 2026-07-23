import express from 'express';
import User from '../models/User.js';
import Aukcija from '../models/Auction.js'; 
import { zastitiRutu } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// 1. Dohvati sve korisnike
router.get('/korisnici', zastitiRutu, adminOnly, async (req, res) => {
  try {
    const korisnici = await User.find().select('-lozinka');
    res.json(korisnici);
  } catch (err) {
    res.status(500).json({ poruka: 'Greška pri dohvaćanju korisnika.' });
  }
});

// 2. Obriši korisnika
router.delete('/korisnici/:id', zastitiRutu, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    // Obriši i sve njegove aukcije
    await Aukcija.deleteMany({ prodavac: req.params.id });
    res.json({ poruka: 'Korisnik i njegove aukcije su obrisani.' });
  } catch (err) {
    res.status(500).json({ poruka: 'Greška pri brisanju korisnika.' });
  }
});

export default router;